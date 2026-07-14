import { Router } from "express";
import { z } from "zod";
import { getTenantPool } from "../db/tenant.js";
import { wrapEmail, escapeHtml } from "../email/template.js";

/**
 * Minimal shape we consume off `fetch()`. Mirrors the shim used in
 * agent-contact.ts so the Vercel build (which occasionally picks a Response
 * type without .ok/.text/.status) doesn't break TS compilation.
 */
interface HttpResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

const router = Router({ mergeParams: true });

/**
 * Notifies the tenant admin when a buyer posts a property via the
 * /sell-property form. Recipient resolution matches the agent-contact
 * route: `agent_contact_email` → `primary_email` → env fallback. The row
 * itself is written by the frontend directly into Supabase (RLS-scoped);
 * this endpoint's job is purely the Resend email.
 */

const bodySchema = z.object({
  listing_id: z.string().min(1),
  address: z.string().min(1),
  asking_price: z.number().nullable().optional(),
  description: z.string().optional(),
  showing_instructions: z.string().optional(),
  photo_urls: z.array(z.string()).optional(),
  photo_link: z.string().optional(),
  seller_role: z.enum(["seller", "wholesaler", "agent"]),
  has_contract: z.union([z.literal("yes"), z.literal("no")]).optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
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
      `[sell-property-notify] failed reading ${key} for tenant=${tenant}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

function formatMoney(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "(not provided)";
  try {
    return `$${Number(n).toLocaleString("en-US")}`;
  } catch {
    return `$${n}`;
  }
}

function renderEmailBody(payload: z.infer<typeof bodySchema> & { tenant: string }) {
  const priceLine = formatMoney(payload.asking_price ?? null);
  const photosCount = payload.photo_urls?.length ?? 0;

  const photosBlock =
    photosCount > 0
      ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0F1F3B;text-transform:uppercase;letter-spacing:.5px;">Uploaded photos (${photosCount})</p>
         <ul style="margin:0 0 20px;padding-left:20px;font-size:13px;line-height:1.5;">
           ${payload
             .photo_urls!.map(
               (u) =>
                 `<li style="margin:2px 0;"><a href="${escapeHtml(u)}" style="color:#FF6600;text-decoration:none;word-break:break-all;">${escapeHtml(u)}</a></li>`,
             )
             .join("")}
         </ul>`
      : "";

  const linkBlock = payload.photo_link
    ? `<p style="margin:0 0 20px;font-size:14px;color:#374151;"><strong style="color:#0F1F3B;">Photos link:</strong> <a href="${escapeHtml(payload.photo_link)}" style="color:#FF6600;text-decoration:none;word-break:break-all;">${escapeHtml(payload.photo_link)}</a></p>`
    : "";

  const descBlock = payload.description?.trim()
    ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0F1F3B;text-transform:uppercase;letter-spacing:.5px;">Description</p>
       <div style="background:#F9FAFB;border:1px solid #E5E7EB;padding:14px 16px;border-radius:8px;font-size:14px;color:#374151;line-height:1.55;white-space:pre-wrap;margin:0 0 20px;">${escapeHtml(payload.description.trim())}</div>`
    : "";

  const showBlock = payload.showing_instructions?.trim()
    ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0F1F3B;text-transform:uppercase;letter-spacing:.5px;">Showing instructions</p>
       <div style="background:#FFF7ED;border-left:3px solid #FF6600;padding:14px 16px;border-radius:6px;font-size:14px;color:#374151;line-height:1.55;white-space:pre-wrap;margin:0 0 20px;">${escapeHtml(payload.showing_instructions.trim())}</div>`
    : "";

  const contentText = `${payload.address}

Asking price: ${priceLine}
Role: ${payload.seller_role}${payload.has_contract ? ` (has contract: ${payload.has_contract})` : ""}

Seller:
  Name:  ${payload.name}
  Email: ${payload.email}
  Phone: ${payload.phone}

${payload.description ? `Description:\n${payload.description}\n\n` : ""}${payload.showing_instructions ? `Showing:\n${payload.showing_instructions}\n\n` : ""}${photosCount > 0 ? `Photos (${photosCount}):\n${payload.photo_urls!.join("\n")}\n\n` : ""}${payload.photo_link ? `Photos link: ${payload.photo_link}\n\n` : ""}Listing id: ${payload.listing_id}`;

  const contentHtml = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0F1F3B;line-height:1.35;">
      ${escapeHtml(payload.address)}
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#4B5563;">
            <tr>
              <td style="padding:5px 0;width:110px;font-weight:600;color:#6B7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Asking price</td>
              <td style="padding:5px 0;color:#0F1F3B;font-weight:700;font-size:16px;">${escapeHtml(priceLine)}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-weight:600;color:#6B7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Seller role</td>
              <td style="padding:5px 0;color:#4B5563;text-transform:capitalize;">${escapeHtml(payload.seller_role)}${payload.has_contract ? ` &middot; <span style="color:#6B7280;">contract: ${escapeHtml(payload.has_contract)}</span>` : ""}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0F1F3B;text-transform:uppercase;letter-spacing:.5px;">Seller contact</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#4B5563;">
            <tr><td style="padding:4px 0;width:70px;color:#6B7280;font-weight:600;">Name</td><td style="padding:4px 0;color:#0F1F3B;font-weight:600;">${escapeHtml(payload.name)}</td></tr>
            <tr><td style="padding:4px 0;color:#6B7280;font-weight:600;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(payload.email)}" style="color:#FF6600;text-decoration:none;">${escapeHtml(payload.email)}</a></td></tr>
            <tr><td style="padding:4px 0;color:#6B7280;font-weight:600;">Phone</td><td style="padding:4px 0;"><a href="tel:${escapeHtml(payload.phone)}" style="color:#FF6600;text-decoration:none;">${escapeHtml(payload.phone)}</a></td></tr>
          </table>
        </td>
      </tr>
    </table>

    ${descBlock}
    ${showBlock}
    ${photosBlock}
    ${linkBlock}

    <p style="margin:24px 0 0;font-size:10px;color:#9CA3AF;">Listing id: <code style="font-family:'SF Mono',Consolas,Monaco,monospace;">${escapeHtml(payload.listing_id)}</code></p>
  `;

  return wrapEmail({
    preheader: `${payload.address} — ${priceLine}`,
    title: "New off-market property submission",
    tenant: payload.tenant,
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

    const configuredRecipient = await readTenantCustomField(
      tenant,
      "agent_contact_email",
    );
    const fallbackRecipient = await readTenantCustomField(tenant, "primary_email");
    const catchAllRecipient = process.env.AGENT_CONTACT_FALLBACK_EMAIL;
    const to = configuredRecipient || fallbackRecipient || catchAllRecipient || "";

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
    const subject = `New off-market property submission — ${body.address}`;
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
        `[sell-property-notify] email failed for tenant=${tenant}:`,
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
