import { Router } from "express";
import { z } from "zod";
import { propertyDataPool } from "../db/property-data.js";

const router = Router({ mergeParams: true });

const querySchema = z.object({
  radius_miles: z.coerce.number().min(0.1).max(10).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  bed_tolerance: z.coerce.number().min(0).max(3).default(1),
  bath_tolerance: z.coerce.number().min(0).max(3).default(1),
  sqft_tolerance_pct: z.coerce.number().min(0).max(100).default(30),
});

// GET /:tenant/comps/:id
// Read-only nearby-comps search against the shared property-data DB. Same
// filter logic as Command (beds/baths/sqft tolerance, radius, status
// whitelist) but sourced entirely from mls.listings — no tenant DB, no
// tier_data_join, no computed comps.
router.get("/:id", async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid query", details: parsed.error.flatten() });
    }
    const q = parsed.data;

    const { id } = req.params as { id: string };

    const subjectResult = await propertyDataPool.query(
      `SELECT id::text            AS id,
              ST_Y(location::geometry) AS latitude,
              ST_X(location::geometry) AS longitude,
              beds_count          AS bedroomstotal,
              baths_count         AS bathstotal,
              sqft                AS buildingsize,
              list_price          AS listprice
       FROM mls.listings
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    if (subjectResult.rowCount === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }
    const subject = subjectResult.rows[0] as {
      id: string;
      latitude: number | string | null;
      longitude: number | string | null;
      bedroomstotal: number | null;
      bathstotal: number | null;
      buildingsize: number | null;
      listprice: number | string | null;
    };

    if (subject.latitude == null || subject.longitude == null) {
      return res.status(422).json({
        error: "Subject has no coordinates; cannot run radius search",
      });
    }

    const beds = Number(subject.bedroomstotal);
    const baths = Number(subject.bathstotal);
    const sqft = Number(subject.buildingsize);

    const hasBeds = Number.isFinite(beds) && beds > 0;
    const hasBaths = Number.isFinite(baths) && baths > 0;
    const hasSqft = Number.isFinite(sqft) && sqft > 0;

    // mls.listings.sqft is INTEGER — round tolerance bounds to avoid
    // "invalid input syntax for type integer" from pg.
    const sqftLow = hasSqft
      ? Math.round(sqft * (1 - q.sqft_tolerance_pct / 100))
      : 0;
    const sqftHigh = hasSqft
      ? Math.round(sqft * (1 + q.sqft_tolerance_pct / 100))
      : 0;

    // Status whitelist matches Command's default (Active/Hold/Back Up Offer/
    // Pending/Closed). mls.listings uses uppercase enum values.
    const paramValues: unknown[] = [
      Number(subject.longitude),
      Number(subject.latitude),
      q.radius_miles * 1609.34, // meters
      id,
    ];
    const whereClauses: string[] = [
      `location IS NOT NULL`,
      `id::text <> $4`,
      `status IN ('ACTIVE','PENDING','CLOSED','SOLD','HOLD','BACKUPOFFER')`,
      `ST_DWithin(location::geography,
                  ST_SetSRID(ST_MakePoint($1::float, $2::float), 4326)::geography,
                  $3)`,
    ];

    if (hasBeds) {
      paramValues.push(beds - q.bed_tolerance, beds + q.bed_tolerance);
      whereClauses.push(
        `beds_count BETWEEN $${paramValues.length - 1} AND $${paramValues.length}`,
      );
    }
    if (hasBaths) {
      paramValues.push(baths - q.bath_tolerance, baths + q.bath_tolerance);
      whereClauses.push(
        `baths_count BETWEEN $${paramValues.length - 1} AND $${paramValues.length}`,
      );
    }
    if (hasSqft) {
      paramValues.push(sqftLow, sqftHigh);
      whereClauses.push(
        `sqft BETWEEN $${paramValues.length - 1} AND $${paramValues.length}`,
      );
    }

    paramValues.push(q.limit);
    const limitPlaceholder = `$${paramValues.length}`;

    const compsSql = `
      SELECT
        id::text                  AS r_id,
        street_address            AS fullstreetaddress,
        city,
        state,
        postal_code               AS zipcode,
        ST_Y(location::geometry)  AS latitude,
        ST_X(location::geometry)  AS longitude,
        list_price                AS listprice,
        close_price               AS closeprice,
        beds_count                AS bedroomstotal,
        baths_count               AS bathstotal,
        sqft                      AS buildingsize,
        year_built                AS yearbuilt,
        status                    AS listingstatus,
        list_date                 AS listingdate,
        pending_date              AS pendingdate,
        close_date                AS closingdate,
        days_on_market            AS dom,
        ST_Distance(location::geography,
                    ST_SetSRID(ST_MakePoint($1::float, $2::float), 4326)::geography
                   ) / 1609.34 AS distance
      FROM mls.listings
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY distance ASC
      LIMIT ${limitPlaceholder}
    `;
    const compsResult = await propertyDataPool.query(compsSql, paramValues);

    return res.json({
      subject: {
        id,
        r_id: subject.id,
        latitude: Number(subject.latitude),
        longitude: Number(subject.longitude),
        bedroomstotal: hasBeds ? beds : null,
        bathstotal: hasBaths ? baths : null,
        buildingsize: hasSqft ? sqft : null,
        listprice:
          subject.listprice == null ? null : Number(subject.listprice),
      },
      appliedFilters: {
        radius_miles: q.radius_miles,
        bed_tolerance: hasBeds ? q.bed_tolerance : null,
        bath_tolerance: hasBaths ? q.bath_tolerance : null,
        sqft_tolerance_pct: hasSqft ? q.sqft_tolerance_pct : null,
        limit: q.limit,
      },
      comps: compsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
