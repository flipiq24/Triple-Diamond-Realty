/**
 * FlipIQ-branded email shell used by every Resend send from this API.
 *
 * Header: navy background, "FlipIQ" wordmark with orange "IQ" accent,
 * tenant slug pinned right. Orange stripe underneath. Body: white card
 * on soft-gray page. Footer: subtle FlipIQ · Buyers Hub · tenant line.
 *
 * Every route (agent-contact, do-not-sell, sell-property-notify) hands
 * over just its content and gets a fully-branded shell back — one place
 * to change the look for the whole suite.
 *
 * Colors match Command's brand:
 *   - Deep navy #0F1F3B (page/header dark)
 *   - FlipIQ orange #FF6600 (accent)
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

export interface EmailShellOpts {
  /** Hidden inbox-preview text shown in the mail-list row. */
  preheader?: string;
  /** Big title inside the body card. */
  title: string;
  /** Tenant slug pinned in the header (e.g. "devcommand"). */
  tenant?: string;
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
                      Flip<span style="color:#FF6600;">IQ</span>
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
                Sent by <strong style="color:#6B7280;">FlipIQ</strong> &middot; Buyers Hub${tenantFooter}
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                You are receiving this because your account is configured to receive buyer notifications on FlipIQ. Manage preferences in your Command dashboard.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 0;font-size:10px;color:#9CA3AF;">FlipIQ &middot; buyers.flipiq.com</p>
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
FlipIQ · Buyers Hub
${tenantTextLine}buyers.flipiq.com
`;

  return { html, text };
}
