import type { Request } from "express";

/**
 * Concatenate address parts into a single string suitable for the Street
 * View `location=` param. Returns null when every part is empty.
 *
 * Accepts either the shared property-data column names (street_address /
 * postal_code) or the tenant idx.raw_data ones (fullstreetaddress / zipcode)
 * by mapping them onto a unified shape at the call site.
 */
export function buildAddressString(fields: {
  street: string | null | undefined;
  city: string | null | undefined;
  state: string | null | undefined;
  zip: string | null | undefined;
}): string | null {
  const parts = [
    fields.street,
    fields.city,
    `${fields.state ?? ""} ${fields.zip ?? ""}`.trim(),
  ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  return parts.length > 0 ? parts.join(",") : null;
}

/**
 * Build the proxy URL that the browser will hit for a Street View image.
 * Points at `/:tenant/streetview` on THIS API — never at Google directly,
 * because Google's API keys are Website-restricted and the browser gets
 * 403 hitting `maps.googleapis.com` from any origin outside Command's
 * allowlist. `req.protocol` + `req.get('host')` produce a URL that works
 * in dev (`http://localhost:4000`) and prod (`https://…vercel.app`) — the
 * `trust proxy` setting in app.ts ensures req.protocol reflects
 * X-Forwarded-Proto behind Vercel's load balancer.
 */
export function buildStreetViewProxyUrl(
  req: Request,
  tenant: string,
  address: string,
  size = "640x480",
): string {
  const apiBase = `${req.protocol}://${req.get("host")}`;
  return `${apiBase}/${tenant}/streetview?address=${encodeURIComponent(address)}&size=${size}`;
}
