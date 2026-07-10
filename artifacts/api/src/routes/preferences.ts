import { Router } from "express";
import { getTenantPool } from "../db/tenant.js";

const router = Router({ mergeParams: true });

// Fallback returned when the tenant's row doesn't exist yet OR the tenant
// is out of the allowlist. Uses the sectioned shape because the frontend's
// useTenantCustomField walks preferences.sections[*].fields[*] and treats
// missing keys as "hide the block" — no more flat top-level fields since
// migration 1952000000000-RestructureBuyerPreferencesToSections.
const DEFAULTS: Record<string, unknown> = {
  sections: [],
};

// The tenant's Command DB holds a single-row config table with one jsonb
// column. Faisal owns the exact table + column names — override via env if
// they differ from the assumed defaults.
const TABLE = process.env.PREFERENCES_TABLE ?? "sys.buyer_preferences";
const COLUMN = process.env.PREFERENCES_COLUMN ?? "preferences";

router.get("/", async (req, res, next) => {
  try {
    // Preferences let a caller override the tenant via `?tenant=<slug>` —
    // useful when a deployment's domain (and thus its URL-path tenant) is
    // locked to one slug but the branding config lives in a different
    // tenant's DB (e.g. `buyers.command.flipiq.com` needs to read from
    // `devcommand`'s Buyers Hook table until Command's DB is migrated).
    // The override runs through the same slug + allowlist validation in
    // getTenantPool, so a stray `?tenant=../etc/passwd` is still rejected.
    const urlTenant = (req.params as { tenant: string }).tenant;
    const queryTenant =
      typeof req.query.tenant === "string" ? req.query.tenant.trim() : "";
    const tenant = queryTenant || urlTenant;
    const pool = getTenantPool(tenant);

    if (!pool) {
      // Tenant not in the allowlist / no DB URL configured. This is a
      // permanent client-side condition, so it's safe to return the
      // baseline defaults with 200 — the frontend can cache them.
      return res.json({ preferences: DEFAULTS });
    }

    const sql = `SELECT ${COLUMN} AS prefs FROM ${TABLE} LIMIT 1`;

    try {
      const { rows } = await pool.query(sql);
      const raw = rows[0]?.prefs as Record<string, unknown> | null | undefined;
      // pg returns jsonb as parsed object; if it came back as a string
      // (bytea or driver quirk), try to parse it.
      const parsed =
        typeof raw === "string"
          ? ((): Record<string, unknown> => {
              try {
                return JSON.parse(raw) as Record<string, unknown>;
              } catch {
                return {};
              }
            })()
          : raw ?? {};

      // Return the DB payload verbatim (rather than merging with DEFAULTS)
      // so we don't accidentally pollute a sectioned response with flat
      // top-level fields. If a legacy row is still in the flat pre-1952
      // shape, the frontend detects the missing `sections` and falls back
      // to its own local defaults instead of rendering half a site.
      return res.json({
        preferences: parsed && Object.keys(parsed).length > 0 ? parsed : DEFAULTS,
      });
    } catch (err) {
      // Transient DB failure (cold pool timeout, network hiccup, missing
      // table). Return 503 so the frontend surfaces isError and DOES NOT
      // cache this response as the tenant's real branding — otherwise the
      // buyer would see the Triple Diamond default logo for 30 minutes
      // after a single cold-start timeout, even though the tenant has
      // configured their own branding in Command.
      console.warn(
        `[preferences] tenant=${tenant} query failed:`,
        err instanceof Error ? err.message : err,
      );
      return res.status(503).json({
        error: "preferences_unavailable",
        message: "Tenant branding is temporarily unavailable. Retrying next request.",
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
