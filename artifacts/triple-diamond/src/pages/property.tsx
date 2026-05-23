import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, ChevronRight, MapPin, Home, Calendar, DollarSign, Hammer, Heart, Share2, Phone, Mail } from "lucide-react";
import { listings } from "@/data/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import SeoHead from "@/components/SeoHead";
import RegisterDialog from "@/components/RegisterDialog";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const pin = L.divIcon({
  className: "custom-pin",
  html: `<div class="w-5 h-5 rounded-full bg-accent border-2 border-white shadow-lg ring-4 ring-primary/20"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function Property() {
  const [, params] = useRoute("/property/:id");
  const id = params?.id;
  const listing = useMemo(() => listings.find((l) => l.id === id), [id]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { verified } = useBuyerVerified();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-extrabold text-primary mb-2">Property not found</h1>
        <p className="text-muted-foreground mb-6">This deal may have been removed or sold.</p>
        <Link href="/search">
          <Button className="bg-primary text-white rounded-full">Browse all deals</Button>
        </Link>
      </div>
    );
  }

  // Treat the single image as a gallery for layout purposes
  const photos = [listing.image, listing.image, listing.image, listing.image];

  const pricePerSqft = Math.round(listing.price / listing.sqft);
  const monthlyEst = Math.round((listing.price * 0.0065)); // rough P&I + tax/ins ballpark
  const age = new Date().getFullYear() - listing.yearBuilt;

  const statusLabel = listing.status === "Pending" ? "Contingent" : listing.status;
  const statusDot =
    listing.status === "Active" ? "bg-green-500" :
    listing.status === "Pending" ? "bg-yellow-500" :
    "bg-gray-400";

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill in name, email, and phone");
      return;
    }
    toast.success("Request sent!", {
      description: "A Triple Diamond agent will reach out within 1 business day.",
    });
    setName(""); setEmail(""); setPhone(""); setMessage(""); setShowMessage(false);
  };

  const chips = [
    listing.propertyType,
    listing.dealType,
    `Built ${listing.yearBuilt}`,
    listing.stories === 1 ? "Single story" : "Multi story",
    listing.garage > 0 ? `${listing.garage}-car garage` : "No garage",
    "Off-market opportunity",
  ];

  return (
    <div className="w-full bg-white">
      <SeoHead
        title={`${verified ? `${listing.street}, ` : ""}${listing.city}, ${listing.state}${verified ? ` ${listing.zip}` : ""} | Triple Diamond Realty`}
        description={`${listing.beds} bd, ${listing.baths} ba, ${listing.sqft.toLocaleString()} sqft ${listing.propertyType} — $${listing.price.toLocaleString()}. ${listing.description ?? ""}`}
        path={`/property/${listing.id}`}
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Verification gate banner */}
        {!verified && (
          <div className="mb-4 rounded-xl border-2 border-accent/40 bg-accent/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
            <div className="flex-1 text-sm">
              <strong className="text-primary">Verified-buyer access only.</strong>{" "}
              The full address, exact map pin, and showing instructions are hidden.
              Register with your email and phone to unlock — it takes 30 seconds.
            </div>
            <Button onClick={() => setRegisterOpen(true)} className="bg-accent hover:bg-accent/90 text-white rounded-full whitespace-nowrap">
              Register to unlock
            </Button>
          </div>
        )}

        {/* Listing agent / brokerage line (CAR-compliant) */}
        <div className="text-sm text-muted-foreground mb-3">
          Listed by <span className="underline font-semibold text-primary">{listing.agentName}</span>{verified ? ` (${listing.agentPhone})` : ""}
          <br />
          Brokered by <span className="font-semibold text-foreground">{listing.brokerage}</span> · {listing.brokerageDRE}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-xl overflow-hidden mb-6 bg-muted">
          <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto md:h-[500px]">
            <img src={photos[photoIdx]} alt={listing.street} className="w-full h-full object-cover" />
            <button
              onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
              {photoIdx + 1}/{photos.length}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 h-[500px]">
            {[
              { src: photos[1], label: "Kitchen" },
              { src: photos[2], label: "Living room" },
              { src: photos[3], label: "Bathroom" },
            ].map((p, i) => (
              <div key={i} className="relative flex-1 overflow-hidden">
                <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 text-white font-semibold text-sm drop-shadow">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* LEFT — main column */}
          <div>
            {/* Status + price block */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
              <span className="font-bold text-primary">{statusLabel}</span>
              {listing.priceReduced && (
                <span className="ml-2 text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded">Price reduced</span>
              )}
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaved((s) => !s)}
                  className="gap-2"
                >
                  <Heart className={`w-4 h-4 ${saved ? "fill-accent text-accent" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast("Link copied");
                  }}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>

            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
              ${listing.price.toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-base font-semibold text-foreground mb-2">
              <span><strong>{listing.beds}</strong> bed</span>
              <span><strong>{listing.baths}</strong> bath</span>
              <span><strong>{listing.sqft.toLocaleString()}</strong> sqft</span>
              <span><strong>{listing.lotSqft.toLocaleString()}</strong> sqft lot</span>
            </div>
            {verified ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.street}, ${listing.city}, ${listing.state} ${listing.zip}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline text-primary inline-flex items-center gap-1"
              >
                <MapPin className="w-4 h-4" />
                {listing.street}, {listing.city}, {listing.state} {listing.zip}
              </a>
            ) : (
              <button
                onClick={() => setRegisterOpen(true)}
                className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium"
              >
                <Lock className="w-3.5 h-3.5 text-accent" />
                <span className="italic text-muted-foreground">Address hidden</span> · <span className="text-foreground">{listing.city}, {listing.state}</span>
                <span className="ml-1 text-primary underline underline-offset-2">Unlock</span>
              </button>
            )}

            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm">
                Est. <strong>${monthlyEst.toLocaleString()}/mo</strong>
              </span>
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Get pre-approved
              </Button>
            </div>

            {/* Chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-foreground">
                  {c}
                </span>
              ))}
            </div>

            {/* Stat tiles */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-2">
                <Home className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">{listing.propertyType}</div>
                  <div className="text-xs text-muted-foreground">Property type</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">{listing.daysOnMarket} days</div>
                  <div className="text-xs text-muted-foreground">{listing.status === "Just Sold" ? "Sold" : "On Triple Diamond"}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">${pricePerSqft}</div>
                  <div className="text-xs text-muted-foreground">Price per sqft</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Hammer className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">{listing.yearBuilt}</div>
                  <div className="text-xs text-muted-foreground">Year built ({age} yrs)</div>
                </div>
              </div>
            </div>

            {/* Property details */}
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="text-2xl font-extrabold text-primary mb-4 flex items-center gap-2">
                <Home className="w-6 h-6" /> Property details
              </h2>
              <p className="text-foreground/90 leading-relaxed mb-6">
                {listing.description ?? "Off-market opportunity sourced direct by the Triple Diamond team."}
                {" "}This {listing.propertyType.toLowerCase()} sits on a {listing.lotSqft.toLocaleString()} sqft lot in {listing.city}.
                Built in {listing.yearBuilt}, offering {listing.beds} bedrooms and {listing.baths} bathrooms across {listing.sqft.toLocaleString()} sqft of living space.
                {" "}Priced at ${listing.price.toLocaleString()} (${pricePerSqft}/sqft) — investor-grade upside for the right buyer.
              </p>

              {/* Interior */}
              <div className="rounded-lg border border-border overflow-hidden mb-6">
                <div className="bg-muted/60 px-4 py-3 font-bold text-primary">Interior</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                  <div>
                    <h4 className="font-bold mb-2">Bedrooms</h4>
                    <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                      <li>Bedrooms: {listing.beds}</li>
                      {listing.stories === 1 && <li>Bedrooms on main level: {listing.beds}</li>}
                    </ul>

                    <h4 className="font-bold mt-5 mb-2">Bathrooms</h4>
                    <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                      <li>Total bathrooms: {listing.baths}</li>
                      <li>Full bathrooms: {Math.floor(listing.baths)}</li>
                      {listing.baths % 1 !== 0 && <li>Half bathrooms: 1</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Other Rooms</h4>
                    <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                      <li>Kitchen</li>
                      <li>Living Room</li>
                      {listing.sqft > 1500 && <li>Dining Room</li>}
                      {listing.propertyType === "Multi-Family" && <li>Separate Unit(s)</li>}
                    </ul>

                    <h4 className="font-bold mt-5 mb-2">Heating and Cooling</h4>
                    <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                      <li>Cooling: Central / Evaporative</li>
                      <li>Heating: Forced Air</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Exterior / Lot */}
              <div className="rounded-lg border border-border overflow-hidden mb-6">
                <div className="bg-muted/60 px-4 py-3 font-bold text-primary">Exterior & Lot</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                  <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                    <li>Lot size: {listing.lotSqft.toLocaleString()} sqft</li>
                    <li>Stories: {listing.stories}</li>
                    <li>Garage: {listing.garage > 0 ? `${listing.garage}-car` : "None"}</li>
                  </ul>
                  <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                    <li>Property type: {listing.propertyType}</li>
                    {listing.hoaMonthly > 0 && <li>HOA: ${listing.hoaMonthly}/month</li>}
                    <li>Sale type: {listing.saleType}</li>
                  </ul>
                </div>
              </div>

              {/* Financial */}
              <div className="rounded-lg border border-border overflow-hidden mb-6">
                <div className="bg-muted/60 px-4 py-3 font-bold text-primary">Financial</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                  <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                    <li>List price: ${listing.price.toLocaleString()}</li>
                    <li>Price per sqft: ${pricePerSqft}</li>
                    <li>Est. monthly: ${monthlyEst.toLocaleString()}/mo</li>
                  </ul>
                  <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
                    <li>Days on Triple Diamond: {listing.daysOnMarket}</li>
                    <li>Status: {statusLabel}</li>
                    <li>Deal type: {listing.dealType}</li>
                  </ul>
                </div>
              </div>

              {/* Listing courtesy of (CAR-compliant) */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/60 px-4 py-3 font-bold text-primary">Listing courtesy of</div>
                <div className="p-5 text-sm text-foreground/80">
                  <div className="font-semibold text-foreground">{listing.agentName}</div>
                  <div>Brokered by {listing.brokerage}</div>
                  <div className="text-muted-foreground">{listing.brokerageDRE}</div>
                  <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                    Information deemed reliable but not guaranteed. Listing information provided
                    courtesy of the listing brokerage; Triple Diamond Realty may act as a cooperating
                    broker. Buyer to verify all material facts. Equal Housing Opportunity.
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="text-2xl font-extrabold text-primary mb-4">Location</h2>
              <div className="h-[360px] rounded-xl overflow-hidden border border-border relative z-0">
                <MapContainer
                  center={[listing.lat, listing.lng]}
                  zoom={verified ? 14 : 11}
                  scrollWheelZoom
                  dragging
                  style={{ width: "100%", height: "100%", zIndex: 0 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {verified && <Marker position={[listing.lat, listing.lng]} icon={pin} />}
                </MapContainer>
                {!verified && (
                  <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur px-5 py-3 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto">
                      <Lock className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-foreground">Exact location hidden — </span>
                      <button onClick={() => setRegisterOpen(true)} className="text-sm font-bold text-primary hover:text-accent underline">
                        Register to view
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
          </div>

          {/* RIGHT — sidebar contact form */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border-2 border-border p-6 shadow-sm bg-white">
              <h3 className="text-xl font-extrabold text-primary mb-4">Contact a buyer's agent</h3>
              <form onSubmit={submitContact} className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-xs">Full name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                {!showMessage ? (
                  <button
                    type="button"
                    onClick={() => setShowMessage(true)}
                    className="text-sm font-semibold text-primary underline underline-offset-2 hover:text-accent"
                  >
                    + Add message
                  </button>
                ) : (
                  <div>
                    <Label htmlFor="message" className="text-xs">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={verified ? `I'm interested in ${listing.street}.` : `I'm interested in the property in ${listing.city}, ${listing.state}.`}
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm pt-1">
                  <Checkbox /> I've served in the U.S. military
                </label>

                <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
                  Email agent
                </Button>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  By proceeding, you consent to receive calls and texts at the number you provided, including marketing by autodialer and prerecorded and artificial voice, from Triple Diamond Realty about your inquiry and other home-related matters (including buying and selling a home), but not as a condition of any purchase.
                </p>
              </form>

              <div className="mt-5 pt-5 border-t border-border space-y-2">
                <a href="tel:9092804906" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent">
                  <Phone className="w-4 h-4" /> (909) 280-4906
                </a>
                <a href="mailto:info@tdrealty.net" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent">
                  <Mail className="w-4 h-4" /> info@tdrealty.net
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
