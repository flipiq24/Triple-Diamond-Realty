import { Router } from "express";
import { z } from "zod";
import { getTenantPool } from "../db/tenant.js";
import { wrapEmail, escapeHtml, buyersBrandName } from "../email/template.js";

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

/**
 * Read a specific field value from the tenant's Buyers Hook row by key.
 * Post migration 1952 the shape is `{ sections: [{ fields: [{key,value}] }] }`.
 * First hit across all sections wins, matching the frontend's
 * `useTenantCustomField` walk order.
 */
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
      `[agent-contact] failed reading ${key} for tenant=${tenant}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/** Build the inquiry email using the shared FlipIQ shell. */
function renderEmailBody(payload: {
  listing_id: string;
  property_address?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  tenant: string;
  companyName?: string;
  origin?: string;
}) {
  const address = payload.property_address ?? "(address unknown)";
  const messageBlock = payload.message?.trim()
    ? `\n\nMessage from buyer:\n${payload.message.trim()}`
    : "\n\n(no message)";
  const listingUrl = payload.origin
    ? `${payload.origin.replace(/\/$/, "")}/property/${payload.listing_id}`
    : `/property/${payload.listing_id}`;

  const contentText = `A buyer just reached out about ${address}.

Buyer: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
Listing: ${listingUrl}${messageBlock}`;

  const contentHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.55;">
      A buyer just reached out about <strong style="color:#0F1F3B;">${escapeHtml(address)}</strong>. Details below — reply directly to this email to reach them.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#4B5563;">
            <tr><td style="padding:5px 0;width:80px;font-weight:600;color:#6B7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Name</td><td style="padding:5px 0;color:#0F1F3B;font-weight:600;">${escapeHtml(payload.name)}</td></tr>
            <tr><td style="padding:5px 0;font-weight:600;color:#6B7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Email</td><td style="padding:5px 0;"><a href="mailto:${escapeHtml(payload.email)}" style="color:#FF6600;text-decoration:none;">${escapeHtml(payload.email)}</a></td></tr>
            <tr><td style="padding:5px 0;font-weight:600;color:#6B7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Phone</td><td style="padding:5px 0;"><a href="tel:${escapeHtml(payload.phone)}" style="color:#FF6600;text-decoration:none;">${escapeHtml(payload.phone)}</a></td></tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      payload.message?.trim()
        ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0F1F3B;text-transform:uppercase;letter-spacing:.5px;">Message from buyer</p>
           <div style="background:#FFF7ED;border-left:3px solid #FF6600;padding:14px 16px;border-radius:6px;font-size:14px;color:#374151;line-height:1.55;white-space:pre-wrap;margin:0 0 20px;">${escapeHtml(payload.message.trim())}</div>`
        : ""
    }

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px;">
      <tr>
        <td style="background:#FF6600;border-radius:8px;">
          <a href="${escapeHtml(listingUrl)}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">View listing &rarr;</a>
        </td>
      </tr>
    </table>
  `;

  return wrapEmail({
    preheader: `${payload.name} asked about ${address}`,
    title: "New buyer inquiry",
    tenant: payload.tenant,
    companyName: payload.companyName,
    contentHtml,
    contentText,
  });
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

    // Company name drives the "<Company> Buyers" display in both the FROM
    // header and the email body wordmark. Falls back to just "Buyers".
    const companyName =
      (await readTenantCustomField(tenant, "company_name")) ?? undefined;
    const brandName = buyersBrandName(companyName);

    const fromEmail = process.env.AGENT_CONTACT_FROM_EMAIL;
    if (!fromEmail) {
      return res.status(500).json({
        error: "missing_from",
        message: "AGENT_CONTACT_FROM_EMAIL not configured on the API",
      });
    }
    const from = `${brandName} <${fromEmail}>`;

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
    const { text, html } = renderEmailBody({ ...body, tenant, companyName, origin });
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
