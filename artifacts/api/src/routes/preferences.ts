import { Router } from "express";
import { getTenantPool } from "../db/tenant.js";

const router = Router({ mergeParams: true });

const DEFAULTS = {
  logo: "",
  bg: "#0F2C4B",
  secondary_color: "#F59E0B",
  company_name: "Triple Diamond Realty",
} as const;

// The tenant's Command DB will expose a preferences table for buyer-site
// branding. Faisal owns the exact table/column names — override here when
// the schema is finalized. Envs let us switch table/columns without a code
// change if his naming differs from the assumed default.
const TABLE = process.env.PREFERENCES_TABLE ?? "sys.buyer_preferences";
const COL_LOGO = process.env.PREFERENCES_COL_LOGO ?? "logo";
const COL_BG = process.env.PREFERENCES_COL_BG ?? "bg";
const COL_SECONDARY = process.env.PREFERENCES_COL_SECONDARY ?? "secondary_color";
const COL_COMPANY = process.env.PREFERENCES_COL_COMPANY ?? "company_name";

router.get("/", async (req, res, next) => {
  try {
    const { tenant } = req.params as { tenant: string };
    const pool = getTenantPool(tenant);

    if (!pool) {
      return res.json({ preferences: DEFAULTS });
    }

    // Single-row config table. If Faisal's schema uses more than one row
    // per tenant (e.g. org_id scoped), we add `WHERE org_id = ?` here.
    const sql = `
      SELECT
        ${COL_LOGO}      AS logo,
        ${COL_BG}        AS bg,
        ${COL_SECONDARY} AS secondary_color,
        ${COL_COMPANY}   AS company_name
      FROM ${TABLE}
      LIMIT 1
    `;

    try {
      const { rows } = await pool.query(sql);
      const row = rows[0] as
        | { logo?: string; bg?: string; secondary_color?: string; company_name?: string }
        | undefined;
      if (!row) return res.json({ preferences: DEFAULTS });

      return res.json({
        preferences: {
          logo: row.logo ?? DEFAULTS.logo,
          bg: row.bg ?? DEFAULTS.bg,
          secondary_color: row.secondary_color ?? DEFAULTS.secondary_color,
          company_name: row.company_name ?? DEFAULTS.company_name,
        },
      });
    } catch (err) {
      // Table doesn't exist yet, or column names differ. Fall back to
      // defaults so TDR renders the site with baseline branding.
      console.warn(
        `[preferences] tenant=${tenant} query failed, using defaults:`,
        err instanceof Error ? err.message : err,
      );
      return res.json({ preferences: DEFAULTS });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
