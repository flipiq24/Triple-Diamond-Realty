import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SeoHead from "@/components/SeoHead";
import { buyerService } from "@/services/buyer.service";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { useTenantBranding } from "@/hooks/useTenantBranding";

type Step = "form" | "sent";

/**
 * Buyer login. Sends a Supabase magic link that returns to /account/settings
 * (or the `?next=<path>` param if present) so a login initiated from a
 * protected page can bounce the buyer back where they started.
 *
 * Uses startLogin (not startRegistration) so the buyer's existing
 * name/phone/consent aren't overwritten with blanks on repeat sign-ins.
 */
export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { verified, loading } = useBuyerVerified();
  const { companyName } = useTenantBranding();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const next = new URLSearchParams(window.location.search).get("next") || "/account/settings";

  useEffect(() => {
    if (!loading && verified) {
      setLocation(next);
    }
  }, [loading, verified, next, setLocation]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email");
      return;
    }
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}${next}`;
      await buyerService.startLogin(email.trim(), redirectTo, companyName);
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
        title={`Log in — ${companyName}`}
        description="Sign in to your buyer account to see off-market deals, saved properties, and your submitted listings."
      />
      <div className="min-h-[calc(100dvh-16rem)] flex items-center justify-center bg-muted/30 px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
          <div className="bg-primary text-primary-foreground px-6 py-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-extrabold text-white">
                {step === "form" ? "Welcome back" : "Check your email"}
              </h1>
            </div>
            <p className="text-white/80 text-sm mt-1">
              {step === "form"
                ? "Enter your email and we'll send a one-tap magic link."
                : `We sent a magic link to ${email}. Click it to sign in.`}
            </p>
          </div>

          {step === "form" && (
            <form onSubmit={submit} className="px-6 py-6 space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
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
                Don't have an account?{" "}
                <Link href="/signup" className="text-accent font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          )}

          {step === "sent" && (
            <div className="px-6 py-8 text-center space-y-4">
              <Mail className="w-14 h-14 text-accent mx-auto" />
              <p className="text-sm text-muted-foreground">
                Open the email from <strong>{email}</strong> and click the link.
                You'll be signed in and returned here automatically.
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
