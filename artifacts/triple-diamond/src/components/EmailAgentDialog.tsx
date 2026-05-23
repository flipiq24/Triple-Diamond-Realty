import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { type Listing } from "@/data/listings";

export default function EmailAgentDialog({
  listing,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  listing: Listing;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`I'm interested in ${listing.street}, ${listing.city}.`);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill in name, email, and phone");
      return;
    }
    toast.success("Request sent!", {
      description: `${listing.agentName} at ${listing.brokerage} will reach out within 1 business day.`,
    });
    setName(""); setEmail(""); setPhone("");
    onOpenChange?.(false);
  };

  return (
    <Dialog open={controlledOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white">
              Email about this property
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              {listing.street}, {listing.city}, {listing.state} {listing.zip}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 border-b border-border bg-muted/40 text-sm">
          <div className="font-semibold text-foreground">{listing.agentName}</div>
          <div className="text-muted-foreground">
            Brokered by {listing.brokerage} · {listing.brokerageDRE}
          </div>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-3">
          <div>
            <Label htmlFor="ea-name" className="text-xs">Full name *</Label>
            <Input id="ea-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="ea-email" className="text-xs">Email *</Label>
            <Input id="ea-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="ea-phone" className="text-xs">Phone *</Label>
            <Input id="ea-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="ea-msg" className="text-xs">Message</Label>
            <Textarea id="ea-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox className="mt-0.5" defaultChecked />
            <span>
              By submitting, I consent to be contacted by Triple Diamond Realty and the listing brokerage about this and similar properties.
              Not a solicitation if already represented by a broker.
            </span>
          </label>

          <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
            Email Agent
          </Button>

          <div className="flex items-center justify-center gap-4 pt-1 text-xs">
            <a href={`tel:${listing.agentPhone.replace(/\D/g, "")}`} className="flex items-center gap-1 font-semibold text-primary hover:text-accent">
              <Phone className="w-3.5 h-3.5" /> {listing.agentPhone}
            </a>
            <span className="text-muted-foreground">·</span>
            <a href="mailto:info@tdrealty.net" className="flex items-center gap-1 font-semibold text-primary hover:text-accent">
              <Mail className="w-3.5 h-3.5" /> info@tdrealty.net
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
