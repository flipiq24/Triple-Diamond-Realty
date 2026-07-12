import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserCircle2 } from "lucide-react";
import aboutImg from "@/data/images/about-team.png";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";
import { useTenantTeamMembers } from "@/hooks/useTenantTeamMembers";

export default function About() {
  const { companyName } = useTenantBranding();
  const cf = useTenantCustomFields();
  const team = useTenantTeamMembers();

  useEffect(() => {
    document.title = `About ${companyName}`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.setAttribute(
        "content",
        `Meet the team behind ${companyName} — decades of off-market real estate expertise.`,
      );
  }, [companyName]);

  // Stats sourced from the same custom_field keys used by AuthorityStrip so
  // the tenant admin only has to fill in three keys once. Whole strip hides
  // if none of them are configured.
  const stats = [
    { value: cf.stat_1_value, label: cf.stat_1_label },
    { value: cf.stat_2_value, label: cf.stat_2_label },
    { value: cf.stat_3_value, label: cf.stat_3_label },
  ].filter((s) => s.value?.trim());

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
              About Us
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              {companyName}
            </h1>
            {cf.tagline && (
              <p className="text-2xl md:text-3xl font-extrabold text-accent mb-6">
                {cf.tagline}
              </p>
            )}
            <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto leading-relaxed">
              {cf.description ||
                `${companyName} is a specialized off-market acquisitions team — deep expertise, thousands of properties closed, and powered by advanced deal-finding technology.`}
            </p>
          </motion.div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-24 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Built by Investors, for Investors
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our team works one corner of real estate that retail agents
                won't touch: the off-market world of fixer-uppers, handyman
                specials, wholesale assignments, distressed sales, and
                cash-only opportunities. Thousands of properties later, we've
                turned that hunt into a system.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every property we list is a{" "}
                <strong className="text-primary">real opportunity</strong> with
                real margin. Our proprietary deal-finding technology scans the
                entire market 24/7, scoring opportunities for ARV, rehab cost,
                and buyer demand before our acquisitions team ever picks up
                the phone. By the time a deal hits our feed, the work is done.
                All you do is decide.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're closing your first flip
                {cf.service_area
                  ? ` in ${cf.service_area}`
                  : ""}
                , scaling a rental portfolio, or hunting your next value-add
                multi-family — we've already found it. We supply the
                inventory. You build the wealth.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={aboutImg}
                alt={`${companyName} acquisitions team`}
                className="w-full h-auto aspect-[4/3] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats (only if configured) */}
      {stats.length > 0 && (
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <div className="text-4xl md:text-5xl font-black text-accent mb-2">
                    {stat.value}
                  </div>
                  {stat.label && (
                    <div className="text-sm font-semibold text-primary uppercase tracking-wider">
                      {stat.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team (only when at least one member is configured in Buyers Hook) */}
      {team.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Meet the Team
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The people working the phones, running the numbers, and
                feeding the deal engine.
              </p>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${
                team.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
              }`}
            >
              {team.map((member, i) => (
                <motion.div
                  key={member.index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="aspect-square mb-6 overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <UserCircle2 className="w-24 h-24 text-muted-foreground/40" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-1">
                    {member.name}
                  </h3>
                  {member.title && (
                    <div className="text-accent font-semibold text-sm mb-3">
                      {member.title}
                    </div>
                  )}
                  {member.bio && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-primary text-center px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Stop competing with retail buyers.
          </h2>
          <Link href="/search">
            <Button className="bg-accent hover:bg-accent/90 text-white rounded-full font-bold px-10 h-14 text-lg">
              Browse Current Deals
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
