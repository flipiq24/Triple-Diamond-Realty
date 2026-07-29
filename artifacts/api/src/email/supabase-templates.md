# Supabase auth email templates (tenant-branded)

Paste each block into **Supabase Dashboard → Authentication → Emails → Templates → [tab]**. Placeholders like `{{ .ConfirmationURL }}` and `{{ .Data.company_name }}` are Supabase's Go template syntax — leave them exactly as-is.

## How the tenant name gets into the email

Supabase Auth uses [Go's `text/template`](https://pkg.go.dev/text/template) engine (per the [official docs](https://supabase.com/docs/guides/auth/auth-email-templates)). The variables it exposes to every template:

| Variable | What it is |
|---|---|
| `{{ .ConfirmationURL }}` | The confirm / sign-in / reset link |
| `{{ .Token }}` | 6-digit OTP |
| `{{ .TokenHash }}` | Hashed token for custom links |
| `{{ .SiteURL }}` | The Site URL configured under Auth → URL Configuration |
| `{{ .RedirectTo }}` | The `emailRedirectTo` value passed on the FE call |
| `{{ .Email }}` | The user's email |
| `{{ .NewEmail }}` | (email-change template only) the new address |
| `{{ .Data }}` | The user's `auth.users.user_metadata` object |

Dot-drilling into `.Data` is officially supported — Supabase's docs use `{{ if eq .Data.Domain "..." }}` as an example.

Our FE writes `company_name` into `user_metadata` on every `signInWithOtp`:

```ts
supabase.auth.signInWithOtp({
  email,
  options: {
    data: { tenant: TENANT_NAME, company_name: <companyName> },
    emailRedirectTo,
  },
});
```

**But** password reset (`resetPasswordForEmail`), admin-invite, and other flows may fire without touching `user_metadata`. In those cases `.Data.company_name` renders empty. Every template below wraps the reference in an `{{ if }}` guard so the "Buyers" wordmark still reads cleanly (no leading space, no orphaned punctuation) when the value is missing.

Pattern:
```html
{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers
```
- `company_name = "Triple Diamond Realty"` → `Triple Diamond Realty Buyers`
- `company_name` unset → `Buyers`

**Sender config** (Auth → Emails → SMTP):
- Sender email: `noreply@buyers.flipiq.com`
- Sender name: `Buyers` — Supabase's sender-name field is static per project, so we keep it generic. The body header shows the dynamic `<Company> Buyers` brand instead.

---

## 1. Magic Link

**Subject:** `Your sign-in link · {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Your sign-in link</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#F7F8FA;color:#1F2937;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#F7F8FA;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Your one-time sign-in link for {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers — expires in 60 minutes.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(15,31,59,0.08);">
          <tr>
            <td style="background:#0F1F3B;padding:22px 28px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:#ffffff;line-height:1;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}<span style="color:#FF6600;">Buyers</span></span>
            </td>
          </tr>
          <tr><td style="height:4px;background:#FF6600;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0F1F3B;letter-spacing:-.3px;line-height:1.25;">Your sign-in link</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.55;">
                Click below to sign in to {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers. This link expires in 60 minutes and can only be used once.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#FF6600;border-radius:8px;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Sign in &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#6B7280;">Or paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:12px;color:#9CA3AF;word-break:break-all;line-height:1.5;">{{ .ConfirmationURL }}</p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.5;">
                If you didn't request this, you can safely ignore it — no account is created without a click.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Sent by <strong style="color:#6B7280;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</strong>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Questions? Reply to this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:10px;color:#9CA3AF;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Confirm Signup

**Subject:** `Confirm your account · {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Confirm your account</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#F7F8FA;color:#1F2937;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#F7F8FA;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Welcome to {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers — confirm your email to unlock verified-buyer access.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(15,31,59,0.08);">
          <tr>
            <td style="background:#0F1F3B;padding:22px 28px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:#ffffff;line-height:1;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}<span style="color:#FF6600;">Buyers</span></span>
            </td>
          </tr>
          <tr><td style="height:4px;background:#FF6600;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0F1F3B;letter-spacing:-.3px;line-height:1.25;">Welcome to {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</h1>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.55;">
                Confirm your email to unlock verified-buyer access — exact addresses on off-market properties, saved deals, and the ability to post your own off-market listings.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 18px;font-size:13px;color:#4B5563;line-height:1.6;">
                    <p style="margin:0 0 8px;font-weight:700;color:#0F1F3B;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">What you get</p>
                    &#10003; Deal alerts before they hit the MLS<br>
                    &#10003; Comps, ARV, and rehab scope on every listing<br>
                    &#10003; Post off-market properties from your account<br>
                    &#10003; Save deals to your buyer profile
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#FF6600;border-radius:8px;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Confirm my account &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#6B7280;">Or paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:12px;color:#9CA3AF;word-break:break-all;line-height:1.5;">{{ .ConfirmationURL }}</p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.5;">
                If you didn't create a{{ if .Data.company_name }} {{ .Data.company_name }}{{ end }} Buyers account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Sent by <strong style="color:#6B7280;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</strong>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Questions? Reply to this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:10px;color:#9CA3AF;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Reset Password

**Subject:** `Reset your password · {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#F7F8FA;color:#1F2937;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#F7F8FA;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Reset your {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers password — link expires in 60 minutes.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(15,31,59,0.08);">
          <tr>
            <td style="background:#0F1F3B;padding:22px 28px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:#ffffff;line-height:1;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}<span style="color:#FF6600;">Buyers</span></span>
            </td>
          </tr>
          <tr><td style="height:4px;background:#FF6600;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0F1F3B;letter-spacing:-.3px;line-height:1.25;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.55;">
                Someone asked to reset the password on your {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers account. If it was you, click below to set a new password. This link expires in 60 minutes.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#FF6600;border-radius:8px;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Reset password &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#6B7280;">Or paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:12px;color:#9CA3AF;word-break:break-all;line-height:1.5;">{{ .ConfirmationURL }}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF7ED;border-left:3px solid #FF6600;border-radius:6px;margin:0 0 8px;">
                <tr>
                  <td style="padding:12px 14px;font-size:12px;color:#7C2D12;line-height:1.55;">
                    <strong style="color:#0F1F3B;">Didn't request this?</strong> Your current password still works — just ignore this email. Your account is safe.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Sent by <strong style="color:#6B7280;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</strong>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Questions? Reply to this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:10px;color:#9CA3AF;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Change Email Address

**Subject:** `Confirm your new email · {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Confirm your new email</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#F7F8FA;color:#1F2937;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#F7F8FA;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Confirm your new email address on {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(15,31,59,0.08);">
          <tr>
            <td style="background:#0F1F3B;padding:22px 28px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:#ffffff;line-height:1;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}<span style="color:#FF6600;">Buyers</span></span>
            </td>
          </tr>
          <tr><td style="height:4px;background:#FF6600;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0F1F3B;letter-spacing:-.3px;line-height:1.25;">Confirm your new email</h1>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.55;">
                Your {{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers account email is being changed. Click below to confirm the new address.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;">Old email</p>
                    <p style="margin:0 0 14px;font-size:14px;color:#9CA3AF;text-decoration:line-through;">{{ .Email }}</p>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;">New email</p>
                    <p style="margin:0;font-size:15px;color:#0F1F3B;font-weight:700;">{{ .NewEmail }}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#FF6600;border-radius:8px;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Confirm new email &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#6B7280;">Or paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:12px;color:#9CA3AF;word-break:break-all;line-height:1.5;">{{ .ConfirmationURL }}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF7ED;border-left:3px solid #FF6600;border-radius:6px;margin:0 0 8px;">
                <tr>
                  <td style="padding:12px 14px;font-size:12px;color:#7C2D12;line-height:1.55;">
                    <strong style="color:#0F1F3B;">Didn't request this?</strong> Your email stays unchanged until you click the button above. If you didn't ask to change it, ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Sent by <strong style="color:#6B7280;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</strong>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                Questions? Reply to this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:10px;color:#9CA3AF;">{{ if .Data.company_name }}{{ .Data.company_name }} {{ end }}Buyers</p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## URL configuration (also in Supabase)

**Auth → URL Configuration**:
- **Site URL:** `https://buyers.command.flipiq.com`
- **Additional Redirect URLs** (comma-separated):
  - `https://buyers.command.flipiq.com/**`
  - `https://*.buyers.flipiq.com/**` (future-proof for more tenants)
  - `http://localhost:4001/**` (local dev)
  - `http://localhost:3000/**` (local dev — TDR fe on 3000 during demos)

Without these, magic-link clicks land on a Supabase "URL not allowed" error.
