import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Upload, ArrowRight, ArrowLeft, Tag, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SeoHead from "@/components/SeoHead";
import { toast } from "sonner";

type Market = "on" | "off" | "";
type Role = "seller" | "wholesaler" | "agent" | "";

export default function SellProperty() {
  const [step, setStep] = useState(1);
  const [market, setMarket] = useState<Market>("");
  const [role, setRole] = useState<Role>("");
  const [hasContract, setHasContract] = useState<"yes" | "no" | "">("");
  const [address, setAddress] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [showingInstructions, setShowingInstructions] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const skipContractQuestion = role === "seller";

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos(Array.from(e.target.files));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill in your contact info");
      return;
    }
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  // ON-market blocker
  if (market === "on") {
    return (
      <div className="w-full bg-white">
        <SeoHead title="Sell a Property — Triple Diamond Realty" description="List your off-market deal with Triple Diamond Realty." path="/sell-property" />
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold text-primary mb-4">On-MLS listings aren't accepted here</h1>
          <p className="text-lg text-foreground/80 mb-6">
            We do <strong>not</strong> allow people to post for free if the property is already on the MLS.
            Triple Diamond is built for <strong>off-market deals</strong> only — pocket listings, wholesale assignments,
            and pre-market opportunities.
          </p>
          <p className="text-base text-muted-foreground mb-8">
            If your property is already listed on the MLS, work with your existing listing agent or contact us
            directly at <a href="tel:9092804906" className="underline text-primary">(909) 280-4906</a> to discuss buyer-side options.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setMarket("")} variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Go back
            </Button>
            <Link href="/search">
              <Button className="rounded-full bg-accent hover:bg-accent/90 text-white">Browse buyer deals instead</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS state
  if (submitted) {
    return (
      <div className="w-full bg-white">
        <SeoHead title="Property Submitted — Triple Diamond Realty" description="" path="/sell-property" />
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-primary mb-3">You're in! 🎉</h1>
          <p className="text-lg text-foreground/80 mb-2">
            Thanks {name.split(" ")[0]}. We've received your property at <strong>{address}</strong>.
          </p>
          <p className="text-base text-muted-foreground mb-8">
            A Triple Diamond buyer-rep will text or call {phone} within 1 business day to verify details and
            push your deal out to our active buyer list. There is <strong>no cost</strong> to you.
          </p>
          <Link href="/">
            <Button className="rounded-full bg-primary text-white">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <SeoHead
        title="Sell a Property — Triple Diamond Realty"
        description="Have an off-market property? Post it free and connect with serious cash buyers."
        path="/sell-property"
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Sell a Property</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto">
            Off-market deal? Post it in 60 seconds and we'll connect you with serious cash buyers.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
            <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-accent" /> No cost to post</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-accent" /> Buyer network of 1,200+ investors</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent" /> No public listing — discreet</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= n ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {n}
              </div>
              {n < 3 && <div className={`flex-1 h-1 mx-2 ${step > n ? "bg-accent" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* STEP 1 — qualification */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-bold">Is the property on or off market?</Label>
                <p className="text-sm text-muted-foreground mb-3">We only accept off-market deals.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["off", "on"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMarket(m)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        market === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-bold text-primary">{m === "off" ? "Off-Market" : "On MLS"}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {m === "off" ? "Pocket / pre-market / wholesale" : "Already on the MLS"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {market === "off" && (
                <>
                  <div>
                    <Label className="text-lg font-bold">Who are you?</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      {([
                        { v: "seller", l: "Seller", d: "I own the property" },
                        { v: "wholesaler", l: "Wholesaler", d: "I have it under contract" },
                        { v: "agent", l: "Agent", d: "Off-market pocket listing" },
                      ] as { v: Role; l: string; d: string }[]).map((r) => (
                        <button
                          key={r.v}
                          type="button"
                          onClick={() => { setRole(r.v); if (r.v === "seller") setHasContract(""); }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            role === r.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="font-bold text-primary">{r.l}</div>
                          <div className="text-xs text-muted-foreground mt-1">{r.d}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {role && !skipContractQuestion && (
                    <div>
                      <Label className="text-lg font-bold">Do you have a contract with the seller?</Label>
                      <div className="flex gap-3 mt-3">
                        {(["yes", "no"] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setHasContract(v)}
                            className={`px-6 py-3 rounded-full border-2 font-semibold capitalize ${
                              hasContract === v ? "border-primary bg-primary text-white" : "border-border hover:border-primary"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {role && (skipContractQuestion || hasContract) && (
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-full"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 2 — property */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="address" className="font-bold">Property address *</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, CA 90000" required />
              </div>
              <div>
                <Label htmlFor="price" className="font-bold">Asking price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="price" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value.replace(/\D/g, ""))} className="pl-7" placeholder="350,000" required />
                </div>
              </div>
              <div>
                <Label htmlFor="photos" className="font-bold">Pictures</Label>
                <label htmlFor="photos" className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <div className="text-sm font-semibold text-foreground">
                    {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? "s" : ""} selected` : "Click to upload photos"}
                  </div>
                  <div className="text-xs text-muted-foreground">JPG, PNG, HEIC</div>
                  <input id="photos" type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                </label>
              </div>
              <div>
                <Label htmlFor="desc" className="font-bold">Description</Label>
                <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beds, baths, sqft, condition, repairs needed, ARV if known..." />
              </div>
              <div>
                <Label htmlFor="showing" className="font-bold">Showing instructions</Label>
                <Textarea id="showing" rows={2} value={showingInstructions} onChange={(e) => setShowingInstructions(e.target.value)} placeholder="Lockbox code, gate code, occupied/vacant, call first, etc." />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (!address || !askingPrice) {
                      toast.error("Please add address and asking price");
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-full"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — contact */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="name" className="font-bold">Your name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email" className="font-bold">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="phone" className="font-bold">Phone *</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="rounded-xl bg-accent/10 border border-accent/30 p-5 text-sm">
                <div className="font-bold text-primary mb-1">There is no cost to post.</div>
                <div className="text-foreground/80">
                  We'll connect you with our active buyer network — no listing fee, no commission obligation,
                  no public listing. A buyer-rep will reach out within 1 business day.
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
                  Post my property — free
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
