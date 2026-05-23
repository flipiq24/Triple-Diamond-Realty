import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search as SearchIcon, ArrowRight, Building2, TrendingUp, HandCoins, Map, Gem, Cpu, ShieldCheck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import ListingCard from "@/components/ListingCard";
import { listings } from "@/data/listings";
import heroBg from "@/data/images/hero-bg.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Triple Diamond Realty | California Off-Market Deals, Fixer-Uppers & Handyman Specials";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "30 years. Thousands of California properties. The most powerful off-market real estate technology on the market. Find your next diamond in the rough today.");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const featuredListings = listings.slice(0, 3);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-primary pt-24 pb-48 px-4 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95 z-0" />

        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.05]">
              Find Your <span className="text-accent">Diamond</span> <br />
              <span className="inline-block mt-2">in the Rough</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto mb-4 leading-relaxed">
              California's #1 source for <strong className="text-white">off-market handyman specials</strong>, fixer-uppers, wholesale deals and cash-only investment properties.
            </p>
            <p className="text-base md:text-lg text-primary-foreground/70 max-w-2xl mx-auto mb-10">
              30 years in the business. Thousands of properties closed. The most powerful deal-finding technology on the market today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto mb-8"
          >
            <form onSubmit={handleSearch} className="relative" role="search" aria-label="Search California real estate deals">
              <label htmlFor="hero-search" className="sr-only">Search by city, ZIP, or address</label>
              <Input
                id="hero-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a California city, ZIP, or address"
                className="w-full h-16 pl-6 pr-16 rounded-full text-lg shadow-xl border-0 focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Search deals"
                className="absolute right-2 top-2 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-white"
              >
                <SearchIcon className="w-5 h-5" />
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Button
              className="rounded-full bg-accent hover:bg-accent/90 text-white h-12 px-6 font-bold"
              onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Sell a Property
            </Button>
            <Button
              className="rounded-full bg-accent hover:bg-accent/90 text-white h-12 px-6 font-bold"
              onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Comp with AI
            </Button>
            <Button
              className="rounded-full bg-accent hover:bg-accent/90 text-white h-12 px-6 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              onClick={() => setLocation('/search')}
            >
              Find Your Next Deal!
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-muted overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-primary-foreground/70">
              Trusted by <strong className="text-white">thousands</strong> of California investors
            </div>
          </motion.div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      {/* Trust Strip */}
      <section className="py-10 bg-white relative z-10 border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Award, value: "30+", label: "Years in California Real Estate" },
            { icon: Gem, value: "1000s", label: "Properties Sourced & Closed" },
            { icon: Cpu, value: "#1", label: "Off-Market Deal Technology" },
            { icon: ShieldCheck, value: "$0", label: "Buyer-Side Fees" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <s.icon className="w-6 h-6 text-accent mb-2" aria-hidden="true" />
              <div className="text-2xl md:text-3xl font-black text-primary">{s.value}</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why California Investors Choose Triple Diamond Realty</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three decades of relationships. The state's most advanced off-market deal engine. Real properties, real numbers, real margin — every single day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Building2, title: "Off-Market Inventory", body: "Exclusive access to handyman specials, fixer-uppers and distressed properties across California — before they ever touch the MLS." },
              { icon: Cpu, title: "Powered by Smart Tech", body: "The most powerful property-sourcing technology on the market scans, scores and surfaces opportunities 24/7 so you see the deal first." },
              { icon: TrendingUp, title: "Vetted ARV & Comps", body: "Every deal comes with realistic After-Repair-Value estimates, rehab budgets and comparable sales — underwriting you can trust." },
              { icon: HandCoins, title: "Cash-Buyer Network", body: "Plug into a statewide network of hard-money lenders, JV partners and cash buyers ready to close in days, not months." },
            ].map((prop, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-muted/30 border border-border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <prop.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{prop.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{prop.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From search to close in three simple steps. No retail competition. No bidding wars. Just diamonds in the rough.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10" />
            {[
              { step: 1, title: "Search the Deal Feed", body: "Filter California off-market inventory by ZIP, price, beds, and deal type to match your buy box." },
              { step: 2, title: "Run Instant Comps", body: "Review ARVs, rehab estimates, and neighborhood comparables on every property — underwriting included." },
              { step: 3, title: "Close in Days, Not Months", body: "Cash, hard-money, or conventional — we handle the paperwork so you close fast and start your project." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-accent text-accent flex items-center justify-center text-4xl font-black mb-6 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-[280px]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">This Week's Top California Deals</h2>
              <p className="text-muted-foreground">Fresh off-market inventory. These don't last long.</p>
            </div>
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-white rounded-full font-bold"
              onClick={() => setLocation('/search')}
            >
              See All Deals <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              className="bg-accent hover:bg-accent/90 text-white rounded-full font-bold px-8 h-12 text-lg"
              onClick={() => setLocation('/search')}
            >
              Browse Full Inventory
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Content / Markets Served */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
            California Off-Market Real Estate — From the Bay to the Border
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              Triple Diamond Realty has spent <strong className="text-primary">30 years sourcing real estate diamonds in the rough</strong> across the entire state of California. We work with flippers, landlords, BRRRR investors, wholesalers, and first-time buyers who want to skip the retail MLS bidding wars and buy directly from motivated sellers.
            </p>
            <p>
              Our team and our proprietary deal-finding technology cover every major California market — <strong className="text-primary">Los Angeles, Orange County, San Diego, Riverside, San Bernardino, the Inland Empire, the Coachella Valley, Bakersfield, Fresno, the Central Valley, Sacramento, the Bay Area, Oakland, San Jose and beyond</strong>. Whether you're hunting for a single-family fixer-upper, a small multi-family value-add, a cash-only handyman special, or a wholesale assignment, we have the inventory.
            </p>
            <p>
              Every deal includes vetted comparable sales, realistic After-Repair-Value estimates, rehab budgets, and a clean title path. No tire-kickers. No retail noise. Just real off-market California real estate, every day.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {["Los Angeles", "San Diego", "Orange County", "Riverside", "San Bernardino", "Inland Empire", "Bakersfield", "Fresno", "Sacramento", "Bay Area", "Oakland", "San Jose", "Long Beach", "Modesto", "Stockton", "Coachella Valley"].map((m) => (
              <span key={m} className="px-3 py-1 rounded-full bg-white border border-border text-sm font-medium text-primary">{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="footer" className="py-24 bg-primary text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to find your next diamond in the rough?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of California investors who rely on Triple Diamond Realty for off-market inventory you can't find anywhere else.
          </p>
          <Button
            className="bg-accent hover:bg-accent/90 text-white rounded-full font-bold px-10 h-14 text-lg shadow-[0_0_20px_rgba(245,158,11,0.5)]"
            onClick={() => setLocation('/search')}
          >
            Start Searching Now
          </Button>
        </div>
      </section>
    </div>
  );
}
