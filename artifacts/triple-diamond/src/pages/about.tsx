import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import aboutImg from "@/data/images/about-team.png";

import team1 from "@/data/images/team_1.jpg";
import team2 from "@/data/images/team_2.jpg";
import team3 from "@/data/images/team_3.jpg";
import team4 from "@/data/images/team_4.jpg";

export default function About() {
  useEffect(() => {
    document.title = "About Triple Diamond Realty | 30 Years of Off-Market Real Estate";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Three decades. Thousands of properties. The most powerful off-market real estate technology on the market. Meet the team behind Triple Diamond Realty.");
  }, []);

  const team = [
    {
      name: "Marcus Chen",
      title: "Founder & Principal Broker",
      bio: "Three decades sourcing off-market real estate. Specializes in distressed multi-family and BRRRR-ready single-family deals.",
      image: team1,
    },
    {
      name: "Priya Patel",
      title: "Head of Acquisitions",
      bio: "Builds the seller relationships that surface our diamonds in the rough. She uncovers properties before they ever reach the public market.",
      image: team2,
    },
    {
      name: "Diego Ramirez",
      title: "Comps & Underwriting",
      bio: "Runs the numbers behind every deal — ARVs, rehab estimates, and neighborhood comparables you can take to the bank.",
      image: team3,
    },
    {
      name: "Aisha Williams",
      title: "Investor Relations",
      bio: "Matches our investor buy-boxes with the right inventory. Your go-to for everything from first flip to portfolio scale.",
      image: team4,
    },
  ];

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
              30 Years of Finding <br /><span className="text-accent">Diamonds in the Rough</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto leading-relaxed">
              Triple Diamond Realty isn't a traditional retail brokerage. We are a specialized off-market acquisitions team — three decades deep, thousands of properties closed, and powered by the most advanced deal-finding technology on the market today.
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
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Built by Investors, for Investors</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For 30 years, our team has worked one corner of real estate that retail agents won't touch: the off-market world of fixer-uppers, handyman specials, wholesale assignments, distressed sales and cash-only opportunities. Thousands of properties later, we've turned that hunt into a system.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every property we list is a <strong className="text-primary">diamond in the rough</strong> — a real opportunity with real margin. Our proprietary deal-finding technology scans the entire market 24/7, scoring opportunities for ARV, rehab cost and buyer demand before our acquisitions team ever picks up the phone. By the time a deal hits our feed, the work is done. All you do is decide.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're closing your first flip in Riverside, scaling a rental portfolio in the Inland Empire, or hunting your next value-add multi-family in Oakland — we've already found it. We supply the inventory. You build the wealth.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img src={aboutImg} alt="Triple Diamond Realty acquisitions team" className="w-full h-auto aspect-[4/3] object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: "30+", label: "Years in the Business" },
              { value: "1000s", label: "Properties Closed" },
              { value: "#1", label: "Off-Market Tech Platform" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <div className="text-4xl md:text-5xl font-black text-accent mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-primary uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Meet the Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The people working the phones, running the numbers, and feeding the most powerful off-market deal engine in the market.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="aspect-square mb-6 overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                <div className="text-accent font-semibold text-sm mb-3">{member.title}</div>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-center px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Stop competing with retail buyers.</h2>
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
