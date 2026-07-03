import { Router } from "express";
import { z } from "zod";
import { propertyDataPool } from "../db/property-data.js";

const router = Router();

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(100),
  last_24_hours: z.coerce.boolean().optional().default(false),
  pricerange_from: z.coerce.number().min(0).optional(),
  pricerange_to: z.coerce.number().min(0).optional(),
  sqft_from: z.coerce.number().min(0).optional(),
  sqft_to: z.coerce.number().min(0).optional(),
  yearbuilt_from: z.coerce.number().min(1800).optional(),
  yearbuilt_to: z.coerce.number().min(1800).optional(),
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
      const like = `%${q.searchQuery}%`;
      wb.add(
        "(street_address ILIKE ? OR city ILIKE ? OR postal_code ILIKE ? OR listing_id ILIKE ?)",
        like,
        like,
        like,
        like,
      );
    }
    if (q.last_24_hours) wb.add("list_date >= (current_date - interval '1 day')");

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

    return res.json({
      total: total.rows[0].n,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total.rows[0].n / q.pageSize),
      results: rows.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
