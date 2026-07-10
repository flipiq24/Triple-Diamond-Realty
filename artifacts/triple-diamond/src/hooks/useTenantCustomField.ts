import { useMemo } from "react";
import { useTenantPreferences } from "@/hooks/useTenantPreferences";
import type { CustomField } from "@/services/tenant.service";

/**
 * Buyer-facing components read tenant-configurable strings (phone, email,
 * DRE license, tagline, ebook_*, marketing stats, etc.) via these hooks.
 *
 * The values come from Command → My Profile → Buyers Hook → "Add field",
 * saved as a jsonb `custom_fields[]` array against the tenant's row.
 * See outputs/tenant-preferences-keys.md for the canonical key list.
 *
 * Design notes:
 *   - Lookups are case-sensitive on `key` — the Buyers Hook UI doesn't
 *     normalize case, so keys must match exactly what the tenant admin typed.
 *   - Missing key → returns the provided fallback (default: empty string).
 *     Components should treat empty as "hide the block" rather than falling
 *     back to hardcoded Triple Diamond values.
 *   - We index the array once via useMemo — components read many keys per
 *     render and O(n) scans would be wasteful.
 */
function indexCustomFields(
  fields: CustomField[] | undefined,
): Record<string, string> {
  if (!fields || fields.length === 0) return {};
  const out: Record<string, string> = {};
  for (const field of fields) {
    if (typeof field?.key === "string" && field.key) {
      out[field.key] = typeof field.value === "string" ? field.value : "";
    }
  }
  return out;
}

/**
 * Snapshot of all custom fields as a key→value dictionary. Useful when a
 * single component needs to read many keys — avoids calling
 * useTenantCustomField N times with N re-renders.
 */
export function useTenantCustomFields(): Record<string, string> {
  const { preferences } = useTenantPreferences();
  return useMemo(
    () => indexCustomFields(preferences.custom_fields as CustomField[] | undefined),
    [preferences.custom_fields],
  );
}

/**
 * Read a single custom-field value by key. Returns `fallback` (default: "")
 * when the key isn't configured.
 */
export function useTenantCustomField(key: string, fallback = ""): string {
  const fields = useTenantCustomFields();
  return fields[key] ?? fallback;
}
