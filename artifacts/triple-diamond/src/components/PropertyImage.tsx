import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * Data-URL SVG placeholder emitted by the mapper when no cover is available.
 * Treated as a null src so it doesn't render as a real image.
 */
const NO_PHOTO_SVG_PREFIX = "data:image/svg+xml";

interface PropertyImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  emptyLabel?: string;
  /**
   * Remount the underlying <img> when `src` changes so old pixels wipe
   * instantly. Used on carousel main slots where Prev/Next swaps the src.
   */
  remountOnSrcChange?: boolean;
  /**
   * Force the skeleton state on regardless of `src`. Parent sets this while
   * the API call that supplies `src` is in flight so the empty-state icon
   * doesn't flash before the response lands.
   */
  isLoading?: boolean;
}

/**
 * Property image with three states:
 *   - loading  → animated skeleton pulse (parent isLoading OR img decoding)
 *   - loaded   → image fades in
 *   - empty    → icon + "No photo available" label (only when we're sure)
 */
export default function PropertyImage({
  src,
  alt,
  className = "",
  emptyLabel = "No photo available",
  remountOnSrcChange = false,
  isLoading = false,
}: PropertyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  const isBlankSrc =
    !src || (typeof src === "string" && src.startsWith(NO_PHOTO_SVG_PREFIX));
  const showSkeleton = isLoading || (!isBlankSrc && !loaded && !errored);
  const showEmpty = !isLoading && (isBlankSrc || errored);

  return (
    <div
      className={`relative overflow-hidden bg-muted ${className}`}
      aria-busy={showSkeleton ? "true" : "false"}
    >
      {showSkeleton && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
      )}

      {showEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2 z-10">
          <ImageOff className="w-8 h-8 opacity-40" aria-hidden="true" />
          <span className="text-sm font-medium">{emptyLabel}</span>
        </div>
      )}

      {!isBlankSrc && (
        <img
          key={remountOnSrcChange ? src ?? "" : undefined}
          src={src ?? undefined}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            loaded && !errored ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
