import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { buyerService } from "@/services/buyer.service";
import { toast } from "sonner";
import { useTenantBranding } from "@/hooks/useTenantBranding";

type Step = "register" | "sent";

export default function RegisterDialog({
  open,
  onOpenChange,
  onVerified,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onVerified?: () => void;
}) {
  const { companyName } = useTenantBranding();
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => setStep("register"), 300);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!consent) {
      toast.error("Please accept the authorization to continue");
      return;
    }
    setSubmitting(true);
    try {
      await buyerService.startRegistration(
        { name, email, phone, consent },
        // Return them to the same page they were on
        window.location.href,
      );
      setStep("sent");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send magic link",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              {step === "register" && "Register to see details"}
              {step === "sent" && "Check your email"}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              {step === "register" &&
                "Off-market addresses are shown only to verified buyers."}
              {step === "sent" &&
                `We sent a magic link to ${email}. Click it to unlock full property details.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        {step === "register" && (
          <form onSubmit={submit} className="px-6 py-5 space-y-3">
            <div>
              <Label htmlFor="r-name" className="text-xs">Full name *</Label>
              <Input
                id="r-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div>
              <Label htmlFor="r-email" className="text-xs">Email *</Label>
              <Input
                id="r-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div>
              <Label htmlFor="r-phone" className="text-xs">Mobile phone *</Label>
              <Input
                id="r-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <label className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed pt-2">
              <Checkbox
                className="mt-0.5"
                checked={consent}
                onCheckedChange={(v) => setConsent(!!v)}
                disabled={submitting}
              />
              <span>
                <strong className="text-foreground">
                  Authorization to receive texts and emails:
                </strong>{" "}
                By checking this box and clicking "Send magic link", I expressly
                authorize {companyName} and its agents and brokerages
                to contact me at the email and phone number provided —
                including by autodialer, prerecorded voice, SMS/MMS, and email
                — about properties, off-market deals, and related real-estate
                services. Consent is not a condition of any purchase. Message
                and data rates may apply. Reply STOP to opt out. See our{" "}
                <a href="/privacy" className="underline text-primary">Privacy Policy</a>{" "}
                and <a href="/terms" className="underline text-primary">Terms</a>.
                Equal Housing Opportunity.
              </span>
            </label>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full"
            >
              {submitting ? "Sending…" : (
                <>
                  Send magic link <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}

        {step === "sent" && (
          <div className="px-6 py-8 text-center space-y-4">
            <Mail className="w-14 h-14 text-accent mx-auto" />
            <div>
              <div className="text-lg font-bold text-foreground">
                Magic link sent
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Open the email from <strong>{email}</strong> and click the link.
                You'll be returned to this page with full details unlocked.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Check spam if you don't see it in a minute.
              </p>
            </div>
            <Button
              onClick={() => {
                onOpenChange(false);
                onVerified?.();
              }}
              className="w-full h-11 bg-primary text-white font-bold rounded-full"
            >
              Got it
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
