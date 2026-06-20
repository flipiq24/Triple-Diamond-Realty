import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search as SearchIcon, X, Map as MapIcon, List as ListIcon, Heart, Bookmark, ChevronDown, Trash2 } from "lucide-react";
import { useBuyBoxes } from "@/hooks/useBuyBoxes";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toggleFavorite } from "@/lib/favorites";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { type Listing } from "@/data/listings";
import { useMlsListings } from "@/hooks/useMlsListings";
import SearchFiltersSheet, { defaultFilters, type FilterState } from "@/components/SearchFiltersSheet";
import QuickFilters from "@/components/QuickFilters";
import RegisterDialog from "@/components/RegisterDialog";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { useFavorites } from "@/hooks/useFavorites";
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

  const priceMinNum = filters.priceMin ? parseInt(filters.priceMin) : 0;
  const priceMaxNum = filters.priceMax ? parseInt(filters.priceMax) : 1500000;
  const { listings, total, isLoading, isError, error } = useMlsListings({
    page: 1,
    pageSize: 100,
    last_24_hours: true,
    type: "All",
    source: "MLS",
    pricerange_from: priceMinNum,
    pricerange_to: priceMaxNum,
    searchQuery: query || undefined,
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(null);
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});
  const { verified } = useBuyerVerified();
  const { favorites } = useFavorites();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { boxes: buyBoxes, remove: removeBuyBox } = useBuyBoxes();
  const [activeBuyBoxId, setActiveBuyBoxId] = useState<string | null>(null);
  const applyBuyBox = (id: string) => {
    const b = buyBoxes.find((x) => x.id === id);
    if (!b) return;
    setFilters(b.filters);
    setActiveBuyBoxId(id);
    toast.success(`Applied "${b.name}"`);
  };
  const [, setLocation] = useLocation();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [pendingNavId, setPendingNavId] = useState<string | null>(null);
  const handleMapViewDeal = (id: string) => {
    if (verified) setLocation(`/property/${id}`);
    else { setPendingNavId(id); setRegisterOpen(true); }
  };

  // Adjustable map: column ratio (0.2 - 0.85) and height in px (420 - 1100)
  const [mapFraction, setMapFraction] = useState(0.6);
  const [mapHeight, setMapHeight] = useState(720);
  const splitRef = useRef<HTMLDivElement | null>(null);

  const onColDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      const el = splitRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const frac = (ev.clientX - rect.left) / rect.width;
      // left panel = list, right panel = map; mapFraction is the map's share
      const mapFrac = 1 - Math.min(0.8, Math.max(0.2, frac));
      setMapFraction(mapFrac);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onRowDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = mapHeight;
    const onMove = (ev: MouseEvent) => {
      const next = Math.min(1100, Math.max(420, startH + (ev.clientY - startY)));
      setMapHeight(next);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

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
      // favorites only
      if (favoritesOnly && !favorites.includes(l.id)) return false;

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

      // For-sale only — never show Just Sold on the search page
      if (l.status === "Just Sold") return false;

      // listing status filters (Active / Pending checkboxes)
      if (filters.listingStatus.length > 0) {
        if (!filters.listingStatus.includes(l.status as "Active" | "Pending")) return false;
      }

      // sale types (multi)
      if (filters.saleTypes.length > 0 && !filters.saleTypes.includes(l.saleType)) return false;

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
  }, [listings, query, filters, favorites, favoritesOnly]);

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
            {isLoading ? (
              <span className="text-muted-foreground">Loading deals…</span>
            ) : isError ? (
              <span className="text-red-600">
                Failed to load: {error?.message || "Unknown error"}
              </span>
            ) : (
              <>
                <strong>{filteredListings.length}</strong> of{" "}
                <strong>{total}</strong> deals
              </>
            )}
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
        <div className="container mx-auto space-y-3">
          {buyBoxes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-accent" /> Buy Boxes:
              </span>
              {buyBoxes.map((b) => {
                const active = activeBuyBoxId === b.id;
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-1.5 rounded-full border-2 pl-3 pr-1 py-1 text-sm font-semibold transition ${
                      active
                        ? "bg-accent text-white border-accent"
                        : "bg-white text-primary border-border hover:border-accent"
                    }`}
                  >
                    <button type="button" onClick={() => applyBuyBox(b.id)} className="truncate max-w-[180px]">
                      {b.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBuyBox(b.id)}
                      className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                        active ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
                      }`}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeBuyBox(b.id);
                        if (active) setActiveBuyBoxId(null);
                      }}
                      className={`rounded-full p-1 ${active ? "hover:bg-white/20" : "hover:bg-muted"}`}
                      title="Delete buy box"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-full md:w-64 shrink-0">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, ZIP, or address..."
                className="pl-9 bg-muted/50"
              />
            </div>

            <QuickFilters filters={filters} setFilters={setFilters} />

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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={favoritesOnly ? "default" : "outline"}
                  className={`relative gap-2 rounded-full font-bold ${favoritesOnly ? "bg-accent hover:bg-accent/90 text-white border-accent" : ""}`}
                >
                  <Heart className={`w-4 h-4 ${favoritesOnly ? "fill-white" : "fill-accent text-accent"}`} />
                  My Favorites
                  {favorites.length > 0 && (
                    <span className={`text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center ${favoritesOnly ? "bg-white text-accent" : "bg-accent text-white"}`}>
                      {favorites.length}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-0 overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-primary text-sm">My Favorites</div>
                    <div className="text-xs text-muted-foreground">
                      {favorites.length} saved {favorites.length === 1 ? "property" : "properties"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setFavoritesOnly((v) => !v)}
                    className={`h-8 rounded-full text-xs ${favoritesOnly ? "bg-accent hover:bg-accent/90 text-white" : "bg-primary hover:bg-primary/90 text-white"}`}
                    disabled={favorites.length === 0}
                  >
                    {favoritesOnly ? "Show All" : "Show Only These"}
                  </Button>
                </div>
                {favorites.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Tap the <Heart className="w-3.5 h-3.5 inline fill-accent text-accent" /> on any deal to save it here.
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto divide-y">
                    {favorites.map((fid) => {
                      const l = listings.find((x) => x.id === fid);
                      if (!l) return null;
                      return (
                        <div key={fid} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40">
                          <img src={l.image} alt="" className="w-14 h-14 rounded-md object-cover shrink-0" />
                          <button
                            type="button"
                            onClick={() => handleMapViewDeal(l.id)}
                            className="flex-1 text-left min-w-0"
                          >
                            <div className="font-bold text-primary text-sm truncate">
                              ${l.price.toLocaleString()} · {l.city}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {l.beds} bd · {l.baths} ba · {l.sqft.toLocaleString()} sqft
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => { toggleFavorite(fid); toast.success("Removed from My Favorites"); }}
                            className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-muted"
                            title="Remove from favorites"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {(activeCount > 0 || query || favoritesOnly) && (
              <Button
                onClick={() => { resetAll(); setFavoritesOnly(false); setActiveBuyBoxId(null); }}
                className="ml-auto rounded-full bg-destructive hover:bg-destructive/90 text-white font-bold gap-2 shadow-sm"
              >
                <X className="w-4 h-4" /> Remove all filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      {view === "list" ? (
        <div className="container mx-auto px-4 py-8 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-border overflow-hidden shadow-sm"
                >
                  <div className="aspect-4/3 bg-muted animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-11 w-full bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <h3 className="text-2xl font-bold text-red-600 mb-2">
                Couldn't load deals
              </h3>
              <p className="text-muted-foreground mb-6">
                {error?.message || "Something went wrong. Please try again."}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary text-white rounded-full"
              >
                Retry
              </Button>
            </div>
          ) : filteredListings.length > 0 ? (
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
        <div className="flex flex-col">
          {/* Map on top — full width, sticky so it stays in view as you scroll */}
          <div
            ref={splitRef}
            className="relative z-0 w-full bg-muted/10 border-b"
            style={{ height: `${mapHeight}px` }}
          >
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
                      <div className="text-sm font-medium mb-1 text-muted-foreground italic">
                        {listing.city}, {listing.state}
                      </div>
                      <div className="text-[10px] text-muted-foreground mb-3 truncate">
                        Brokered by {listing.brokerage}
                      </div>
                      <Button
                        onClick={() => handleMapViewDeal(listing.id)}
                        className="w-full h-8 text-xs bg-accent hover:bg-accent/90"
                      >
                        View Deal
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Drag handle to resize map height */}
            <div
              onMouseDown={onRowDragStart}
              className="hidden lg:flex absolute -bottom-1.5 left-0 right-0 h-3 cursor-row-resize items-center justify-center group z-10"
              title="Drag to resize map height"
            >
              <div className="w-16 h-1 rounded-full bg-border group-hover:bg-accent transition-colors" />
            </div>
          </div>

          {/* Listings flow underneath the map */}
          <div className="bg-white px-4 lg:px-8 py-6">
            <div className="text-sm text-muted-foreground mb-4">
              <strong className="text-foreground">{filteredListings.length}</strong> deals on this map
            </div>
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    onMouseEnter={() => setHoveredId(listing.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleCardClick(listing)}
                    className="cursor-pointer"
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No listings found in this area with these filters.
              </div>
            )}
          </div>
        </div>
      )}

      <RegisterDialog
        open={registerOpen}
        onOpenChange={(o) => { setRegisterOpen(o); if (!o) setPendingNavId(null); }}
        onVerified={() => { if (pendingNavId) setLocation(`/property/${pendingNavId}`); }}
      />
    </div>
  );
}
