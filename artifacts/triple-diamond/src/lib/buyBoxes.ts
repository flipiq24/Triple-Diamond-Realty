import type { FilterState } from "@/components/SearchFiltersSheet";

const KEY = "tdr_buyboxes_v1";
const EVT = "tdr-buyboxes-changed";

export type BuyBox = {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: number;
};

export function getBuyBoxes(): BuyBox[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BuyBox[]) : [];
  } catch {
    return [];
  }
}

function save(boxes: BuyBox[]) {
  window.localStorage.setItem(KEY, JSON.stringify(boxes));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function addBuyBox(name: string, filters: FilterState): BuyBox {
  const box: BuyBox = {
    id: `bb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `Buy Box ${getBuyBoxes().length + 1}`,
    filters,
    createdAt: Date.now(),
  };
  save([box, ...getBuyBoxes()]);
  return box;
}

export function deleteBuyBox(id: string) {
  save(getBuyBoxes().filter((b) => b.id !== id));
}

export function subscribeBuyBoxes(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}
