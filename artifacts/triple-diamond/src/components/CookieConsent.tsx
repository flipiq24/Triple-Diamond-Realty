import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "tdr_cookie_consent_v1";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const close = (choice: "accept_all" | "essential_only") => {
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
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[9999] max-w-md bg-white border border-border rounded-2xl shadow-2xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-primary mb-1">Your privacy choices</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to operate this site, remember your preferences, measure performance, and improve our marketing. California residents have rights under the CCPA/CPRA, including the right to opt out of the sale or sharing of personal information.{" "}
            <Link href="/legal#privacy" className="text-accent font-semibold hover:underline">Learn more</Link>.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={() => close("accept_all")}
              className="bg-accent hover:bg-accent/90 text-white rounded-full h-9 px-4 text-sm font-semibold"
            >
              Accept all
            </Button>
            <Button
              variant="outline"
              onClick={() => close("essential_only")}
              className="rounded-full h-9 px-4 text-sm font-semibold border-primary text-primary"
            >
              Essential only
            </Button>
            <Link href="/legal#ccpa" className="inline-flex items-center text-sm font-semibold text-primary hover:text-accent px-3 h-9">
              Do Not Sell or Share My Info
            </Link>
          </div>
        </div>
        <button
          onClick={() => close("essential_only")}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
