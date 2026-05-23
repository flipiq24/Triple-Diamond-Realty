import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, MapPin, BedDouble, Bath, Square, Lock } from "lucide-react";
import { type Listing } from "@/data/listings";
import { Button } from "@/components/ui/button";
import EmailAgentDialog from "@/components/EmailAgentDialog";
import RegisterDialog from "@/components/RegisterDialog";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { toast } from "sonner";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case "Handyman Special":
      case "Fixer":
        return "bg-accent text-accent-foreground";
      case "Cash Only":
      case "Wholesale":
        return "bg-primary text-primary-foreground";
      case "New Listing":
        return "bg-green-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const href = `/property/${listing.id}`;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { verified } = useBuyerVerified();
  const [, setLocation] = useLocation();

  const handleViewDeal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (verified) {
      setLocation(href);
    } else {
      setRegisterOpen(true);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <Link href={href} className="relative aspect-4/3 overflow-hidden bg-muted block">
        <img
          src={listing.image}
          alt={listing.street}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Status Pill */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(listing.dealType)}`}>
            {listing.dealType}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm bg-white text-primary border border-primary/20 uppercase tracking-wider">
            AS-IS
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm bg-primary/90 text-white uppercase tracking-wider">
            Status: {listing.dealType === "New Listing" ? "MLS" : listing.dealType === "Wholesale" ? "Assignment" : "Off-Market"}
          </span>
        </div>

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaved(!saved);
            toast(saved ? "Removed from saved" : "Property saved");
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-accent text-accent" : "text-primary"}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="text-2xl font-bold text-primary mb-3">
          {formatPrice(listing.price)}
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 font-medium">
          <div className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            {listing.beds === 0 ? "Any" : listing.beds} Beds
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            {listing.baths === 0 ? "Any" : listing.baths} Baths
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1">
            <Square className="w-3.5 h-3.5" />
            {listing.sqft > 0 ? listing.sqft.toLocaleString() : "--"} sqft
          </div>
        </div>

        {/* Location — city only until verified */}
        <div className="mt-auto mb-5">
          {verified ? (
            <>
              <div className="text-sm font-semibold text-foreground mb-0.5">{listing.street}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.city}, {listing.state} {listing.zip}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-foreground mb-0.5 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground italic">Address available after verification</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.city}, {listing.state}
              </div>
            </>
          )}
        </div>

        {/* Primary CTA — opens register dialog if not verified, else navigates */}
        <Button
          onClick={handleViewDeal}
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-lg h-11"
        >
          {verified ? "View Deal" : "View Deal"}
        </Button>
        <button
          onClick={() => setDialogOpen(true)}
          className="block w-full mt-2 text-center text-xs font-semibold text-primary/80 hover:text-accent underline underline-offset-2"
        >
          Email the listing agent
        </button>
        {/* Brokerage disclosure (CAR-compliant) — moved to bottom */}
        <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground font-medium leading-snug">
          Listed by <span className="text-foreground">{listing.agentName}</span> · {listing.brokerageDRE}
          <br />
          Brokered by <span className="text-foreground">{listing.brokerage}</span>
        </div>
        <EmailAgentDialog listing={listing} open={dialogOpen} onOpenChange={setDialogOpen} />
        <RegisterDialog
          open={registerOpen}
          onOpenChange={setRegisterOpen}
          onVerified={() => setLocation(href)}
        />
      </div>
    </div>
  );
}
