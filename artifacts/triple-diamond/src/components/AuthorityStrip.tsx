import { Award, Gem, Cpu, type LucideIcon } from "lucide-react";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";
import { useTenantBranding } from "@/hooks/useTenantBranding";

/**
 * Three-stat social-proof band. Each slot is driven by the paired
 * `stat_N_value` / `stat_N_label` Buyers Hook keys. Slots with an empty
 * value are hidden; the whole strip is hidden if all three are empty
 * (nothing to brag about — don't fill the layout with placeholders).
 */
export default function AuthorityStrip() {
  const cf = useTenantCustomFields();
  const { companyName } = useTenantBranding();

  const ICONS: LucideIcon[] = [Award, Gem, Cpu];
  const items = [1, 2, 3]
    .map((i) => ({
      icon: ICONS[i - 1],
      num: cf[`stat_${i}_value`],
      label: cf[`stat_${i}_label`],
    }))
    .filter((it) => it.num || it.label);

  if (items.length === 0) return null;

  return (
    <section
      aria-label={`${companyName} authority`}
      className="bg-primary text-primary-foreground py-6 border-y border-primary/30"
    >
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-center md:justify-start gap-3">
            <it.icon className="w-7 h-7 text-accent shrink-0" aria-hidden="true" />
            <div>
              {it.num && (
                <div className="text-xl md:text-2xl font-extrabold text-accent leading-none">{it.num}</div>
              )}
              {it.label && (
                <div className="text-xs md:text-sm text-primary-foreground/80 mt-1 uppercase tracking-wider font-semibold">
                  {it.label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
