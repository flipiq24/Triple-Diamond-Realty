import { Router } from "express";
import { getTenantPool } from "../db/tenant.js";

const router = Router({ mergeParams: true });

// Baseline branding — merged UNDER the DB payload so any key not yet
// configured falls back to a sensible default. When Tony adds new fields
// to the JSON (fonts, spacing, hero image, etc.), they flow through
// automatically without a code or schema change.
const DEFAULTS: Record<string, unknown> = {
  logo: "",
  bg: "#0F2C4B",
  secondary_color: "#F59E0B",
  company_name: "Triple Diamond Realty",
};

// The tenant's Command DB holds a single-row config table with one jsonb
// column. Faisal owns the exact table + column names — override via env if
// they differ from the assumed defaults.
const TABLE = process.env.PREFERENCES_TABLE ?? "sys.buyer_preferences";
const COLUMN = process.env.PREFERENCES_COLUMN ?? "preferences";

router.get("/", async (req, res, next) => {
  try {
    const { tenant } = req.params as { tenant: string };
    const pool = getTenantPool(tenant);

    if (!pool) {
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

      return res.json({
        preferences: { ...DEFAULTS, ...parsed },
      });
    } catch (err) {
      // Table doesn't exist yet, or column name differs. Return defaults.
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
