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
    document.title = "About — Triple Diamond Realty";
  }, []);

  const team = [
    {
      name: "Marcus Chen",
      title: "Founder & Principal Broker",
      bio: "15 years of sourcing off-market properties across California. Specializes in distressed multi-family deals.",
      image: team1,
    },
    {
      name: "Priya Patel",
      title: "Acquisitions Lead",
      bio: "Expert at building relationships with sellers. She uncovers the hidden gems before they reach the public.",
      image: team2,
    },
    {
      name: "Diego Ramirez",
      title: "Comps & Underwriting",
      bio: "Runs the numbers to ensure every deal on our platform has realistic ARVs and rehab estimates.",
      image: team3,
    },
    {
      name: "Aisha Williams",
      title: "Investor Relations",
      bio: "Connects buyers with the right deals. Your go-to for matching your buy-box with our inventory.",
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
              We Find the Deals <br /> Other Agents Miss
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              We aren't a traditional retail brokerage. We are a specialized acquisitions team focused purely on high-margin investment opportunities.
            </p>
          </motion.div>
        </div>

        {/* Diagonal Wedge */}
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
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Built for Investors, by Investors</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded in 2014, Triple Diamond Realty started with a simple observation: retail MLS listings were becoming too competitive for real estate investors to hit their target margins. The best deals were happening off-market, traded quietly among closed circles.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We built a machine to find those opportunities at scale. Today, we supply fixers, wholesale contracts, and cash-only specials to flippers, landlords, and first-time buyers willing to put in the work. We handle the sourcing, so you can focus on the rehab.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img src={aboutImg} alt="Triple Diamond Team" className="w-full h-auto aspect-[4/3] object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1,200+", label: "Deals Closed" },
              { value: "32%", label: "Avg Below-Market Discount" },
              { value: "11 Years", label: "In California" },
              { value: "$0", label: "Buyer Fees" },
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
            <p className="text-muted-foreground max-w-2xl mx-auto">The people working the phones and running the numbers to bring you inventory.</p>
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
