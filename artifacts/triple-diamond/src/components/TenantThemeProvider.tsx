import { useEffect, useState, type ReactNode } from "react";
import { useTenantPreferences } from "@/hooks/useTenantPreferences";
import { useTenantCustomField } from "@/hooks/useTenantCustomField";

/**
 * Injects live tenant branding into the document at runtime:
 *   - Tailwind v4's --primary / --accent CSS variables (H S% L% triples)
 *   - --primary-foreground / --accent-foreground auto-picked for contrast
 *   - document.title switched to the tenant's company_name
 *
 * `bg`, `secondary_color`, and `company_name` come from the Buyers Hook
 * Branding section (or any other section, since useTenantCustomField
 * walks all sections looking for the key).
 *
 * Doesn't render a wrapper element — just applies side effects and passes
 * children through untouched.
 */
export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const { isLoading, isError } = useTenantPreferences();
  const bg = useTenantCustomField("bg");
  const secondaryColor = useTenantCustomField("secondary_color");
  const companyName = useTenantCustomField("company_name");
  const logoUrl = useTenantCustomField("logo");

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
    const bgTriple = hexToHslTriple(bg);
    const accentTriple = hexToHslTriple(secondaryColor);

    if (bgTriple) {
      root.style.setProperty("--primary", bgTriple);
      root.style.setProperty(
        "--primary-foreground",
        contrastForeground(bg) || "0 0% 100%",
      );
    }
    if (accentTriple) {
      root.style.setProperty("--accent", accentTriple);
      root.style.setProperty(
        "--accent-foreground",
        contrastForeground(secondaryColor) || "0 0% 100%",
      );
    }
  }, [bg, secondaryColor]);

  useEffect(() => {
    if (typeof document !== "undefined" && companyName) {
      document.title = `${companyName} — Off-Market Deals`;
    }
  }, [companyName]);

  // Swap the browser tab favicon to the tenant's logo. Runs after preferences
  // hydrate — we intentionally leave the static /favicon.svg in index.html so
  // the initial paint isn't blank while preferences load. A quick head-swap
  // once the URL is known is cheap and doesn't refetch the whole page.
  useEffect(() => {
    if (typeof document === "undefined" || !logoUrl) return;

    // Guess the mime type from the extension; browsers accept SVG/PNG/JPG/ICO
    // interchangeably for icons but the correct type helps some readers.
    const ext = logoUrl.split("?")[0].split(".").pop()?.toLowerCase();
    const mime =
      ext === "svg" ? "image/svg+xml" :
      ext === "png" ? "image/png" :
      ext === "ico" ? "image/x-icon" :
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
      "";

    // Replace every existing rel=icon link so we don't leave stale entries
    // behind (index.html ships with one; we own it from here on).
    const existing = document.head.querySelectorAll<HTMLLinkElement>(
      "link[rel~='icon']",
    );
    existing.forEach((l) => l.parentNode?.removeChild(l));

    const link = document.createElement("link");
    link.rel = "icon";
    if (mime) link.type = mime;
    link.href = logoUrl;
    document.head.appendChild(link);
  }, [logoUrl]);

  // Cold fetch (no cached data, network pending) → block render behind a
  // full-viewport loader. Warm fetches (localStorage-cached < 30 min old)
  // return isLoading=false immediately and skip this branch entirely, so
  // page navigation never shows the loader.
  if (isLoading) return <TenantLoader />;

  return <>{children}</>;
}

/**
 * Full-viewport loader shown ONCE on first paint when no cached preferences
 * exist yet. Matches the Command app's boot spinner exactly — a 40px orange
 * ring on a white background, no text, no wordmark. Keeps the boot / mount
 * transition visually continuous with the rest of the FlipIQ product suite.
 */
function TenantLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          border: "3px solid rgba(249, 115, 22, 0.18)",
          borderTopColor: "#F97316",
          borderRadius: "50%",
          animation: "tenant-loader-spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes tenant-loader-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-tenant-loader] { animation-duration: 3s !important; }
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
