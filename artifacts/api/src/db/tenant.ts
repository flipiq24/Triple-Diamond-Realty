import pg from "pg";

const { Pool } = pg;

// Per-tenant pg.Pool cache. Keyed by tenant slug (lowercase).
const pools = new Map<string, pg.Pool>();

// Comma-separated allowlist. If unset, ANY tenant slug from the URL is accepted
// (validated shape only). Set this in production so a random path doesn't try to
// connect to a random DB name.
const allowlist = (process.env.TENANT_ALLOWLIST ?? "")
  .split(",")
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);

// URL template with {tenant} placeholder. Example:
//   postgresql://ftdba:pw@host/{tenant}pes
// The tenant slug (from the URL path) is substituted at request time.
//
// A template WITHOUT `{tenant}` is treated as a static URL used for every
// tenant slug — useful in staging when only one tenant DB is provisioned
// and every buyer site should read from that same DB regardless of its
// URL path. Explicit `DATABASE_URL_<TENANT>` overrides still win.
const template = process.env.TENANT_DB_URL_TEMPLATE;

// Regex: tenant slug can only be lowercase letters, digits, hyphen, underscore
const SLUG_RE = /^[a-z0-9_-]{1,64}$/;

function envKey(tenant: string): string {
  return `DATABASE_URL_${tenant.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
}

function resolveUrl(tenant: string): string | null {
  // 1. Explicit per-tenant override wins (edge cases like different suffix / host)
  const override = process.env[envKey(tenant)];
  if (override) return override;

  // 2. Template-based (the common case)
  if (template) {
    // No {tenant} placeholder → treat as a static URL for all tenants.
    // Intentional (single-tenant staging / DB-consolidation modes); no warn.
    if (!template.includes("{tenant}")) {
      return template;
    }
    return template.replace(/\{tenant\}/g, tenant);
  }

  return null;
}

export function getTenantPool(rawTenant: string): pg.Pool | null {
  const tenant = rawTenant.toLowerCase();

  // Basic shape validation — prevents path traversal / injection via slug
  if (!SLUG_RE.test(tenant)) {
    console.warn(`[tenant] rejected malformed tenant slug: "${rawTenant}"`);
    return null;
  }

  // Optional allowlist
  if (allowlist.length > 0 && !allowlist.includes(tenant)) {
    console.warn(`[tenant] tenant "${tenant}" not in TENANT_ALLOWLIST`);
    return null;
  }

  // Cached pool wins
  const cached = pools.get(tenant);
  if (cached) return cached;

  const url = resolveUrl(tenant);
  if (!url) {
    console.warn(
      `[tenant] no DB URL for "${tenant}" (checked ${envKey(tenant)} + TENANT_DB_URL_TEMPLATE)`,
    );
    return null;
  }

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 20_000,
  });

  pool.on("error", (err) => {
    console.error(`[tenant:${tenant}] pool error:`, err.message);
  });

  pools.set(tenant, pool);
  return pool;
}
