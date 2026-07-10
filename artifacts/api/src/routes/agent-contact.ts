import { Router } from "express";
import { z } from "zod";
import { getTenantPool } from "../db/tenant.js";

/**
 * Minimal shape we consume off `fetch()`. Named to avoid resolving to
 * whichever `Response` type TypeScript happens to find in the ambient
 * environment (Vercel's build has occasionally picked a version that's
 * missing `.ok`/`.text`/`.status`, causing the TDR API build to fail
 * even though the same code compiles locally). This keeps us decoupled
 * from that resolution.
 */
interface HttpResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

const router = Router({ mergeParams: true });

/**
 * Buyer inquiry submissions from the property-page "Contact a buyer's agent"
 * form. Handles two side effects in parallel:
 *
 *   1. Email the tenant's configured recipient (from Buyers Hook
 *      `custom_fields[].agent_contact_email`, fallback `primary_email`)
 *      via Resend's HTTPS API.
 *   2. Write an audit row into Supabase `agent_contact_requests` so the
 *      tenant's CRM / analytics has a durable record even if the email
 *      bounces later.
 *
 * Either failure is reported to the client — the frontend decides how to
 * react (retry, silent success, toast).
 */

const bodySchema = z.object({
  listing_id: z.string().min(1),
  property_address: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  message: z.string().optional(),
  is_military: z.boolean().optional(),
});

const TABLE = process.env.PREFERENCES_TABLE ?? "sys.buyer_preferences";
const COLUMN = process.env.PREFERENCES_COLUMN ?? "preferences";

interface BuyersHookCustomField {
  key?: string;
  value?: string;
}

/** Read a specific custom_fields[] entry from the tenant's Buyers Hook row. */
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
    const fields = parsed?.custom_fields as BuyersHookCustomField[] | undefined;
    if (!Array.isArray(fields)) return null;
    const hit = fields.find((f) => f?.key === key);
    return typeof hit?.value === "string" && hit.value.trim()
      ? hit.value.trim()
      : null;
  } catch (err) {
    console.warn(
      `[agent-contact] failed reading ${key} for tenant=${tenant}:`,
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

/** Build the inquiry email — plaintext + HTML. */
function renderEmailBody(payload: {
  listing_id: string;
  property_address?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  is_military?: boolean;
  tenant: string;
  origin?: string;
}) {
  const address = payload.property_address ?? "(address unknown)";
  const messageBlock = payload.message?.trim()
    ? `\n\nMessage from buyer:\n${payload.message.trim()}`
    : "\n\n(no message)";
  const listingUrl = payload.origin
    ? `${payload.origin.replace(/\/$/, "")}/property/${payload.listing_id}`
    : `/property/${payload.listing_id}`;

  const text = `New buyer inquiry — ${address}

Buyer: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
Military status: ${payload.is_military ? "Yes" : "No"}
Tenant: ${payload.tenant}
Listing: ${listingUrl}${messageBlock}
`;

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f9;padding:24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <tr><td style="background:#0F2C4B;color:#fff;padding:20px 24px;font-size:18px;font-weight:700;">New buyer inquiry</td></tr>
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 16px;font-size:15px;color:#0F2C4B;"><strong>Property:</strong> ${escapeHtml(address)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:#4a5568;">
        <tr><td style="padding:4px 0;"><strong>Name:</strong></td><td>${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email:</strong></td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
        <tr><td style="padding:4px 0;"><strong>Phone:</strong></td><td><a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a></td></tr>
        <tr><td style="padding:4px 0;"><strong>Military:</strong></td><td>${payload.is_military ? "Yes" : "No"}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Tenant:</strong></td><td>${escapeHtml(payload.tenant)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Listing:</strong></td><td><a href="${escapeHtml(listingUrl)}">${escapeHtml(listingUrl)}</a></td></tr>
      </table>
      ${payload.message?.trim() ? `<p style="margin:20px 0 0;font-size:14px;color:#0F2C4B;"><strong>Message:</strong></p><p style="margin:6px 0 0;font-size:14px;color:#4a5568;white-space:pre-wrap;">${escapeHtml(payload.message.trim())}</p>` : ""}
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

async function writeSupabaseAudit(payload: {
  listing_id: string;
  property_address?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  is_military?: boolean;
  tenant: string;
}): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { ok: false, error: "SUPABASE_URL/ANON_KEY not configured" };
  }
  try {
    const res = (await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/agent_contact_requests`,
      {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          property_id: payload.listing_id,
          property_address: payload.property_address ?? null,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          message: payload.message ?? null,
          is_military: payload.is_military ?? false,
          tenant: payload.tenant,
        }),
      },
    )) as HttpResponseLike;
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        error: `supabase ${res.status}: ${detail.slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "supabase write failed",
    };
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

    // Recipient resolution: tenant admin's configured inbox first, then
    // primary email as fallback, then env-var last-resort so a
    // misconfigured tenant never silently swallows a real buyer inquiry.
    const configuredRecipient = await readTenantCustomField(
      tenant,
      "agent_contact_email",
    );
    const fallbackRecipient = await readTenantCustomField(tenant, "primary_email");
    const catchAllRecipient = process.env.AGENT_CONTACT_FALLBACK_EMAIL;
    const to =
      configuredRecipient || fallbackRecipient || catchAllRecipient || "";

    const from = process.env.AGENT_CONTACT_FROM_EMAIL;
    if (!from) {
      return res.status(500).json({
        error: "missing_from",
        message: "AGENT_CONTACT_FROM_EMAIL not configured on the API",
      });
    }

    if (!to) {
      // Still audit the write so the tenant isn't losing the lead entirely.
      await writeSupabaseAudit({ ...body, tenant });
      return res.status(202).json({
        audited: true,
        emailed: false,
        reason: "no recipient configured for this tenant",
      });
    }

    const origin =
      typeof req.headers.origin === "string" ? req.headers.origin : undefined;
    const { text, html } = renderEmailBody({ ...body, tenant, origin });
    const subject = `New buyer inquiry — ${body.property_address ?? body.listing_id}`;

    const [emailResult, auditResult] = await Promise.all([
      sendResendEmail({
        to,
        from,
        subject,
        text,
        html,
        replyTo: body.email,
      }),
      writeSupabaseAudit({ ...body, tenant }),
    ]);

    if (!emailResult.ok && !auditResult.ok) {
      console.error(
        `[agent-contact] both channels failed for tenant=${tenant}:`,
        emailResult.error,
        auditResult.error,
      );
      return res.status(500).json({
        error: "delivery_failed",
        email_error: emailResult.error,
        audit_error: auditResult.error,
      });
    }

    return res.status(emailResult.ok ? 200 : 202).json({
      emailed: emailResult.ok,
      audited: auditResult.ok,
      ...(emailResult.ok ? {} : { email_error: emailResult.error }),
      ...(auditResult.ok ? {} : { audit_error: auditResult.error }),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
