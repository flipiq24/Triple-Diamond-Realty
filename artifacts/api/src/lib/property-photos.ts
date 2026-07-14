import type pg from "pg";

export interface PhotoItem {
  objectId: number;
  url: string;
}

interface HttpResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

/**
 * Base URL that filenames from `idx.uploadimages` are relative to. Mirrors
 * Command's PropertyDetailsDao logic so behavior stays in sync.
 */
function resolveUploadBase(): string {
  const uploadPicturesUrl = process.env.UPLOAD_PICTURES_URL;

  if (uploadPicturesUrl) {
    const isRelative =
      uploadPicturesUrl.startsWith("./") ||
      uploadPicturesUrl.startsWith("/") ||
      !uploadPicturesUrl.includes("://");
    if (!isRelative) return uploadPicturesUrl;
    const protocol = process.env.URL_PROTOCOL || "https";
    const host = process.env.URL_HOST || "localhost:3000";
    const cleaned = uploadPicturesUrl.startsWith("./")
      ? uploadPicturesUrl.slice(2)
      : uploadPicturesUrl;
    const path = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${protocol}://${host}${path}`;
  }

  return (
    process.env.IMAGE_CDN_URL ||
    `${process.env.URL_PROTOCOL || "https"}://${process.env.URL_HOST || "localhost:3000"}/property_photos/`
  );
}

/**
 * `idx.raw_data_photos` — Command's cache of already-resolved absolute
 * photo URLs, populated at ingest by mls.dao's `fetchAndStoreCoverUrl`.
 * `object_id=0` is the cover; higher ids are gallery photos.
 */
export async function loadRawDataPhotos(
  tenantPool: pg.Pool,
  rId: number,
): Promise<PhotoItem[]> {
  const { rows } = await tenantPool.query(
    `SELECT url, object_id
     FROM idx.raw_data_photos
     WHERE r_id = $1 AND url IS NOT NULL AND url <> ''
     ORDER BY object_id ASC
     LIMIT 30`,
    [rId],
  );
  return (rows as Array<{ url: string; object_id: number }>).map((r, i) => ({
    objectId: i + 1,
    url: r.url,
  }));
}

/**
 * `idx.uploadimages` — legacy FDW rows keyed by (r_id, seq). Filenames need
 * a UPLOAD_PICTURES_URL prefix unless they already contain `http`.
 */
export async function loadUploadedPhotos(
  tenantPool: pg.Pool,
  rId: number,
): Promise<PhotoItem[]> {
  const { rows } = await tenantPool.query(
    `SELECT filename, seq
     FROM idx.uploadimages
     WHERE r_id = $1
     ORDER BY seq ASC
     LIMIT 30`,
    [rId],
  );
  if (rows.length === 0) return [];

  const base = resolveUploadBase();
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;

  const items: PhotoItem[] = [];
  for (const row of rows as Array<{ filename: string | null }>) {
    const filename = row.filename ?? "";
    if (!filename) continue;
    const url = /http/i.test(filename)
      ? filename
      : `${normalizedBase}${filename.replace(/^\//, "")}`;
    items.push({ objectId: items.length + 1, url });
  }
  return items;
}

/**
 * DataFeed API — live POST with the property's idxtype/idxsubtype/idxkey.
 * Response envelope is `{ message: "<json-encoded array of URLs>" }`, so we
 * JSON.parse twice. Handles the same relative/protocol-relative URL shapes
 * Command's mls.dao does.
 */
export async function loadDataFeedPhotos(property: {
  idxtype: string | null;
  idxsubtype: string | null;
  idxkey: string | null;
}): Promise<PhotoItem[]> {
  const apiUrl = process.env.DATAFEED_API_URL;
  const cdnUrl = process.env.DATAFEED_URL;
  if (!apiUrl || !cdnUrl) return [];
  if (!property.idxtype || !property.idxsubtype || !property.idxkey) return [];

  try {
    const body = `type=${encodeURIComponent(property.idxtype)}&subtype=${encodeURIComponent(property.idxsubtype)}&key=${encodeURIComponent(property.idxkey)}`;
    const res = (await fetch(`${apiUrl}/getimages/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })) as HttpResponseLike;
    if (!res.ok) {
      console.warn(`[property/photos] DataFeed ${res.status}`);
      return [];
    }

    const outer = (await res.json()) as { message?: unknown };
    if (typeof outer?.message !== "string") return [];
    if (outer.message.includes("Wrong Parameter")) return [];

    let arr: unknown;
    try {
      arr = JSON.parse(outer.message);
    } catch {
      return [];
    }
    if (!Array.isArray(arr)) return [];

    const items: PhotoItem[] = [];
    for (const raw of arr) {
      if (typeof raw !== "string") continue;
      let url = raw;
      if (raw.startsWith("//")) url = `http:${raw}`;
      else if (!/http/i.test(raw)) url = `${cdnUrl}${raw}`;
      items.push({ objectId: items.length + 1, url });
    }
    return items;
  } catch (err) {
    console.warn(
      "[property/photos] DataFeed fetch failed:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

/**
 * Regex for URLs we know are unreachable from any client outside Command's
 * whitelisted infra — CRMLS media servers return 403 to buyer browsers,
 * Vercel functions, local dev, etc. Filtering these lets the ladder fall
 * through to Street View instead of shipping guaranteed-broken <img> tags.
 */
const CRMLS_HOSTNAME_RE = /(^|:\/\/)([a-z0-9-]+\.)?crmls\.org(\/|$)/i;

export function stripUnreachable(photos: PhotoItem[]): PhotoItem[] {
  return photos
    .filter((p) => !CRMLS_HOSTNAME_RE.test(p.url))
    .map((p, i) => ({ ...p, objectId: i + 1 }));
}
