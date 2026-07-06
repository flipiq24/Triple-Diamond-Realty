import { useEffect, useState } from "react";

/**
 * Returns `value` after `delayMs` of no changes. Each new value resets the
 * timer, so rapid keystrokes collapse into a single downstream update —
 * critical for search inputs that drive React Query fetches, otherwise
 * every character triggers a full API round-trip.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}
