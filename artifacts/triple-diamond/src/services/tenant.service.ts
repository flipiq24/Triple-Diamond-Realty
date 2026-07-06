import { http } from "@/lib/http-client";

/**
 * The API's `/buyers/preferences` returns a single jsonb blob merged over
 * defaults. Known fields today are logo/bg/secondary_color/company_name,
 * but the backend is jsonb — any new key Tony configures will flow through
 * without a code change. Callers should treat unknown keys as opaque.
 */
export interface TenantPreferences {
  logo?: string;
  bg?: string;
  secondary_color?: string;
  company_name?: string;
  [extra: string]: unknown;
}

export interface PreferencesResponse {
  preferences: TenantPreferences;
}

export const tenantService = {
  async getPreferences(): Promise<TenantPreferences> {
    const response = await http.get("/buyers/preferences");
    if (!response.ok) {
      throw new Error(`Failed to load preferences (${response.status})`);
    }
    const body = (await response.json()) as PreferencesResponse;
    return body.preferences ?? {};
  },
};
