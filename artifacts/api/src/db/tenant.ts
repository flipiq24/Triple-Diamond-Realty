import pg from "pg";

const { Pool } = pg;

// Per-tenant pg.Pool cache. Keyed by tenant slug (lowercase).
// Env vars follow: DATABASE_URL_<TENANT_UPPERCASE>
// Example: tenant "command"  → DATABASE_URL_COMMAND
//          tenant "devcommand" → DATABASE_URL_DEVCOMMAND
const pools = new Map<string, pg.Pool>();

function envKey(tenant: string): string {
  return `DATABASE_URL_${tenant.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
}

export function getTenantPool(tenant: string): pg.Pool | null {
  const slug = tenant.toLowerCase();
  const cached = pools.get(slug);
  if (cached) return cached;

  const url = process.env[envKey(slug)];
  if (!url) {
    console.warn(`[tenant] No DB URL for tenant "${slug}" (env: ${envKey(slug)})`);
    return null;
  }

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on("error", (err) => {
    console.error(`[tenant:${slug}] pool error:`, err.message);
  });

  pools.set(slug, pool);
  return pool;
}
