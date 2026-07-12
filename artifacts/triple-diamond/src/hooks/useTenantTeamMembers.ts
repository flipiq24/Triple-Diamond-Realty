import { useMemo } from "react";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

/**
 * Team members read from Buyers Hook custom fields with the convention:
 *
 *   team_member_<n>_name       (required — presence of this key gates the member)
 *   team_member_<n>_title      (optional)
 *   team_member_<n>_bio        (optional)
 *   team_member_<n>_photo_url  (optional)
 *
 * Where <n> is any integer. Members are returned sorted by n ascending, so
 * the tenant admin controls display order by picking indexes (1, 2, 3, …
 * or skipping numbers for gaps that render as-is once filled in later).
 */
export interface TenantTeamMember {
  index: number;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
}

const KEY_PATTERN = /^team_member_(\d+)_(name|title|bio|photo_url)$/;

export function useTenantTeamMembers(): TenantTeamMember[] {
  const cf = useTenantCustomFields();
  return useMemo(() => {
    const grouped = new Map<
      number,
      { name: string; title: string; bio: string; photoUrl: string }
    >();
    for (const [key, value] of Object.entries(cf)) {
      const match = KEY_PATTERN.exec(key);
      if (!match) continue;
      const n = Number(match[1]);
      const attr = match[2];
      const existing = grouped.get(n) ?? {
        name: "",
        title: "",
        bio: "",
        photoUrl: "",
      };
      if (attr === "name") existing.name = value;
      else if (attr === "title") existing.title = value;
      else if (attr === "bio") existing.bio = value;
      else if (attr === "photo_url") existing.photoUrl = value;
      grouped.set(n, existing);
    }
    return Array.from(grouped.entries())
      .filter(([, m]) => m.name.trim().length > 0)
      .sort((a, b) => a[0] - b[0])
      .map(([index, m]) => ({ index, ...m }));
  }, [cf]);
}
