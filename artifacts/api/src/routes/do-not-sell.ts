import { Router } from "express";
import { z } from "zod";
import { getTenantPool } from "../db/tenant.js";

/**
 * Minimal shape we consume off `fetch()`. Same shim used in agent-contact.ts
 * and sell-property-notify.ts to keep Vercel's TS resolution from breaking
 * the build when it picks a Response type without .ok/.text/.status.
 */
interface HttpResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

const router = Router({ mergeParams: true });

/**
 * CCPA / CPRA privacy request notifications from the /do-not-sell page.
 * Recipient is the tenant's `agent_contact_email` (the single "tenant email"
 * key served by the preferences endpoint), with env-var catch-all fallback.
 * FROM is a global address (AGENT_CONTACT_FROM_EMAIL) shared across every
 * TDR form / auth / notification.
 *
 * No audit write here — the frontend already inserts the durable row into
 * public.ccpa_requests before hitting this endpoint.
 */

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  state: z.string().optional(),
  request_type: z.enum(["opt_out", "know", "delete", "correct", "limit"]),
  details: z.string().optional(),
});

const TABLE = process.env.PREFERENCES_TABLE ?? "sys.buyer_preferences";
const COLUMN = process.env.PREFERENCES_COLUMN ?? "preferences";

interface BuyersHookField {
  key?: string;
  value?: string;
}
interface BuyersHookSection {
  fields?: BuyersHookField[];
}

async function readTenantCustomField(
  tenant: string,
  key: string,
): Promise<string | null> {
  const pool = getTenantPool(tenant);
  if (!pool) return null;
  try {
    const { rows } = await pool.query(
      `SELECT ${COLUMN} AS prefs FROM ${TABLE} LIMIT 1`,
    );
    const prefs = rows[0]?.prefs as Record<string, unknown> | null | undefined;
    const parsed =
      typeof prefs === "string"
        ? (JSON.parse(prefs) as Record<string, unknown>)
        : prefs ?? {};
    const sections = parsed?.sections as BuyersHookSection[] | undefined;
    if (!Array.isArray(sections)) return null;
    for (const section of sections) {
      const fields = Array.isArray(section?.fields) ? section.fields : [];
      const hit = fields.find((f) => f?.key === key);
      if (hit && typeof hit.value === "string" && hit.value.trim()) {
        return hit.value.trim();
      }
    }
    return null;
  } catch (err) {
    console.warn(
      `[do-not-sell] failed reading ${key} for tenant=${tenant}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const REQUEST_TYPE_LABELS: Record<
  z.infer<typeof bodySchema>["request_type"],
  string
> = {
  opt_out: "Opt out of sale / sharing",
  know: "Right to know",
  delete: "Delete personal information",
  correct: "Correct personal information",
  limit: "Limit use of sensitive information",
};

function renderEmailBody(payload: z.infer<typeof bodySchema> & { tenant: string }) {
  const label = REQUEST_TYPE_LABELS[payload.request_type];
  const detailsText = payload.details?.trim()
    ? `\n\nAdditional details:\n${payload.details.trim()}`
    : "";

  const text = `New CCPA / CPRA privacy request — ${label}

Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone ?? "(not provided)"}
State: ${payload.state ?? "(not provided)"}
Request type: ${label}
Tenant: ${payload.tenant}${detailsText}

You must respond to the requester within 45 days as required by
California law (CCPA/CPRA, Cal. Civ. Code § 1798.130).
`;

  const detailsBlock = payload.details?.trim()
    ? `<p style="margin:16px 0 4px;font-size:14px;color:#0F2C4B;"><strong>Additional details:</strong></p>
       <p style="margin:0;font-size:14px;color:#4a5568;white-space:pre-wrap;">${escapeHtml(payload.details.trim())}</p>`
    : "";

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f9;padding:24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <tr><td style="background:#0F2C4B;color:#fff;padding:20px 24px;font-size:18px;font-weight:700;">New CCPA / CPRA privacy request</td></tr>
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 12px;font-size:16px;color:#0F2C4B;"><strong>${escapeHtml(label)}</strong></p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:#4a5568;">
        <tr><td style="padding:4px 0;width:120px;"><strong>Name:</strong></td><td>${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email:</strong></td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
        <tr><td style="padding:4px 0;"><strong>Phone:</strong></td><td>${payload.phone ? `<a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a>` : "(not provided)"}</td></tr>
        <tr><td style="padding:4px 0;"><strong>State:</strong></td><td>${escapeHtml(payload.state ?? "(not provided)")}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Tenant:</strong></td><td>${escapeHtml(payload.tenant)}</td></tr>
      </table>

      ${detailsBlock}

      <hr style="border:0;border-top:1px solid #e5e7eb;margin:20px 0;" />
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        You must respond to this requester within 45 days as required by
        California law (CCPA / CPRA, Cal. Civ. Code § 1798.130). The requester
        has attested under penalty of perjury.
      </p>
    </td></tr>
  </table>
</body></html>`;

  return { text, html };
}

async function sendResendEmail(opts: {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    const res = (await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        reply_to: opts.replyTo ? [opts.replyTo] : undefined,
      }),
    })) as HttpResponseLike;
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `resend ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "resend failed" };
  }
}

router.post("/", async (req, res, next) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_body",
        details: parsed.error.flatten(),
      });
    }
    const body = parsed.data;
    const tenant = (req.params as { tenant: string }).tenant;

    // Single "tenant email" — the agent_contact_email key served through the
    // preferences endpoint. Env catch-all only if the tenant hasn't set it.
    const agentRecipient = await readTenantCustomField(tenant, "agent_contact_email");
    const catchAllRecipient = process.env.AGENT_CONTACT_FALLBACK_EMAIL;
    const to = agentRecipient || catchAllRecipient || "";

    const from = process.env.AGENT_CONTACT_FROM_EMAIL;
    if (!from) {
      return res.status(500).json({
        error: "missing_from",
        message: "AGENT_CONTACT_FROM_EMAIL not configured on the API",
      });
    }
    if (!to) {
      return res.status(202).json({
        emailed: false,
        reason: "no recipient configured for this tenant",
      });
    }

    const { text, html } = renderEmailBody({ ...body, tenant });
    const subject = `CCPA / CPRA privacy request — ${REQUEST_TYPE_LABELS[body.request_type]}`;
    const emailResult = await sendResendEmail({
      to,
      from,
      subject,
      text,
      html,
      replyTo: body.email,
    });

    if (!emailResult.ok) {
      console.error(
        `[do-not-sell] email failed for tenant=${tenant}:`,
        emailResult.error,
      );
      return res.status(502).json({
        emailed: false,
        error: emailResult.error,
      });
    }

    return res.status(200).json({ emailed: true });
  } catch (err) {
    next(err);
  }
});

export default router;
