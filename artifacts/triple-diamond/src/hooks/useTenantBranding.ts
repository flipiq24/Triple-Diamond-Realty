import {
  useTenantPreferences,
  DEFAULT_PREFERENCES,
} from "@/hooks/useTenantPreferences";

/**
 * Thin adapter over useTenantPreferences that surfaces the two branding
 * bits SiteHeader/SiteFooter care about, with defaults guaranteed to be
 * present (so components don't need to handle undefined).
 */
export function useTenantBranding(): {
  logoUrl: string;
  companyName: string;
  isLoading: boolean;
} {
  const { preferences, isLoading } = useTenantPreferences();
  return {
    logoUrl: preferences.logo || DEFAULT_PREFERENCES.logo,
    companyName: preferences.company_name || DEFAULT_PREFERENCES.company_name,
    isLoading,
  };
}
