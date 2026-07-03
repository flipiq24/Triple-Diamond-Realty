import { Router } from "express";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const router = Router({ mergeParams: true });

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

const DEFAULTS = {
  logo: "",
  bg: "#0F2C4B",
  secondary_color: "#F59E0B",
  company_name: "Triple Diamond Realty",
} as const;

router.get("/", async (req, res, next) => {
  try {
    const { tenant } = req.params as { tenant: string };
    const client = getClient();

    if (!client) {
      return res.json({ preferences: DEFAULTS });
    }

    const { data, error } = await client
      .from("tenant_preferences")
      .select("logo, bg, secondary_color, company_name")
      .eq("tenant", tenant.toLowerCase())
      .maybeSingle();

    if (error) {
      // Silent fallback — a missing row or table shouldn't 500 the page
      console.warn("[preferences] supabase error:", error.message);
      return res.json({ preferences: DEFAULTS });
    }

    return res.json({
      preferences: {
        logo: data?.logo ?? DEFAULTS.logo,
        bg: data?.bg ?? DEFAULTS.bg,
        secondary_color: data?.secondary_color ?? DEFAULTS.secondary_color,
        company_name: data?.company_name ?? DEFAULTS.company_name,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
