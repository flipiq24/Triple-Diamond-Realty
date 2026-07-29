/**
 * Tenant-branded email shell used by every Resend send from this API.
 *
 * Header wordmark: "<CompanyName> <span style=orange>Buyers</span>" — the
 * company name comes from Buyers Hook `company_name` preference, orange
 * "Buyers" suffix stays consistent across tenants. Falls back to just
 * "Buyers" when company_name isn't available (fresh tenant with no
 * preferences seeded yet).
 *
 * Body: white card on soft-gray page, orange 4px accent stripe under
 * the header. Footer says "Sent by <CompanyName> Buyers".
 *
 * Every route (agent-contact, do-not-sell, sell-property-notify) hands
 * over just its content plus the tenant's companyName — one place to
 * change the look for the whole suite.
 *
 * Colors:
 *   - Deep navy #0F1F3B (header background)
 *   - FlipIQ orange #FF6600 (accent, "Buyers" suffix, stripe)
 *   - Neutral grays for text hierarchy
 *
 * Table-based layout for maximum email-client compatibility (Outlook,
 * Gmail iOS, Apple Mail, corporate Exchange). Inline styles only — no
 * <style> block since some clients strip <head>.
 */

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Build the "<CompanyName> Buyers" display name used for both the FROM
 * header and the visible wordmark. Trims + falls back cleanly.
 */
export function buyersBrandName(companyName?: string | null): string {
  const trimmed = (companyName ?? "").trim();
  return trimmed ? `${trimmed} Buyers` : "Buyers";
}

export interface EmailShellOpts {
  /** Hidden inbox-preview text shown in the mail-list row. */
  preheader?: string;
  /** Big title inside the body card. */
  title: string;
  /** Tenant slug pinned in the header (e.g. "devcommand"). Optional. */
  tenant?: string;
  /** Company name from Buyers Hook preferences — drives brand display. */
  companyName?: string;
  /** Inner HTML inside the body card, below the title. */
  contentHtml: string;
  /** Plain-text equivalent for the multipart alternative. */
  contentText: string;
}

export function wrapEmail(opts: EmailShellOpts): { html: string; text: string } {
  const preheader = opts.preheader ? escapeHtml(opts.preheader) : "";
  const title = escapeHtml(opts.title);
  const tenantLabel = opts.tenant ? escapeHtml(opts.tenant.toUpperCase()) : "";
  const tenantFooter = opts.tenant
    ? ` &middot; Tenant: <span style="color:#6B7280;">${escapeHtml(opts.tenant)}</span>`
    : "";

  // Split the wordmark into "<Company>" + "Buyers" so the orange accent
  // stays on the fixed "Buyers" suffix regardless of what the company
  // name is. Escape company name because it's admin-controlled string.
  const companyEscaped = escapeHtml((opts.companyName ?? "").trim());
  const companyBlock = companyEscaped ? `${companyEscaped} ` : "";
  const brandNameText = buyersBrandName(opts.companyName);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#F7F8FA;color:#1F2937;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#F7F8FA;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(15,31,59,0.08);">

          <tr>
            <td style="background:#0F1F3B;padding:22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <span style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:#ffffff;line-height:1;">
                      ${companyBlock}<span style="color:#FF6600;">Buyers</span>
                    </span>
                  </td>
                  <td valign="middle" align="right" style="font-size:10px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">
                    ${tenantLabel}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:4px;background:#FF6600;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>

          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0F1F3B;letter-spacing:-.3px;line-height:1.25;">${title}</h1>
              ${opts.contentHtml}
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 28px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Sent by <strong style="color:#6B7280;">${escapeHtml(brandNameText)}</strong>${tenantFooter}
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                You are receiving this because your account is configured to receive buyer notifications. Manage preferences in your Command dashboard.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 0;font-size:10px;color:#9CA3AF;">${escapeHtml(brandNameText)} &middot; buyers.flipiq.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const rule = "=".repeat(Math.min(opts.title.length, 60));
  const tenantTextLine = opts.tenant ? `Tenant: ${opts.tenant}\n` : "";
  const text = `${opts.title}
${rule}

${opts.contentText}

—
${brandNameText}
${tenantTextLine}buyers.flipiq.com
`;

  return { html, text };
}
