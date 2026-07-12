import { useState } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import MlsSearchAutocomplete from "@/components/MlsSearchAutocomplete";
import type { MlsAutocompleteHit } from "@/services/mls.service";

/**
 * Hero search block. All four submit paths (search-icon button, Enter key,
 * "Find Your Next Deal", "Comp with AI") route to /search?q=<address>. The
 * search page reads ?q= and drives the MLS query via the same `searchQuery`
 * param the filter drawer uses, so the buyer lands on real results.
 *
 * Empty submit shows a toast instead of navigating with a blank ?q — otherwise
 * the search page would just render the full firehose, which is confusing.
 */
export default function SearchBarBlock() {
  const [, setLocation] = useLocation();
  const [q, setQ] = useState("");

  const goToSearch = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      toast.error("Enter the property address first", {
        description: "Type a city, ZIP, or address to search deals.",
      });
      return;
    }
    setLocation(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleAutocompletePick = (hit: MlsAutocompleteHit) => {
    // Buyer picked a specific row — send the full street address so the
    // search page's token matcher lands the exact listing.
    setLocation(`/search?q=${encodeURIComponent(hit.fullstreetaddress)}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl mx-auto mb-8"
      >
        <div className="relative" role="search" aria-label="Search real estate deals">
          <label htmlFor="hero-search" className="sr-only">
            Search by city, ZIP, or address
          </label>
          <div
            className="absolute -inset-1 rounded-full bg-accent/40 blur-md opacity-80 pointer-events-none"
            aria-hidden="true"
          />
          <MlsSearchAutocomplete
            value={q}
            onChange={setQ}
            onSelect={handleAutocompletePick}
            onSubmit={goToSearch}
            hideDecorations
            placeholder="Enter city, ZIP, or address"
            inputClassName="relative w-full h-16 pl-6 pr-16 rounded-full text-lg bg-white text-primary placeholder:text-primary/60 shadow-2xl ring-2 ring-accent border-0 focus-visible:ring-4 focus-visible:ring-accent"
          />
          <Button
            type="button"
            size="icon"
            aria-label="Search deals"
            onClick={() => goToSearch(q)}
            className="absolute right-2 top-2 h-12 w-12 rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg z-10"
          >
            <SearchIcon className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 mb-6"
      >
        <Button
          className="rounded-full bg-accent hover:bg-accent/90 text-white h-14 px-10 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.5)] w-full sm:w-auto"
          onClick={() => goToSearch(q)}
        >
          Find Your Next Deal
        </Button>
        <Button
          variant="outline"
          className="rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary h-14 px-8 font-semibold text-base w-full sm:w-auto"
          onClick={() => setLocation("/sell-property")}
        >
          Sell a Property
        </Button>
        <Button
          variant="outline"
          className="rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary h-14 px-8 font-semibold text-base w-full sm:w-auto"
          onClick={() => goToSearch(q)}
        >
          Comp with AI
        </Button>
      </motion.div>
    </>
  );
}
