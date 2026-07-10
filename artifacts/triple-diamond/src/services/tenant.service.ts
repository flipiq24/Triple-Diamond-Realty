import { http } from "@/lib/http-client";

/**
 * A single field inside a Buyers Hook section. Values are addressed by
 * `key` — buyer-site components read via `useTenantCustomField(key)`
 * which walks all sections to find the first matching key.
 */
export type CustomFieldType = "text" | "url" | "color" | "file" | "textarea";

export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: CustomFieldType;
  value: string;
  /** Only meaningful for `type: 'textarea'` today; enforced Command-side. */
  maxLength?: number;
}

export interface Section {
  id: string;
  label: string;
  fields: CustomField[];
}

/**
 * Sectioned preferences blob returned by the TDR API's `/buyers/preferences`
 * (which itself proxies from Command → sys.buyer_preferences.preferences).
 *
 * Every configurable value — logo, colors, phone, email, DRE license,
 * address, tagline, description, and any tenant-added field — lives inside
 * a section. No top-level flat fields anymore (that shape was migrated
 * away in Command 1952000000000-RestructureBuyerPreferencesToSections).
 */
export interface TenantPreferences {
  sections?: Section[];
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
