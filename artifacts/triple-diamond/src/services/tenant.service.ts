import { http } from "@/lib/http-client";

/**
 * A single row in Buyers Hook's `custom_fields[]` array — how the tenant admin
 * adds arbitrary key/value pairs via Command's "Add field" UI. The buyer site
 * reads values by `key`, so key names must match exactly what components ask
 * for (see outputs/tenant-preferences-keys.md for the full canonical list).
 */
export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: "text" | "url" | "color" | "file";
  value: string;
}

/**
 * The API's `/buyers/preferences` returns a single jsonb blob merged over
 * defaults. Known fields today are logo/bg/secondary_color/company_name +
 * custom_fields[], but the backend is jsonb — any new key Tony configures
 * flows through without a code change. Callers should treat unknown keys
 * as opaque.
 */
export interface TenantPreferences {
  logo?: string;
  bg?: string;
  secondary_color?: string;
  company_name?: string;
  custom_fields?: CustomField[];
  [extra: string]: unknown;
}

export interface PreferencesResponse {
  preferences: TenantPreferences;
}

/**
 * Optional override so the branding tenant can differ from the URL-path
 * tenant. Useful when a deployment's domain (e.g. `buyers.command.flipiq.com`)
 * is locked to one slug but we want to read Buyers Hook config from a
 * DIFFERENT tenant's DB (e.g. `devcommand` where the config actually exists).
 * When unset, the API falls back to the URL-path tenant like before.
 */
const PREFERENCES_TENANT_OVERRIDE = (
  import.meta.env.VITE_PREFERENCES_TENANT as string | undefined
)?.trim();

export const tenantService = {
  async getPreferences(): Promise<TenantPreferences> {
    const qs = PREFERENCES_TENANT_OVERRIDE
      ? `?tenant=${encodeURIComponent(PREFERENCES_TENANT_OVERRIDE)}`
      : "";
    const response = await http.get(`/buyers/preferences${qs}`);
    if (!response.ok) {
      throw new Error(`Failed to load preferences (${response.status})`);
    }
    const body = (await response.json()) as PreferencesResponse;
    return body.preferences ?? {};
  },
};
