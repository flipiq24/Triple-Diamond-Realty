import cors from "cors";

const allowlist = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Allow non-browser callers (curl, server-to-server) with no Origin header
    if (!origin) return cb(null, true);

    if (allowlist.length === 0) {
      // If nothing configured, be permissive in dev only
      if (process.env.NODE_ENV !== "production") return cb(null, true);
      return cb(new Error("CORS: no ALLOWED_ORIGINS configured"), false);
    }

    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`), false);
  },
  credentials: false,
  methods: ["GET", "POST", "OPTIONS"],
});
