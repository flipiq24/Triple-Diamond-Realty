import type { Request, Response, NextFunction } from "express";

const SLUG_RE = /^[a-z0-9_-]{1,64}$/;

const allowlist = (process.env.TENANT_ALLOWLIST ?? "")
  .split(",")
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);

/**
 * Runs before every /:tenant/* route. Rejects malformed or non-allowlisted
 * slugs with a 404 so bogus URLs don't accidentally hit shared resources.
 */
export function tenantGuard(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const rawParam = req.params.tenant;
  const raw = (typeof rawParam === "string" ? rawParam : "").toLowerCase();

  if (!raw || !SLUG_RE.test(raw)) {
    res.status(404).json({ error: "Unknown tenant" });
    return;
  }

  if (allowlist.length > 0 && !allowlist.includes(raw)) {
    res.status(404).json({ error: "Unknown tenant" });
    return;
  }

  // Normalize once so downstream routes see the canonical lowercase form
  req.params.tenant = raw;
  next();
}
