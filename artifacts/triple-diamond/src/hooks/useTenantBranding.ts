import { useTenantPreferences, DEFAULT_PREFERENCES } from "@/hooks/useTenantPreferences";
import { useTenantCustomField } from "@/hooks/useTenantCustomField";

/**
 * Thin adapter over useTenantPreferences / useTenantCustomField that
 * surfaces the two branding bits SiteHeader / SiteFooter care about, with
 * defaults guaranteed to be present.
 *
 * Since 1952000000000-RestructureBuyerPreferencesToSections, `logo` and
 * `company_name` live inside the Branding section of `preferences.sections`
 * rather than at the top level. Reads go through the custom-field lookup
 * — first-hit wins across sections, tenant admin can even move Branding's
 * `company_name` into a different section if they want.
 */
export function useTenantBranding(): {
  logoUrl: string;
  companyName: string;
  isLoading: boolean;
} {
  const { isLoading } = useTenantPreferences();
  const logo = useTenantCustomField("logo");
  const companyName = useTenantCustomField("company_name");
  return {
    logoUrl: logo || DEFAULT_PREFERENCES.logo,
    companyName: companyName || DEFAULT_PREFERENCES.company_name,
    isLoading,
  };
}
