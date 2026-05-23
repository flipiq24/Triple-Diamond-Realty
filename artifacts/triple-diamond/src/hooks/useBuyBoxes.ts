import { useEffect, useState } from "react";
import { getBuyBoxes, subscribeBuyBoxes, addBuyBox, deleteBuyBox, type BuyBox } from "@/lib/buyBoxes";
import type { FilterState } from "@/components/SearchFiltersSheet";

export function useBuyBoxes() {
  const [boxes, setBoxes] = useState<BuyBox[]>(() => getBuyBoxes());

  useEffect(() => {
    const unsub = subscribeBuyBoxes(() => setBoxes(getBuyBoxes()));
    return unsub;
  }, []);

  return {
    boxes,
    add: (name: string, filters: FilterState) => addBuyBox(name, filters),
    remove: (id: string) => deleteBuyBox(id),
  };
}
