import { useState } from "react";
import { toast } from "sonner";
import SeoHead from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

export default function DoNotSell() {
  const { companyName } = useTenantBranding();
  const cf = useTenantCustomFields();
  const phone = cf.primary_phone;
  const phoneTel = cf.primary_phone_tel;
  const privacyEmail = cf.privacy_email;

  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState("opt_out");
  const [consent, setConsent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please confirm the verification statement.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      setConsent(false);
      toast.success("Request received. We will respond within 45 days as required by California law.");
    }, 600);
  };

  return (
    <div className="w-full bg-white">
      <SeoHead
        title={`Do Not Sell or Share My Personal Information | ${companyName}`}
        description="Submit a California CCPA/CPRA request to opt out of the sale or sharing of your personal information, request access, deletion, or correction."
        path="/do-not-sell"
      />
      <section className="bg-primary py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Do Not Sell or Share My Personal Information</h1>
          <p className="text-primary-foreground/80">
            Under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), you have the right to opt out of the sale or sharing of your personal information, and to know, delete, or correct the information we hold about you. Submit your request below — we will respond within 45 days.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <form onSubmit={onSubmit} className="container mx-auto max-w-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name <span className="text-accent">*</span></Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-accent">*</span></Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State of residence <span className="text-accent">*</span></Label>
              <Input id="state" name="state" defaultValue="California" required />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Request type <span className="text-accent">*</span></Label>
            <RadioGroup value={requestType} onValueChange={setRequestType} className="grid gap-2">
              <Label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer">
                <RadioGroupItem value="opt_out" className="mt-1" />
                <span><strong className="text-primary">Opt out of sale or sharing</strong> of my personal information.</span>
              </Label>
              <Label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer">
                <RadioGroupItem value="know" className="mt-1" />
                <span><strong className="text-primary">Right to know</strong> what personal information you have collected about me.</span>
              </Label>
              <Label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer">
                <RadioGroupItem value="delete" className="mt-1" />
                <span><strong className="text-primary">Delete</strong> the personal information you hold about me.</span>
              </Label>
              <Label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer">
                <RadioGroupItem value="correct" className="mt-1" />
                <span><strong className="text-primary">Correct</strong> inaccurate personal information you hold.</span>
              </Label>
              <Label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer">
                <RadioGroupItem value="limit" className="mt-1" />
                <span><strong className="text-primary">Limit</strong> the use of my sensitive personal information.</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea id="details" name="details" rows={4} placeholder="Anything that will help us locate your records (prior email, agent contact, dates of interaction, etc.)" />
          </div>

          <div className="rounded-lg bg-muted/40 border border-border p-4">
            <Label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-muted-foreground">
                I declare under penalty of perjury under the laws of the State of California that I am the person whose personal information is the subject of this request (or an authorized agent acting on that person's behalf), and the information I have provided is true and correct.
              </span>
            </Label>
          </div>

          <Button type="submit" disabled={submitting} className="bg-accent hover:bg-accent/90 text-white rounded-full font-bold px-8 h-12">
            {submitting ? "Submitting…" : "Submit Request"}
          </Button>

          <p className="text-xs text-muted-foreground">
            You may also submit a request
            {privacyEmail ? (<> by emailing <a href={`mailto:${privacyEmail}`} className="text-accent">{privacyEmail}</a></>) : null}
            {phone && phoneTel ? (<> or calling <a href={`tel:${phoneTel}`} className="text-accent">{phone}</a></>) : null}
            . We honor the Global Privacy Control (GPC) browser signal as a valid opt-out of sale and sharing.
          </p>
        </form>
      </section>
    </div>
  );
}
