import { useLocation } from "wouter";
import { Building2, TrendingUp, Cpu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ListingCard from "@/components/ListingCard";
import heroBg from "@/data/images/hero-bg.png";
import SeoHead from "@/components/SeoHead";
import AuthorityStrip from "@/components/AuthorityStrip";
import SearchBarBlock from "@/components/SearchBarBlock";
import type { VariantConfig } from "@/data/variants";
import { useMlsListings } from "@/hooks/useMlsListings";
import { useTenantBranding } from "@/hooks/useTenantBranding";

export default function VariantHome({ config, cityName }: { config: VariantConfig; cityName?: string }) {
  const [, setLocation] = useLocation();
  const { companyName } = useTenantBranding();

  // "This Week's Top Deals" — real MLS from the past 7 days, newest first,
  // capped at 3 for the strip. Replaces a static mock array that was
  // showing the same three fake listings on every tenant's homepage.
  const { listings: weekListings, isLoading: weekLoading } = useMlsListings({
    last_week: true,
    pageSize: 3,
    sortColumn: "list_date",
    sortOrder: "DESC",
  });
  const featuredListings = weekListings.slice(0, 3);

  // variants.ts uses "{{brand}}" as a placeholder in SEO titles, FAQ answers,
  // and disclaimers so the same variant file can serve any tenant. Interpolate
  // here at render time using the tenant's companyName.
  const brand = (s: string) => s.replaceAll("{{brand}}", companyName);
  const faqBranded = config.faq.map((f) => ({ q: brand(f.q), a: brand(f.a) }));
  const subCopyBranded = brand(config.subCopy);

  const h1Lead = cityName ? `${cityName} ${config.h1Lead}` : config.h1Lead;
  const meta = cityName
    ? {
        title: brand(`${cityName} ${config.meta.title}`),
        description: `${cityName} — ${brand(config.meta.description)}`,
        keywords: `${cityName.toLowerCase()} ${config.meta.keywords}`,
      }
    : {
        title: brand(config.meta.title),
        description: brand(config.meta.description),
        keywords: config.meta.keywords,
      };

  return (
    <div className="w-full">
      <SeoHead title={meta.title} description={meta.description} keywords={meta.keywords} path={cityName ? `/california/${cityName.toLowerCase().replace(/\s+/g, "-")}` : config.path} faq={faqBranded} />

      {/* Hero */}
      <section className="relative bg-primary pt-24 pb-48 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95 z-0" />

        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {config.pill && (
              <div className="inline-block bg-accent/15 border border-accent/30 text-accent px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wide uppercase mb-6">
                {config.pill}
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.05]">
              {h1Lead} <br />
              <span className="text-accent inline-block mt-2">{config.h1Accent}</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-white/90 font-semibold max-w-2xl mx-auto mb-4">{config.subHeadline}</h2>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">{subCopyBranded}</p>
          </motion.div>

          <SearchBarBlock />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-white" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
      </section>

      <AuthorityStrip />

      {/* Value Props */}
      <section className="py-24 bg-gradient-to-b from-white to-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Why {companyName}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-5 tracking-tight leading-[1.1]">
              Built for investors who care about <span className="text-accent">the numbers</span>.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Three decades of relationships. The state's most advanced on
              and off-market deal engine. Real properties, real numbers,
              real margin — delivered in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Building2,
                title: "On + Off-Market Inventory",
                body: "MLS, pre-market, and pocket listings — all in one feed.",
                stat: "1 feed",
                statLabel: "everywhere else = 5+",
              },
              {
                icon: Cpu,
                title: "Proprietary Sourcing",
                body: "Direct-to-seller pipeline built over 30 years of relationships.",
                stat: "30+ yrs",
                statLabel: "seller relationships",
              },
              {
                icon: TrendingUp,
                title: "Real Numbers",
                body: "Comps, ARV, and rehab scope surfaced on every listing.",
                stat: "Every",
                statLabel: "listing, no guesses",
              },
            ].map((prop, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-accent/40 transition-all duration-300"
              >
                {/* Accent stripe at top — grows on hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />

                {/* Big translucent number in the corner */}
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-5 text-6xl font-black text-primary/5 group-hover:text-accent/15 transition-colors leading-none select-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative p-8">
                  {/* Icon in an accent-tinted rounded square */}
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 group-hover:scale-105 transition-all">
                    <prop.icon className="w-7 h-7 text-accent" aria-hidden="true" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-primary mb-3 tracking-tight">
                    {prop.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {prop.body}
                  </p>

                  {/* Stat footer — separates the "why" from the "proof" */}
                  <div className="pt-5 border-t border-dashed border-border flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary tracking-tight">
                      {prop.stat}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {prop.statLabel}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From search to close in three simple steps. No retail competition. No bidding wars. Just diamonds in the rough.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10" />
            {[
              { step: 1, title: "Set Your Buy Box", body: "Tell us your buy box — ZIP, price, beds, deal type." },
              { step: 2, title: "Get Matched Deals", body: "Get matched deals with instant comps, ARV, and rehab numbers." },
              { step: 3, title: "Close like a pro!", body: "Close fast with our proven vetted lenders, contractors, and title partners." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-accent text-accent flex items-center justify-center text-4xl font-black mb-6 shadow-sm">{item.step}</div>
                <h3 className="text-2xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-[280px]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">{cityName ? `${cityName}-Area Top Deals` : "This Week's Top Deals"}</h2>
              <p className="text-muted-foreground">Fresh off-market inventory. These don't last long.</p>
            </div>
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white rounded-full font-bold" onClick={() => setLocation("/search")}>
              See All Deals <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          {weekLoading ? (
            <div className="flex items-center justify-center py-16">
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid rgba(249, 115, 22, 0.18)",
                  borderTopColor: "#F97316",
                  borderRadius: "50%",
                  animation: "top-deals-spin 1s linear infinite",
                }}
              />
              <style>{`@keyframes top-deals-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No new deals this week — check back Monday, or browse the full feed.</p>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA — minimal */}
      <section id="footer" className="py-24 px-4 bg-primary text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-light text-white/95 tracking-tight leading-[1.2] mb-8">
            Your next deal is <span className="italic font-serif text-accent">one search</span> away.
          </h2>
          <Button
            onClick={() => setLocation("/search")}
            className="bg-accent hover:bg-accent/90 text-white rounded-full font-semibold px-8 h-12 text-sm tracking-wide"
          >
            Start searching
          </Button>
        </div>
      </section>
    </div>
  );
}
