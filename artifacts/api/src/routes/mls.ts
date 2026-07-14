import { Router } from "express";
import { z } from "zod";
import { propertyDataPool } from "../db/property-data.js";
import {
  buildAddressString,
  buildStreetViewProxyUrl,
} from "../lib/street-view.js";

// mergeParams so req.params.tenant (set by the parent `/:tenant/mls` mount)
// is visible inside these handlers — needed to build the Street View proxy
// URL that goes into each row's cover_url.
const router = Router({ mergeParams: true });

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(100),
  // Parse explicit "true"/"false" strings — NOT z.coerce.boolean() which
  // treats any non-empty string (including "false") as truthy and would
  // silently apply the 24-hour firehose filter on every user search.
  last_24_hours: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => v === true || v === "true"),
  // "This Week's Top Deals" strip on the homepage passes last_week=true.
  // If both last_24_hours AND last_week are set, last_24_hours wins
  // (narrower window). Same "true"/"false" string handling as above.
  last_week: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => v === true || v === "true"),
  pricerange_from: z.coerce.number().min(0).optional(),
  pricerange_to: z.coerce.number().min(0).optional(),
  sqft_from: z.coerce.number().min(0).optional(),
  sqft_to: z.coerce.number().min(0).optional(),
  yearbuilt_from: z.coerce.number().min(1800).optional(),
  yearbuilt_to: z.coerce.number().min(1800).optional(),
  // Calendar-based list_date range. ISO date strings (YYYY-MM-DD) or full
  // ISO timestamps. Used by the search page's "Listed after / before"
  // filter and by the homepage top-deals strip once the buyer picks a
  // custom range. Takes precedence over last_24_hours / last_week when set.
  list_date_from: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  list_date_to: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  state: z.string().length(2).optional(),
  city: z.string().optional(),
  searchQuery: z.string().optional(),
  status: z.string().optional().default("ACTIVE"),
  sortColumn: z
    .enum(["list_date", "list_price", "days_on_market"])
    .default("list_date"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
});

class WhereBuilder {
  private clauses: string[] = [];
  private params: unknown[] = [];
  add(template: string, ...values: unknown[]): void {
    const startIndex = this.params.length;
    let rendered = template;
    for (let i = 0; i < values.length; i++) {
      rendered = rendered.replace("?", `$${startIndex + i + 1}`);
    }
    this.clauses.push(rendered);
    this.params.push(...values);
  }
  sql(): string {
    return this.clauses.length ? `WHERE ${this.clauses.join(" AND ")}` : "";
  }
  values(): unknown[] {
    return this.params;
  }
}

