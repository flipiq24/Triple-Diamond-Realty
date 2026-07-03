import { Router } from "express";
import { propertyDataPool } from "../db/property-data.js";
import { getTenantPool } from "../db/tenant.js";

const router = Router({ mergeParams: true });

// GET /:tenant/property-details/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const detailSql = `
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
        baths_full,
        baths_half,
        sqft,
        lot_size_sqft,
        lot_size_acres,
        year_built,
        garage_size,
        street_address,
        city,
        state,
        postal_code,
        county,
        unit,
        property_type,
        raw_property_type,
        raw_property_sub_type,
        days_on_market,
        cumulative_days_on_market,
        list_date,
        close_date,
        pending_date,
        active_date,
        off_market_date,
        expiration_date,
        last_modified,
        description,
        private_remarks,
        showing_instructions,
        listing_agent,
        buyer_agent,
        features,
        subdivision_name,
        school_district,
        elementary_school,
        middle_school,
        high_school,
        tax_annual_amount,
        association_fee,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude
      FROM mls.listings
      WHERE id = $1
      LIMIT 1
    `;
    const result = await propertyDataPool.query(detailSql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /:tenant/property-details/:id/photos
router.get("/:id/photos", async (req, res, next) => {
  try {
    const { tenant, id } = req.params as { tenant: string; id: string };

    // 1. Look up the listing in shared property-data to get listing_id + mls_code
    const listingLookup = await propertyDataPool.query(
      `SELECT listing_id, mls_code FROM mls.listings WHERE id = $1 LIMIT 1`,
      [id],
    );
    if (listingLookup.rowCount === 0) {
      return res.status(404).json({ cover_url: null, photo_urls: [] });
    }
    const { listing_id: mlsListingId } = listingLookup.rows[0] as {
      listing_id: string;
      mls_code: string;
    };

    // 2. Look up photos in the per-tenant DB via idx.raw_data + idx.uploadimages
    const tenantPool = getTenantPool(tenant);
    if (!tenantPool) {
      return res.json({ cover_url: null, photo_urls: [] });
    }

    const photosSql = `
      SELECT ui.r_id, ui.filename, ui.seq
      FROM idx.raw_data rd
      JOIN idx.uploadimages ui ON ui.r_id = rd.r_id
      WHERE rd.listingid = $1
      ORDER BY ui.seq ASC
      LIMIT 30
    `;
    const photos = await tenantPool.query(photosSql, [mlsListingId]);

    const baseUrl = (process.env.UPLOAD_PICTURES_URL || "").replace(/\/$/, "");
    const toUrl = (filename: string): string => {
      if (!filename) return "";
      if (/^https?:\/\//i.test(filename)) return filename;
      return `${baseUrl}/${filename.replace(/^\//, "")}`;
    };

    const photoUrls = photos.rows
      .map((r) => ({ objectId: Number(r.seq), url: toUrl(String(r.filename)) }))
      .filter((p) => !!p.url);

    return res.json({
      cover_url: photoUrls[0]?.url ?? null,
      photo_urls: photoUrls,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
