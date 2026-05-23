import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search as SearchIcon, ArrowRight, Building2, TrendingUp, HandCoins, Map } from "lucide-react";
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
    document.title = "Triple Diamond Realty — California Handyman Specials & Off-Market Deals";
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
        {/* Background Image with heavy dimming */}
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
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Off-Market Deals in California
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              Find Your Next <br />
              <span className="text-accent inline-block mt-2">Handyman Special</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[480px] mx-auto mb-10 leading-relaxed">
              Hand-picked fixers, wholesale deals, and cash-only opportunities across California. New deals added daily — before they hit the MLS.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto mb-8"
          >
            <form onSubmit={handleSearch} className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a city, ZIP, or address to get started"
                className="w-full h-16 pl-6 pr-16 rounded-full text-lg shadow-xl border-0 focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button 
                type="submit" 
                size="icon"
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
              variant="outline" 
              className="rounded-full bg-transparent border-accent/50 text-accent hover:bg-accent hover:text-white h-12 px-6 font-bold"
              onClick={() => {
                document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Sell a Property
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full bg-transparent border-accent/50 text-accent hover:bg-accent hover:text-white h-12 px-6 font-bold"
              onClick={() => {
                document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Comp with AI
            </Button>
            <Button 
              className="rounded-full bg-accent hover:bg-accent/90 text-white h-12 px-6 font-bold border border-accent shadow-[0_0_15px_rgba(245,158,11,0.4)]"
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
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="Investor" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-primary-foreground/70">
              Trusted by <strong className="text-white">500+</strong> investors
            </div>
          </motion.div>
        </div>

        {/* Diagonal Wedge */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      {/* Value Props Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Triple Diamond</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We've spent years building the network so you don't have to. Here's what gives our buyers the edge.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Building2, title: "Off-Market Inventory", body: "Exclusive access to properties before they are listed on the MLS." },
              { icon: TrendingUp, title: "Vetted Comps", body: "Every deal includes rigorous, realistic comparables to protect your margin." },
              { icon: HandCoins, title: "Cash-Buyer Network", body: "Connect with hard money lenders and partners ready to fund." },
              { icon: Map, title: "California-Focused", body: "Deep local knowledge across NorCal and SoCal markets." }
            ].map((prop, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-muted/30 border border-border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <prop.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{prop.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{prop.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three simple steps to secure your next profitable flip or rental.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10" />

            {[
              { step: 1, title: "Search the Deal Feed", body: "Filter by ZIP, price, and deal type to find properties that fit your buy box." },
              { step: 2, title: "Run Instant Comps", body: "Review the numbers, ARV estimates, and neighborhood data we provide." },
              { step: 3, title: "Close in Days, Not Months", body: "We handle the paperwork to ensure a smooth, rapid closing." }
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
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">This Week's Top Deals</h2>
              <p className="text-muted-foreground">Fresh inventory that won't last long.</p>
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

      {/* Final CTA */}
      <section id="footer" className="py-24 bg-primary text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to find your next deal?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of California investors who rely on Triple Diamond Realty for off-market inventory.
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
