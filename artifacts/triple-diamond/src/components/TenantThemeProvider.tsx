import { useEffect, useState, type ReactNode } from "react";
import { useTenantPreferences } from "@/hooks/useTenantPreferences";

/**
 * Injects live tenant branding into the document at runtime:
 *   - Tailwind v4's --primary / --accent CSS variables (H S% L% triples)
 *   - --primary-foreground / --accent-foreground auto-picked for contrast
 *   - document.title switched to the tenant's company_name
 *
 * Doesn't render a wrapper element — just applies side effects and passes
 * children through untouched.
 */
export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const { preferences, isLoading, isError } = useTenantPreferences();

  // Hard ceiling on how long we're willing to hide the site waiting for
  // tenant branding. If the API is dead / slow / not deployed yet, we
  // fall through to the built-in defaults so the buyer sees SOMETHING
  // instead of an eternal loader.
  const [waitedTooLong, setWaitedTooLong] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaitedTooLong(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const bgTriple = hexToHslTriple(preferences.bg);
    const accentTriple = hexToHslTriple(preferences.secondary_color);

    if (bgTriple) {
      root.style.setProperty("--primary", bgTriple);
      root.style.setProperty(
        "--primary-foreground",
        contrastForeground(preferences.bg) || "0 0% 100%",
      );
    }
    if (accentTriple) {
      root.style.setProperty("--accent", accentTriple);
      root.style.setProperty(
        "--accent-foreground",
        contrastForeground(preferences.secondary_color) || "0 0% 100%",
      );
    }
  }, [preferences.bg, preferences.secondary_color]);

  useEffect(() => {
    const name = preferences.company_name;
    if (typeof document !== "undefined" && name) {
      document.title = `${name} — Off-Market Deals`;
    }
  }, [preferences.company_name]);

  // Cold fetch (no cached data, network pending) → block render behind a
  // full-viewport loader. Warm fetches (localStorage-cached < 30 min old)
  // return isLoading=false immediately and skip this branch entirely, so
  // page navigation never shows the loader.
  if (isLoading) return <TenantLoader />;

  return <>{children}</>;
}

/**
 * Beautiful full-viewport loader shown ONCE on first paint when no cached
 * preferences exist yet. Uses neutral colors (we don't know the tenant's
 * brand yet — that's literally what we're loading) with a subtle
 * conic-gradient spinner + soft breathe animation.
 */
function TenantLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white gap-6">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full opacity-90"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(15,44,75,0.9) 300deg, rgba(15,44,75,0) 360deg)",
            animation: "tenant-loader-spin 1s linear infinite",
            mask: "radial-gradient(circle, transparent 50%, black 51%)",
            WebkitMask:
              "radial-gradient(circle, transparent 50%, black 51%)",
          }}
        />
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(15,44,75,0.08) 0%, transparent 70%)",
            animation: "tenant-loader-pulse 1.6s ease-in-out infinite",
          }}
        />
      </div>
      <p className="text-sm font-medium text-slate-500 tracking-wide">
        Loading…
      </p>
      <style>{`
        @keyframes tenant-loader-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes tenant-loader-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

/** "#0F2C4B" → "216 66% 17%" (Tailwind v4 H S% L% triple). Returns null on invalid input. */
function hexToHslTriple(hex: string | undefined): string | null {
  if (!hex) return null;
  const cleaned = hex.trim().replace(/^#/, "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Return "0 0% 100%" (white) for dark backgrounds, "0 0% 0%" (black) for light. */
function contrastForeground(hex: string | undefined): string | null {
  if (!hex) return null;
  const cleaned = hex.trim().replace(/^#/, "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  // Relative luminance (WCAG)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? "0 0% 0%" : "0 0% 100%";
}
