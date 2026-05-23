import { Award, Gem, Cpu } from "lucide-react";

export default function AuthorityStrip() {
  const items = [
    { icon: Award, num: "30 Years", label: "in the Business" },
    { icon: Gem, num: "Thousands", label: "of Properties Closed" },
    { icon: Cpu, num: "Most Powerful", label: "Deal-Finding Technology in California" },
  ];
  return (
    <section aria-label="Triple Diamond Realty authority" className="bg-primary text-primary-foreground py-6 border-y border-primary/30">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-center md:justify-start gap-3">
            <it.icon className="w-7 h-7 text-accent shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xl md:text-2xl font-extrabold text-accent leading-none">{it.num}</div>
              <div className="text-xs md:text-sm text-primary-foreground/80 mt-1 uppercase tracking-wider font-semibold">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