// Address autocomplete for the buyer-facing search bar. Mirrors Command's
// `GET /mls/autocomplete?q=...` behavior: min 2 chars, up to 10 hits,
// ordered by street_address. Prefix-matches the numeric portion (if any)
// against street_address to keep the btree happy, and does contains-match
// on the remaining tokens. Zip-only queries fall through to postal_code.
router.get("/autocomplete", async (req, res, next) => {
  try {
    const raw = String(req.query.q ?? "").trim();
    if (raw.length < 2) {
      return res.json({ results: [] });
    }

    // Split off a leading number (street number or zipcode) and keep the
    // remaining tokens for the address text match.
    const leadingNumMatch = raw.match(/^\s*(\d{1,6})\s*(.*)$/);
    const leadingNum = leadingNumMatch?.[1];
    const rest = (leadingNumMatch?.[2] ?? "").trim();

    const params: unknown[] = [];
    const conds: string[] = [];

    if (leadingNum && !rest) {
      // Just a number — could be a street number OR a zipcode.
      conds.push(
        `(street_address ILIKE $${params.length + 1} OR postal_code = $${params.length + 2})`,
      );
      params.push(`${leadingNum}%`, leadingNum);
    } else if (leadingNum && rest) {
      // "5365 Hillmont" → street_address starts with the number AND
      // contains each remaining token.
      conds.push(`street_address ILIKE $${params.length + 1}`);
      params.push(`${leadingNum}%`);
      for (const tok of rest.split(/\s+/).filter(Boolean)) {
        conds.push(`street_address ILIKE $${params.length + 1}`);
        params.push(`%${tok}%`);
      }
    } else {
      // Pure text — match each token against street_address; single-token
      // queries also try city so buyers can type "burbank" and get hits.
      const tokens = raw.split(/\s+/).filter(Boolean);
      if (tokens.length === 1) {
        conds.push(
          `(street_address ILIKE $${params.length + 1} OR city ILIKE $${params.length + 2})`,
        );
        params.push(`%${tokens[0]}%`, `%${tokens[0]}%`);
      } else {
        for (const tok of tokens) {
          conds.push(`street_address ILIKE $${params.length + 1}`);
          params.push(`%${tok}%`);
        }
      }
    }

    const sql = `
      SELECT
        id,
        listing_id,
        street_address AS fullstreetaddress,
        city,
        state,
        postal_code AS zipcode,
        list_price
      FROM mls.listings
      WHERE status = 'ACTIVE'
        AND ${conds.join(" AND ")}
      ORDER BY street_address ASC
      LIMIT 10
    `;

    const { rows } = await propertyDataPool.query(sql, params);
    return res.json({ results: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid query", details: parsed.error.flatten() });
    }
    const q = parsed.data;

    const wb = new WhereBuilder();
    wb.add("status = ?", q.status.toUpperCase());
    wb.add("list_price > 0");
    if (q.state) wb.add("state = ?", q.state.toUpperCase());
    if (q.pricerange_from !== undefined) wb.add("list_price >= ?", q.pricerange_from);
    if (q.pricerange_to !== undefined) wb.add("list_price <= ?", q.pricerange_to);
    if (q.sqft_from !== undefined) wb.add("sqft >= ?", q.sqft_from);
    if (q.sqft_to !== undefined) wb.add("sqft <= ?", q.sqft_to);
    if (q.yearbuilt_from !== undefined) wb.add("year_built >= ?", q.yearbuilt_from);
    if (q.yearbuilt_to !== undefined) wb.add("year_built <= ?", q.yearbuilt_to);
    if (q.city) wb.add("city ILIKE ?", `%${q.city}%`);
    if (q.searchQuery) {
      // Token-based matching so "5365 Hillmont Ave" still matches a row
      // stored as "5365 HILLMONT AVE" (or minor punctuation / spacing
      // variants). Each whitespace token must appear in the street_address,
      // OR the whole string can match city / postal_code / listing_id.
      const full = q.searchQuery.trim();
      const tokens = full.split(/\s+/).filter(Boolean);
      const streetPlaceholders: string[] = [];
      const streetParams: unknown[] = [];
      for (const tok of tokens) {
        streetPlaceholders.push("street_address ILIKE ?");
        streetParams.push(`%${tok}%`);
      }
      const streetClause = `(${streetPlaceholders.join(" AND ")})`;
      wb.add(
        `(${streetClause} OR city ILIKE ? OR postal_code ILIKE ? OR listing_id ILIKE ?)`,
        ...streetParams,
        `%${full}%`,
        `%${full}%`,
        `%${full}%`,
      );
    }
    // Explicit calendar range wins over the convenience aliases so a caller
    // that passes both a range AND last_24_hours gets the range they asked
    // for. `list_date_to` includes rows listed on the same day by extending
    // the upper bound to the end of that date (< date + 1 day).
    if (q.list_date_from) {
      wb.add("list_date >= ?::date", q.list_date_from);
    }
    if (q.list_date_to) {
      wb.add("list_date < (?::date + interval '1 day')", q.list_date_to);
    }
    if (!q.list_date_from && !q.list_date_to) {
      if (q.last_24_hours) {
        wb.add("list_date >= (current_date - interval '1 day')");
      } else if (q.last_week) {
        wb.add("list_date >= (current_date - interval '7 day')");
      }
    }

    const whereSql = wb.sql();
    const params = wb.values();
    const offset = (q.page - 1) * q.pageSize;
    const orderSql = `ORDER BY ${q.sortColumn} ${q.sortOrder} NULLS LAST`;

    const dataSql = `
      SELECT
        id,
        listing_id,
        mls_code,
        status,
        list_price,
        original_list_price,
        close_price,
        beds_count,
        baths_count,
        sqft,
        lot_size_sqft,
        year_built,
        street_address,
        city,
        state,
        postal_code,
        county,
        property_type,
        days_on_market,
        list_date,
        description,
        listing_agent,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude
      FROM mls.listings
      ${whereSql}
      ${orderSql}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const countSql = `SELECT count(*)::int AS n FROM mls.listings ${whereSql}`;

    const [rows, total] = await Promise.all([
      propertyDataPool.query(dataSql, [...params, q.pageSize, offset]),
      propertyDataPool.query(countSql, params),
    ]);

    // Attach a Street View proxy URL as `cover_url` on every row so cards
    // render real exterior imagery. See lib/street-view.ts for why we route
    // via our own proxy instead of Google directly.
    const { tenant } = req.params as { tenant: string };
    interface ListingRow {
      street_address: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      cover_url?: string | null;
      [k: string]: unknown;
    }
    const results = (rows.rows as ListingRow[]).map((r) => {
      const address = buildAddressString({
        street: r.street_address,
        city: r.city,
        state: r.state,
        zip: r.postal_code,
      });
      if (!address) return r;
      return {
        ...r,
        cover_url: buildStreetViewProxyUrl(req, tenant, address, "640x480"),
      };
    });

    return res.json({
      total: total.rows[0].n,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total.rows[0].n / q.pageSize),
      results,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
