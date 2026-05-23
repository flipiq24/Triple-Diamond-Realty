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
        <form onSubmit={submit} className="relative" role="search" aria-label="Search real estate deals">
          <label htmlFor="hero-search" className="sr-only">Search by city, ZIP, or county</label>
          <div className="absolute -inset-1 rounded-full bg-accent/40 blur-md opacity-80 pointer-events-none" aria-hidden="true" />
          <Input
            id="hero-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Enter city, ZIP, or county"
            className="relative w-full h-16 pl-6 pr-16 rounded-full text-lg bg-white text-primary placeholder:text-primary/60 shadow-2xl ring-2 ring-accent border-0 focus-visible:ring-4 focus-visible:ring-accent"
          />
          <Button type="submit" size="icon" aria-label="Search deals" className="absolute right-2 top-2 h-12 w-12 rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg">
            <SearchIcon className="w-5 h-5" />
          </Button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 mb-6"
      >
        <Button
          className="rounded-full bg-accent hover:bg-accent/90 text-white h-14 px-10 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.5)] w-full sm:w-auto"
          onClick={() => setLocation("/search")}
        >
          Find Your Next Deal
        </Button>
        <Button
          variant="outline"
          className="rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary h-14 px-8 font-semibold text-base w-full sm:w-auto"
          onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}
        >
          Sell a Property
        </Button>
        <Button
          variant="outline"
          className="rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary h-14 px-8 font-semibold text-base w-full sm:w-auto"
          onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}
        >
          Comp with AI
        </Button>
      </motion.div>
    </>
  );
}
