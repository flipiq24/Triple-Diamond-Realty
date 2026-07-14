import { Router } from "express";
import { propertyDataPool } from "../db/property-data.js";
import { getTenantPool } from "../db/tenant.js";
import {
  buildAddressString,
  buildStreetViewProxyUrl,
} from "../lib/street-view.js";
import {
  loadDataFeedPhotos,
  loadRawDataPhotos,
  loadUploadedPhotos,
  type PhotoItem,
} from "../lib/property-photos.js";

const router = Router({ mergeParams: true });

const DETAIL_SQL = `
  SELECT
    id, listing_id, mls_code, status,
    list_price, original_list_price, close_price,
    beds_count, baths_count, baths_full, baths_half,
    sqft, lot_size_sqft, lot_size_acres, year_built, garage_size,
    street_address, city, state, postal_code, county, unit,
    property_type, raw_property_type, raw_property_sub_type,
    days_on_market, cumulative_days_on_market,
    list_date, close_date, pending_date, active_date,
    off_market_date, expiration_date, last_modified,
    description, private_remarks, showing_instructions,
    listing_agent, buyer_agent, features,
    subdivision_name, school_district,
    elementary_school, middle_school, high_school,
    tax_annual_amount, association_fee,
    ST_X(location::geometry) AS longitude,
    ST_Y(location::geometry) AS latitude
  FROM mls.listings
  WHERE id = $1
  LIMIT 1
`;

// GET /:tenant/property-details/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id, tenant } = req.params as { id: string; tenant: string };
    const result = await propertyDataPool.query(DETAIL_SQL, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    const row = result.rows[0] as {
      street_address: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      cover_url?: string | null;
      [k: string]: unknown;
    };
    const address = buildAddressString({
      street: row.street_address,
      city: row.city,
      state: row.state,
      zip: row.postal_code,
    });
    if (address) {
      row.cover_url = buildStreetViewProxyUrl(req, tenant, address, "640x480");
    }
    return res.json(row);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /:tenant/property-details/:id/photos
 *
 * Four-tier photo ladder — first non-empty tier wins:
 *   1. DataFeed API — live gallery pointers
 *   2. `idx.raw_data_photos` — Command's ingest-time cache
 *   3. `idx.uploadimages` — legacy FDW rows
 *   4. Street View via our proxy — terminal fallback when the tenant DB
 *      has nothing (rare — most CRMLS listings have DataFeed entries)
 *
 * CRMLS media URLs (`media.crmls.org`) are returned as-is. Those pass
 * through Command's ingest verbatim and CRMLS geo-restricts them to US
 * traffic — the browser only sees them if the buyer / dev is US-based
 * (or on a US VPN). Vercel functions run in US regions, so prod is fine.
 */
router.get("/:id/photos", async (req, res, next) => {
  try {
    const { tenant, id } = req.params as { tenant: string; id: string };

    const listingLookup = await propertyDataPool.query(
      `SELECT listing_id FROM mls.listings WHERE id = $1 LIMIT 1`,
      [id],
    );
    if (listingLookup.rowCount === 0) {
      return res.status(404).json({ cover_url: null, photo_urls: [] });
    }
    const mlsListingId = String(
      (listingLookup.rows[0] as { listing_id: string }).listing_id,
    );

    const tenantPool = getTenantPool(tenant);
    if (!tenantPool) {
      return res.json({ cover_url: null, photo_urls: [] });
    }

    // One tenant-DB round trip for everything the ladder needs.
    const subject = await tenantPool.query(
      `SELECT r_id, idxtype, idxsubtype, idxkey,
              fullstreetaddress, city, state, zipcode
       FROM idx.raw_data
       WHERE listingid = $1
       LIMIT 1`,
      [mlsListingId],
    );
    if (subject.rowCount === 0) {
      return res.json({ cover_url: null, photo_urls: [] });
    }
    const rawData = subject.rows[0] as {
      r_id: number;
      idxtype: string | null;
      idxsubtype: string | null;
      idxkey: string | null;
      fullstreetaddress: string | null;
      city: string | null;
      state: string | null;
      zipcode: string | null;
    };

    let photos: PhotoItem[] = await loadDataFeedPhotos(rawData);
    if (photos.length === 0) photos = await loadRawDataPhotos(tenantPool, rawData.r_id);
    if (photos.length === 0) photos = await loadUploadedPhotos(tenantPool, rawData.r_id);

    if (photos.length === 0) {
      const address = buildAddressString({
        street: rawData.fullstreetaddress,
        city: rawData.city,
        state: rawData.state,
        zip: rawData.zipcode,
      });
      if (address) {
        photos = [
          {
            objectId: 1,
            url: buildStreetViewProxyUrl(req, tenant, address, "800x600"),
          },
        ];
      }
    }

    // Dedupe the cover from the rest so the frontend doesn't render it twice.
    const coverUrl = photos[0]?.url ?? null;
    const gallery = coverUrl
      ? photos.filter((p) => p.url !== coverUrl || p.objectId === 1)
      : photos;

    return res.json({ cover_url: coverUrl, photo_urls: gallery });
  } catch (err) {
    next(err);
  }
});

export default router;
