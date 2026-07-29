import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tenantService, type TenantPreferences } from "@/services/tenant.service";
import defaultLogo from "@assets/image_1779548344914.png";

/**
 * Baseline branding used ONLY as a last-resort fallback for the visible
 * bits (logo image and company name) when the tenant hasn't set the
 * corresponding field in Buyers Hook yet. Everything else falls through
 * to an empty string / "hide the block" instead of showing Triple Diamond
 * placeholders on a foreign tenant's site.
 */
export const DEFAULT_PREFERENCES = {
  logo: defaultLogo,
  bg: "#0F2C4B",
  secondary_color: "#F59E0B",
  company_name: "Triple Diamond Realty",
};

const CACHE_TTL_MS = 30 * 60_000; // 30 minutes
const CACHE_KEY = `tdr_tenant_prefs_v1_${import.meta.env.VITE_TENANT_NAME ?? "unknown"}`;

interface CachedEntry {
  data: TenantPreferences;
  timestamp: number;
}

function readCache(): CachedEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry;
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: TenantPreferences): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    /* ignore quota */
  }
}

export interface UseTenantPreferencesResult {
  preferences: TenantPreferences;
  isLoading: boolean;
  isError: boolean;
}

export function useTenantPreferences(): UseTenantPreferencesResult {
  // Read localStorage ONCE at hook init so we can seed React Query.
  // A fresh cache means the query is not loading — isLoading stays false
  // and children render immediately without a network request.
  const cached = readCache();

  const query = useQuery({
    queryKey: ["tenant-preferences", import.meta.env.VITE_TENANT_NAME],
    queryFn: () => tenantService.getPreferences(),
    // 30-minute freshness window. Navigating between pages does NOT
    // trigger a refetch as long as the cached data is < 30 min old.
    staleTime: CACHE_TTL_MS,
    gcTime: 2 * CACHE_TTL_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Cap retries at 3 with a bounded backoff.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    // Once the query errors out, don't rerun the retry cycle every time a
    // consumer (SiteHeader, SiteFooter, TenantThemeProvider, EbookPopup…)
    // remounts. Otherwise a downed API produces dozens of failing requests
    // over the course of a session.
    retryOnMount: false,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.timestamp,
  });

  // Persist every successful fetch back to localStorage so hard reloads
  // within 30 min skip the network round-trip entirely.
  useEffect(() => {
    if (query.data && !query.isError) {
      writeCache(query.data);
    }
  }, [query.data, query.isError]);

  // Preferences shape is now `{ sections: [...] }`. No shallow flat-key
  // merge — that mattered when we had top-level logo/bg/secondary_color/
  // company_name fields. Callers use useTenantCustomField(...) to read
  // by key, which walks sections and falls back to "" when missing.
  const preferences: TenantPreferences = query.data ?? { sections: [] };

  return {
    preferences,
    // Only expose "loading" when there truly is no data yet. When cache
    // seeded initialData, query.data is defined immediately and this
    // stays false — no loader flash for warm loads.
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
  };
}
