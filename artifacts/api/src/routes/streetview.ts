import { Router } from "express";
import { z } from "zod";

const router = Router({ mergeParams: true });

/**
 * Google Street View image proxy.
 *
 * Why this exists: Google's Street View API keys are Website-restricted in
 * Google Cloud Console (locked to Command's own domains). Any browser that
 * hits `maps.googleapis.com/streetview?key=…` from `localhost:4001`,
 * `buyers.command.flipiq.com`, or any other origin outside the allowlist
 * gets 403 Forbidden.
 *
 * Server-side requests carry no Referer, so Google accepts them. This route
 * fetches the image server-side and streams the bytes back — the browser
 * only sees our origin, never Google's.
 *
 * Cached aggressively (1 day) since a Street View for a given address is
 * effectively static.
 */

const querySchema = z.object({
  address: z.string().min(1).max(500),
  size: z
    .string()
    .regex(/^\d{2,4}x\d{2,4}$/)
    .optional()
    .default("640x480"),
});

interface HttpResponseLike {
  ok: boolean;
  status: number;
  headers: {
    get(name: string): string | null;
  };
  arrayBuffer(): Promise<ArrayBuffer>;
}

router.get("/", async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    }
    const { address, size } = parsed.data;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "GOOGLE_API_KEY not configured" });
    }

    const url = `https://maps.googleapis.com/maps/api/streetview?key=${apiKey}&size=${size}&location=${encodeURIComponent(address)}`;

    const upstream = (await fetch(url)) as HttpResponseLike;
    if (!upstream.ok) {
      // Common upstream failures: 404 (no Street View for that location), 403
      // (referer blocked — shouldn't happen server-side but worth logging),
      // 5xx (Google outage). Return 502 so the frontend can distinguish an
      // upstream problem from our own bug.
      console.warn(`[streetview] upstream ${upstream.status} for ${address.slice(0, 80)}`);
      return res.status(502).json({ error: "streetview_upstream_failed", upstream_status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await upstream.arrayBuffer());

    // Cache the image for 24h in the browser and any downstream CDN. Street
    // View content changes rarely, so long cache = fewer Google API calls
    // (which count against the tenant's quota) + faster subsequent loads.
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("Content-Length", String(buf.length));
    return res.send(buf);
  } catch (err) {
    next(err);
  }
});

export default router;
