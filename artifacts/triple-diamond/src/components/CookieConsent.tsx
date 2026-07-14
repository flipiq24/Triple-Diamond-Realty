import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "tdr_cookie_consent_v2";

type Choice = "accept_all" | "reject_non_essential" | "manage" | "gpc";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const gpc = (navigator as any).globalPrivacyControl === true;
      if (gpc) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: "gpc", ts: Date.now() }));
        return;
      }
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const close = (choice: Choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, ts: Date.now() }));
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and privacy preferences"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[49] max-w-md bg-white border border-border rounded-2xl shadow-2xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="font-bold text-primary mb-1">Your privacy choices</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to operate our site, analyze traffic, and personalize content and advertising. California residents may exercise privacy rights including opting out of the sale or sharing of personal information. We honor the Global Privacy Control (GPC) signal.{" "}
            <Link href="/privacy" className="text-accent font-semibold hover:underline">Learn more</Link>.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={() => close("accept_all")} className="bg-accent hover:bg-accent/90 text-white rounded-full h-9 px-4 text-sm font-semibold">
              Accept All
            </Button>
            <Button variant="outline" onClick={() => close("reject_non_essential")} className="rounded-full h-9 px-4 text-sm font-semibold border-primary text-primary">
              Reject Non-Essential
            </Button>
            <Link href="/privacy#cookies" onClick={() => close("manage")} className="inline-flex items-center text-sm font-semibold text-primary hover:text-accent px-3 h-9">
              Manage Preferences
            </Link>
            <Link href="/do-not-sell" onClick={() => close("reject_non_essential")} className="inline-flex items-center text-sm font-semibold text-accent hover:underline px-3 h-9">
              Do Not Sell or Share My Info
            </Link>
          </div>
        </div>
        <button onClick={() => close("reject_non_essential")} aria-label="Dismiss" className="text-muted-foreground hover:text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
