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
          <Input
            id="hero-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Enter city, ZIP, or county"
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
        className="flex justify-center mb-10"
      >
        <Button
          className="rounded-full bg-accent hover:bg-accent/90 text-white h-14 px-10 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.5)]"
          onClick={() => setLocation("/search")}
        >
          Find Your Next Deal
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <p className="text-sm font-medium text-white">
          Active buy box for <strong className="text-accent">1,200+ California investors</strong>
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/70">
          <button
            type="button"
            onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}
            className="underline underline-offset-4 hover:text-accent transition"
          >
            Sell a Property
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}
            className="underline underline-offset-4 hover:text-accent transition"
          >
            Comp with AI
          </button>
        </div>
      </motion.div>
    </>
  );
}
