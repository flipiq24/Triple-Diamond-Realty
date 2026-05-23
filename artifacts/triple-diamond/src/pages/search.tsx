import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon, SlidersHorizontal, X, Map as MapIcon, List as ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListingCard from "@/components/ListingCard";
import { listings, type Listing } from "@/data/listings";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Marker as LeafletMarker } from "leaflet";

// Create custom pin icon
const createCustomIcon = (isSelected: boolean) => L.divIcon({
  className: "custom-pin",
  html: `<div class="w-4 h-4 rounded-full bg-accent border-2 border-white shadow-sm ${isSelected ? 'ring-4 ring-primary scale-125' : ''} transition-all duration-300"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

// Component to handle map scrolling when a card is clicked
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
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  const initialView = searchParams.get("view") === "map" ? "map" : "list";

  const [view, setView] = useState<"list" | "map">(initialView);
  const [query, setQuery] = useState(initialQuery);
  const [priceMax, setPriceMax] = useState<string>("any");
  const [beds, setBeds] = useState<string>("any");
  const [baths, setBaths] = useState<string>("any");
  const [dealType, setDealType] = useState<string>("any");
  const [propertyType, setPropertyType] = useState<string>("any");

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

  const resetFilters = () => {
    setQuery("");
    setPriceMax("any");
    setBeds("any");
    setBaths("any");
    setDealType("any");
    setPropertyType("any");
  };

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (query) {
        const q = query.toLowerCase();
        const addressStr = `${listing.street} ${listing.city} ${listing.zip}`.toLowerCase();
        if (!addressStr.includes(q)) return false;
      }
      if (priceMax !== "any" && listing.price > parseInt(priceMax)) return false;
      if (beds !== "any" && listing.beds < parseInt(beds)) return false;
      if (baths !== "any" && listing.baths < parseInt(baths)) return false;
      if (dealType !== "any" && listing.dealType !== dealType) return false;
      if (propertyType !== "any" && listing.propertyType !== propertyType) return false;
      return true;
    });
  }, [query, priceMax, beds, baths, dealType, propertyType]);

  const handleCardClick = (listing: Listing) => {
    setSelectedCenter([listing.lat, listing.lng]);
    const m = markerRefs.current[listing.id];
    if (m) {
      setTimeout(() => m.openPopup(), 250);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-primary mb-1">Handyman Specials</h1>
            <p className="text-muted-foreground">
              <strong className="text-primary">{filteredListings.length}</strong> deals available now
            </p>
          </div>
          
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
            <div className="relative w-full md:w-64 shrink-0">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, ZIP, or address..."
                className="pl-9 bg-muted/50"
              />
            </div>

            <Select value={priceMax} onValueChange={setPriceMax}>
              <SelectTrigger className="w-[130px] bg-muted/50">
                <SelectValue placeholder="Max Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Price</SelectItem>
                <SelectItem value="100000">Under $100k</SelectItem>
                <SelectItem value="200000">Under $200k</SelectItem>
                <SelectItem value="300000">Under $300k</SelectItem>
                <SelectItem value="500000">Under $500k</SelectItem>
                <SelectItem value="750000">Under $750k</SelectItem>
                <SelectItem value="1000000">Under $1M</SelectItem>
              </SelectContent>
            </Select>

            <Select value={beds} onValueChange={setBeds}>
              <SelectTrigger className="w-[110px] bg-muted/50">
                <SelectValue placeholder="Beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Beds</SelectItem>
                <SelectItem value="1">1+ Beds</SelectItem>
                <SelectItem value="2">2+ Beds</SelectItem>
                <SelectItem value="3">3+ Beds</SelectItem>
                <SelectItem value="4">4+ Beds</SelectItem>
              </SelectContent>
            </Select>

            <Select value={baths} onValueChange={setBaths}>
              <SelectTrigger className="w-[110px] bg-muted/50">
                <SelectValue placeholder="Baths" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Baths</SelectItem>
                <SelectItem value="1">1+ Baths</SelectItem>
                <SelectItem value="2">2+ Baths</SelectItem>
                <SelectItem value="3">3+ Baths</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dealType} onValueChange={setDealType}>
              <SelectTrigger className="w-[150px] bg-muted/50">
                <SelectValue placeholder="Deal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Deals</SelectItem>
                <SelectItem value="Handyman Special">Handyman Special</SelectItem>
                <SelectItem value="Fixer">Fixer</SelectItem>
                <SelectItem value="Cash Only">Cash Only</SelectItem>
                <SelectItem value="Wholesale">Wholesale</SelectItem>
                <SelectItem value="New Listing">New Listing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-[150px] bg-muted/50">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Types</SelectItem>
                <SelectItem value="Single Family">Single Family</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground ml-auto">
              <X className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
              <SlidersHorizontal className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl font-bold text-primary mb-2">No deals match your filters</h3>
              <p className="text-muted-foreground mb-6">Try widening your criteria.</p>
              <Button onClick={resetFilters} className="bg-primary text-white rounded-full">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 lg:h-[720px]">
          {/* Map Mobile: Top, Desktop: Right */}
          <div className="order-1 lg:order-2 relative z-0 h-[340px] lg:h-full">
            <MapContainer 
              center={[37.3, -119.5]} 
              zoom={6} 
              scrollWheelZoom
              style={{ width: '100%', height: '100%', zIndex: 0 }}
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
                      <div className="text-sm font-medium mb-3">{listing.street}</div>
                      <Button className="w-full h-8 text-xs bg-accent hover:bg-accent/90">View Deal</Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Cards Mobile: Bottom, Desktop: Left */}
          <div className="order-2 lg:order-1 lg:overflow-y-auto bg-muted/10 p-4 border-r border-border lg:h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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