import pg from "pg";

const { Pool } = pg;

const url = process.env.PROPERTY_DATA_URL;

if (!url) {
  throw new Error("PROPERTY_DATA_URL is not set");
}

// Shared pool for the cross-tenant property-data DB.
// Fluid Compute on Vercel Pro keeps this warm across invocations.
export const propertyDataPool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

propertyDataPool.on("error", (err) => {
  console.error("[property-data] pool error:", err.message);
});
