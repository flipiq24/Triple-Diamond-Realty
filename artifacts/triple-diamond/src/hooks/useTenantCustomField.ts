import { useMemo } from "react";
import { useTenantPreferences } from "@/hooks/useTenantPreferences";
import type { CustomField, Section } from "@/services/tenant.service";

/**
 * Buyer-facing components read tenant-configurable strings (phone, email,
 * DRE license, tagline, logo, colors, description, and anything the tenant
 * admin adds) via these hooks.
 *
 * The values come from Command → My Profile → Buyers Hook. Since the
 * 1952000000000 migration, every configurable value lives inside a
 * section (Contact Info / Legal / Branding / anything else the admin
 * created). We walk `preferences.sections[*].fields[*]` looking for
 * matching keys.
 *
 * Design notes:
 *   - First-hit wins across sections. If the tenant admin duplicates a
 *     key across two sections, the earlier section's value is used —
 *     deterministic and easy to debug.
 *   - Missing key → returns the provided fallback (default: empty string).
 *     Components should treat empty as "hide the block" rather than
 *     falling back to hardcoded Triple Diamond values.
 *   - We index all fields once via useMemo — components read many keys
 *     per render and O(n × sections) walks would be wasteful.
 */
function indexSections(
  sections: Section[] | undefined,
): Record<string, string> {
  if (!sections || sections.length === 0) return {};
  const out: Record<string, string> = {};
  for (const section of sections) {
    const fields = section?.fields;
    if (!Array.isArray(fields)) continue;
    for (const field of fields as CustomField[]) {
      if (typeof field?.key !== "string" || !field.key) continue;
      // First-hit wins: only set if we haven't seen this key yet.
      if (!(field.key in out)) {
        out[field.key] = typeof field.value === "string" ? field.value : "";
      }
    }
  }
  return out;
}

/**
 * Snapshot of every key across all sections as a flat dictionary. Useful
 * when a single component needs to read many keys — avoids calling
 * useTenantCustomField N times with N re-renders.
 */
export function useTenantCustomFields(): Record<string, string> {
  const { preferences } = useTenantPreferences();
  return useMemo(
    () => indexSections(preferences.sections),
    [preferences.sections],
  );
}

/**
 * Read a single field value by key. Walks every section. Returns
 * `fallback` (default: "") when no field with that key exists.
 */
export function useTenantCustomField(key: string, fallback = ""): string {
  const fields = useTenantCustomFields();
  return fields[key] ?? fallback;
}
