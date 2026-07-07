import cors from "cors";

// Origins allowed by exact match. Comma-separated in the env var. Useful for
// localhost / vercel preview URLs that don't fit the flipiq.com pattern.
const allowlist = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Any HTTPS subdomain of flipiq.com is allowed without listing each tenant
// explicitly. Anchored so a lookalike like `flipiq.com.attacker.tld` doesn't
// slip through. Matches `https://buyers.devcommand.flipiq.com` etc. as well
// as bare `https://flipiq.com` (unlikely but harmless).
const FLIPIQ_SUBDOMAIN_RE = /^https:\/\/([a-z0-9-]+\.)*flipiq\.com$/i;

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Non-browser callers (curl, server-to-server) send no Origin header.
    if (!origin) return cb(null, true);

    if (FLIPIQ_SUBDOMAIN_RE.test(origin)) return cb(null, true);
    if (allowlist.includes(origin)) return cb(null, true);

    // Permissive in dev when no allowlist is configured, so `pnpm run dev`
    // works without env plumbing.
    if (allowlist.length === 0 && process.env.NODE_ENV !== "production") {
      return cb(null, true);
    }

    return cb(new Error(`CORS: origin ${origin} not allowed`), false);
  },
  credentials: false,
  methods: ["GET", "POST", "OPTIONS"],
});
