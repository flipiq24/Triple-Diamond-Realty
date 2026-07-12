import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SeoHead from "@/components/SeoHead";
import { buyerService } from "@/services/buyer.service";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { useTenantBranding } from "@/hooks/useTenantBranding";

type Step = "form" | "sent";

/**
 * Buyer signup. Collects name/phone/consent up-front so the magic-link
 * callback can persist the full profile row into public.buyer_registrations
 * via AuthBootstrap's SIGNED_IN upsert.
 */
export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { verified, loading } = useBuyerVerified();
  const { companyName } = useTenantBranding();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const next =
    new URLSearchParams(window.location.search).get("next") || "/account/settings";

  useEffect(() => {
    if (!loading && verified) {
      setLocation(next);
    }
  }, [loading, verified, next, setLocation]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!consent) {
      toast.error("Please accept the authorization to continue");
      return;
    }
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}${next}`;
      await buyerService.startRegistration(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          consent,
        },
        redirectTo,
      );
      setStep("sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send magic link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead
        title={`Sign up — ${companyName}`}
        description="Create a free buyer account to unlock off-market addresses, save properties, and submit deals."
      />
      <div className="min-h-[calc(100dvh-16rem)] flex items-center justify-center bg-muted/30 px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
          <div className="bg-primary text-primary-foreground px-6 py-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-extrabold text-white">
                {step === "form" ? "Create your account" : "Check your email"}
              </h1>
            </div>
            <p className="text-white/80 text-sm mt-1">
              {step === "form"
                ? "Off-market addresses are shown only to verified buyers."
                : `We sent a magic link to ${email}. Click it to finish creating your account.`}
            </p>
          </div>

          {step === "form" && (
            <form onSubmit={submit} className="px-6 py-6 space-y-3">
              <div>
                <Label htmlFor="signup-name" className="text-xs">Full name</Label>
                <Input
                  id="signup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email" className="text-xs">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-phone" className="text-xs">Mobile phone</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  autoComplete="tel"
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
                  authorize {companyName} and its agents and brokerages to contact
                  me at the email and phone number provided — including by
                  autodialer, prerecorded voice, SMS/MMS, and email — about
                  properties, off-market deals, and related real-estate services.
                  Consent is not a condition of any purchase. Message and data
                  rates may apply. Reply STOP to opt out. See our{" "}
                  <Link href="/privacy" className="underline text-primary">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="underline text-primary">
                    Terms
                  </Link>
                  . Equal Housing Opportunity.
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

              <p className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-accent font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          )}

          {step === "sent" && (
            <div className="px-6 py-8 text-center space-y-4">
              <Mail className="w-14 h-14 text-accent mx-auto" />
              <p className="text-sm text-muted-foreground">
                Open the email from <strong>{email}</strong> and click the link.
                We'll finish setting up your account and land you on your
                dashboard.
              </p>
              <p className="text-xs text-muted-foreground">
                Check spam if you don't see it in a minute.
              </p>
              <Button
                onClick={() => setStep("form")}
                variant="outline"
                className="w-full h-11 rounded-full"
              >
                Use a different email
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
