import { useState } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function SearchBarBlock() {
  const [, setLocation] = useLocation();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl mx-auto mb-8"
      >
        <form onSubmit={submit} className="relative" role="search" aria-label="Search California real estate deals">
          <label htmlFor="hero-search" className="sr-only">Search by city, ZIP, or address</label>
          <Input
            id="hero-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Enter a California city, ZIP, or address"
            className="w-full h-16 pl-6 pr-16 rounded-full text-lg shadow-xl border-0 focus-visible:ring-2 focus-visible:ring-accent"
          />
          <Button type="submit" size="icon" aria-label="Search deals" className="absolute right-2 top-2 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-white">
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
          onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}
        >
          Sell a Property
        </Button>
        <Button
          className="rounded-full bg-accent hover:bg-accent/90 text-white h-12 px-6 font-bold"
          onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}
        >
          Comp with AI
        </Button>
        <Button
          className="rounded-full bg-accent hover:bg-accent/90 text-white h-12 px-6 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          onClick={() => setLocation("/search")}
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
    </>
  );
}
