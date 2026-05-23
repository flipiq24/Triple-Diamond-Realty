import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "wouter";
import { Search as SearchIcon, X, Map as MapIcon, List as ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { listings, type Listing } from "@/data/listings";
import SearchFiltersSheet, { defaultFilters, type FilterState } from "@/components/SearchFiltersSheet";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Marker as LeafletMarker } from "leaflet";

const createCustomIcon = (isSelected: boolean) => L.divIcon({
  className: "custom-pin",
  html: `<div class="w-4 h-4 rounded-full bg-accent border-2 border-white shadow-sm ${isSelected ? 'ring-4 ring-primary scale-125' : ''} transition-all duration-300"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  useEffect(() => {
    if (center) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function Search() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  const initialView = searchParams.get("view") === "map" ? "map" : "list";

  const [view, setView] = useState<"list" | "map">(initialView);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(null);
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  useEffect(() => {
    document.title = "Search Deals — Triple Diamond Realty";
  }, []);

  const updateUrl = (newView: "list" | "map") => {
    setView(newView);
    const params = new URLSearchParams(window.location.search);
    params.set("view", newView);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const resetAll = () => {
    setQuery("");
    setFilters(defaultFilters);
  };

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // text search
      if (query) {
        const q = query.toLowerCase();
        const addressStr = `${l.street} ${l.city} ${l.zip}`.toLowerCase();
        if (!addressStr.includes(q)) return false;
      }

      // price
      const min = filters.priceMin ? parseInt(filters.priceMin) : 0;
      const max = filters.priceMax ? parseInt(filters.priceMax) : Infinity;
      if (l.price < min || l.price > max) return false;
      if (filters.priceReduced && !l.priceReduced) return false;

      // beds / baths
      if (filters.beds !== "any") {
        const b = parseInt(filters.beds);
        if (b === 0 ? l.beds !== 0 : l.beds < b) return false;
      }
      if (filters.baths !== "any" && l.baths < parseInt(filters.baths)) return false;

      // home types (multi)
      if (filters.homeTypes.length > 0 && !filters.homeTypes.includes(l.propertyType)) return false;

      // sale status (for-sale = Active/Pending, just-sold = Just Sold)
      if (filters.saleStatus === "for-sale" && l.status === "Just Sold") return false;
      if (filters.saleStatus === "just-sold" && l.status !== "Just Sold") return false;

      // listing status filters (only apply if any checked and on for-sale tab)
      if (filters.saleStatus === "for-sale" && filters.listingStatus.length > 0) {
        if (!filters.listingStatus.includes(l.status as "Active" | "Pending")) return false;
      }

      // sale types (multi)
      if (filters.saleTypes.length > 0 && !filters.saleTypes.includes(l.saleType)) return false;

      // tours
      if (filters.openHouse && !l.hasOpenHouse) return false;
      if (filters.threeDTour && !l.has3DTour) return false;
      if (filters.virtualTour && !l.hasVirtualTour) return false;

      // days on market
      if (filters.daysOnMarket !== "any" && l.daysOnMarket > parseInt(filters.daysOnMarket)) return false;

      // sqft / lot
      const sqftMin = filters.sqftMin ? parseInt(filters.sqftMin) : 0;
      const sqftMax = filters.sqftMax ? parseInt(filters.sqftMax) : Infinity;
      if (l.sqft < sqftMin || l.sqft > sqftMax) return false;
      const lotMin = filters.lotMin ? parseInt(filters.lotMin) : 0;
      const lotMax = filters.lotMax ? parseInt(filters.lotMax) : Infinity;
      if (l.lotSqft < lotMin || l.lotSqft > lotMax) return false;

      // home age
      const currentYear = new Date().getFullYear();
      const age = currentYear - l.yearBuilt;
      const ageMin = filters.ageMin ? parseInt(filters.ageMin) : 0;
      const ageMax = filters.ageMax ? parseInt(filters.ageMax) : Infinity;
      if (age < ageMin || age > ageMax) return false;

      // HOA
      if (filters.hoaMax && l.hoaMonthly > parseInt(filters.hoaMax)) return false;

      // garage
      if (filters.garage !== "any" && l.garage < parseInt(filters.garage)) return false;

      // stories
      if (filters.stories === "single" && l.stories !== 1) return false;
      if (filters.stories === "multi" && l.stories < 2) return false;

      return true;
    });
  }, [query, filters]);

  const handleCardClick = (listing: Listing) => {
    setSelectedCenter([listing.lat, listing.lng]);
    const m = markerRefs.current[listing.id];
    if (m) setTimeout(() => m.openPopup(), 250);
  };

  // count active filters for badge
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.priceMin || filters.priceMax) n++;
    if (filters.priceReduced) n++;
    if (filters.beds !== "any") n++;
    if (filters.baths !== "any") n++;
    if (filters.homeTypes.length) n++;
    if (filters.saleStatus !== "for-sale") n++;
    if (filters.listingStatus.length) n++;
    if (filters.saleTypes.length) n++;
    if (filters.openHouse || filters.threeDTour || filters.virtualTour) n++;
    if (filters.daysOnMarket !== "any") n++;
    if (filters.sqftMin || filters.sqftMax) n++;
    if (filters.lotMin || filters.lotMax) n++;
    if (filters.ageMin || filters.ageMax) n++;
    if (filters.hoaMax) n++;
    if (filters.garage !== "any") n++;
    if (filters.stories !== "any") n++;
    return n;
  }, [filters]);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-extrabold text-primary mb-1">
            <strong>{filteredListings.length}</strong> deals available
          </h1>

          <div className="flex bg-muted rounded-lg p-1 shrink-0">
            <button
              onClick={() => updateUrl("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                view === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <ListIcon className="w-4 h-4" /> List
            </button>
            <button
              onClick={() => updateUrl("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                view === "map" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-border sticky top-[73px] z-40 shadow-sm px-4 py-3">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-full md:w-72 shrink-0">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, ZIP, or address..."
                className="pl-9 bg-muted/50"
              />
            </div>

            <div className="relative">
              <SearchFiltersSheet
                filters={filters}
                setFilters={setFilters}
                resultCount={filteredListings.length}
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
              />
              {activeCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>

            {(activeCount > 0 || query) && (
              <Button variant="ghost" onClick={resetAll} className="text-muted-foreground ml-auto">
                <X className="w-4 h-4 mr-2" /> Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      {view === "list" ? (
        <div className="container mx-auto px-4 py-8 flex-1">
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.5) }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">No deals match your filters</h3>
              <p className="text-muted-foreground mb-6">Try widening your criteria.</p>
              <Button onClick={resetAll} className="bg-primary text-white rounded-full">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 lg:h-[720px]">
          <div className="order-1 lg:order-2 relative z-0 h-[420px] lg:h-full touch-none">
            <MapContainer
              center={[37.3, -119.5]}
              zoom={6}
              scrollWheelZoom
              dragging
              touchZoom
              doubleClickZoom
              keyboard
              style={{ width: '100%', height: '100%', zIndex: 0, cursor: 'grab' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapController center={selectedCenter} />
              {filteredListings.map(listing => (
                <Marker
                  key={listing.id}
                  position={[listing.lat, listing.lng]}
                  icon={createCustomIcon(hoveredId === listing.id)}
                  ref={(ref) => { markerRefs.current[listing.id] = ref; }}
                  eventHandlers={{
                    mouseover: () => setHoveredId(listing.id),
                    mouseout: () => setHoveredId(null),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="w-48">
                      <img src={listing.image} className="w-full h-24 object-cover rounded-t-md mb-2" alt="" />
                      <div className="font-bold text-primary text-lg">
                        ${listing.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {listing.beds} bd | {listing.baths} ba | {listing.sqft} sqft
                      </div>
                      <div className="text-sm font-medium mb-1">{listing.street}</div>
                      <div className="text-[10px] text-muted-foreground mb-3 truncate">
                        Brokered by {listing.brokerage}
                      </div>
                      <Link href={`/property/${listing.id}`}>
                        <Button className="w-full h-8 text-xs bg-accent hover:bg-accent/90">View Deal</Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="order-2 lg:order-1 lg:overflow-y-auto bg-muted/10 p-4 pb-12 border-r border-border lg:h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
              {filteredListings.map(listing => (
                <div
                  key={listing.id}
                  onMouseEnter={() => setHoveredId(listing.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleCardClick(listing)}
                  className="cursor-pointer"
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
              {filteredListings.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No listings found in this area with these filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
