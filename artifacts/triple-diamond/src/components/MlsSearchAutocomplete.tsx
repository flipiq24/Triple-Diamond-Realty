import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, Loader2, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  mlsService,
  type MlsAutocompleteHit,
} from "@/services/mls.service";

interface MlsSearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (hit: MlsAutocompleteHit) => void;
  placeholder?: string;
  className?: string;
  // Overrides the built-in Input classes when set (used by the hero variant
  // which wants a big pill-shaped input instead of the compact search-page one).
  inputClassName?: string;
  // Hide the built-in left search icon + right clear button. Callers (e.g. the
  // hero) render their own affordances.
  hideDecorations?: boolean;
  // Fires on Enter when no dropdown row is highlighted, or when the raw string
  // should be submitted regardless of dropdown state. The hero uses this to
  // route to /search?q=<raw> even if the buyer never picked an autocomplete row.
  onSubmit?: (value: string) => void;
}

/**
 * Address autocomplete matching Command's MlsSearchAutocomplete UX:
 * 300ms debounce, min 2 chars, up to 10 hits, keyboard nav (↑/↓/Enter/Esc).
 * Selecting a row calls onSelect (which the parent uses to run the actual
 * MLS search) and also propagates the string via onChange.
 */
export default function MlsSearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "City, ZIP, or address…",
  className = "",
  inputClassName,
  hideDecorations = false,
  onSubmit,
}: MlsSearchAutocompleteProps) {
  const [results, setResults] = useState<MlsAutocompleteHit[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch — each keystroke schedules a fetch 300ms out; earlier
  // scheduled fetches are cancelled by the effect's cleanup so we don't
  // race stale responses against the current input.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const data = await mlsService.autocomplete(q);
        setResults(data.results ?? []);
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [value]);

  // Click-outside → close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const highlightedQuery = useMemo(() => value.trim().toLowerCase(), [value]);

  const commit = (hit: MlsAutocompleteHit) => {
    onChange(hit.fullstreetaddress);
    setIsOpen(false);
    setHighlight(-1);
    onSelect(hit);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {!hideDecorations && (
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (isOpen && highlight >= 0 && results[highlight]) {
              e.preventDefault();
              commit(results[highlight]);
              return;
            }
            if (onSubmit) {
              e.preventDefault();
              setIsOpen(false);
              onSubmit(value);
              return;
            }
          }
          if (!isOpen) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Escape") {
            setIsOpen(false);
            setHighlight(-1);
          }
        }}
        placeholder={placeholder}
        className={inputClassName ?? "pl-9 pr-9 bg-muted/50"}
      />
      {!hideDecorations &&
        (loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setResults([]);
              setIsOpen(false);
              setHighlight(-1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        ) : null)}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-white rounded-lg border border-border shadow-lg overflow-hidden text-left">
          <ul className="max-h-80 overflow-y-auto">
            {results.map((hit, i) => (
              <li
                key={`${hit.id}-${hit.listing_id}`}
                onMouseDown={(e) => {
                  // mousedown (not click) so the input doesn't lose focus
                  // and re-open cycle before we commit.
                  e.preventDefault();
                  commit(hit);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer text-sm ${
                  highlight === i ? "bg-accent/10" : "hover:bg-muted/50"
                }`}
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-primary truncate">
                    {highlightMatch(hit.fullstreetaddress, highlightedQuery)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {hit.city}, {hit.state} {hit.zipcode}
                    {hit.list_price
                      ? ` · $${Number(hit.list_price).toLocaleString()}`
                      : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && !loading && results.length === 0 && value.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-white rounded-lg border border-border shadow-lg px-4 py-3 text-sm text-muted-foreground text-left">
          No matches for "{value}"
        </div>
      )}
    </div>
  );
}

/** Bold the matching substring inside the address label. */
function highlightMatch(text: string, needle: string) {
  if (!needle) return text;
  const i = text.toLowerCase().indexOf(needle);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="bg-accent/20 text-primary rounded px-0.5">
        {text.slice(i, i + needle.length)}
      </span>
      {text.slice(i + needle.length)}
    </>
  );
}
