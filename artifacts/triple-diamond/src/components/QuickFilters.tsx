import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import type { FilterState } from "@/components/SearchFiltersSheet";
import type { PropertyType } from "@/data/listings";

const HOME_TYPES: PropertyType[] = ["Single Family", "Condo", "Townhome", "Multi-Family", "Mobile", "Land", "Farm"];
const BEDS = [
  { v: "any", l: "Any" },
  { v: "0", l: "Studio" },
  { v: "1", l: "1+" },
  { v: "2", l: "2+" },
  { v: "3", l: "3+" },
  { v: "4", l: "4+" },
  { v: "5", l: "5+" },
];
const BATHS = [
  { v: "any", l: "Any" },
  { v: "1", l: "1+" },
  { v: "2", l: "2+" },
  { v: "3", l: "3+" },
  { v: "4", l: "4+" },
];

function Pill({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-1.5 h-10 rounded-full px-4 font-semibold ${
            active ? "border-2 border-primary bg-primary/5 text-primary" : "border-border text-foreground"
          }`}
        >
          {label} <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-4">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export default function QuickFilters({
  filters,
  setFilters,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
}) {
  const update = <K extends keyof FilterState>(k: K, v: FilterState[K]) => setFilters({ ...filters, [k]: v });
  const fmt = (n: string) => (n ? `$${parseInt(n).toLocaleString()}` : "");

  const priceLabel =
    filters.priceMin || filters.priceMax
      ? `${fmt(filters.priceMin) || "Min"} – ${fmt(filters.priceMax) || "Max"}`
      : "Price";

  const bbLabel =
    filters.beds !== "any" || filters.baths !== "any"
      ? `${filters.beds === "any" ? "Any" : filters.beds === "0" ? "Studio" : `${filters.beds}+`} bd · ${
          filters.baths === "any" ? "Any" : `${filters.baths}+`
        } ba`
      : "Beds & Baths";

  const typeLabel =
    filters.homeTypes.length > 0
      ? filters.homeTypes.length === 1
        ? filters.homeTypes[0]
        : `${filters.homeTypes.length} types`
      : "Home Type";

  const forSaleLabel = filters.saleStatus === "just-sold" ? "Just Sold" : "For Sale";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* For Sale / Just Sold */}
      <Pill label={forSaleLabel} active={filters.saleStatus !== "for-sale"}>
        <div className="space-y-2">
          {(["for-sale", "just-sold"] as const).map((v) => (
            <button
              key={v}
              onClick={() => update("saleStatus", v)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                filters.saleStatus === v ? "bg-primary text-white" : "hover:bg-muted"
              }`}
            >
              {v === "for-sale" ? "For Sale" : "Just Sold"}
            </button>
          ))}
        </div>
      </Pill>

      {/* Price */}
      <Pill label={priceLabel} active={!!(filters.priceMin || filters.priceMax)}>
        <div className="space-y-3">
          <Label className="text-xs">Price range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                placeholder="Min"
                className="pl-7"
                value={filters.priceMin}
                onChange={(e) => update("priceMin", e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                placeholder="Max"
                className="pl-7"
                value={filters.priceMax}
                onChange={(e) => update("priceMax", e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
          {(filters.priceMin || filters.priceMax) && (
            <button
              onClick={() => setFilters({ ...filters, priceMin: "", priceMax: "" })}
              className="text-xs font-semibold text-primary hover:text-accent"
            >
              Clear price
            </button>
          )}
        </div>
      </Pill>

      {/* Beds & Baths */}
      <Pill label={bbLabel} active={filters.beds !== "any" || filters.baths !== "any"}>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Bedrooms</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {BEDS.map((o) => (
                <button
                  key={o.v}
                  onClick={() => update("beds", o.v)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    filters.beds === o.v ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Bathrooms</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {BATHS.map((o) => (
                <button
                  key={o.v}
                  onClick={() => update("baths", o.v)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    filters.baths === o.v ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Pill>

      {/* Home Type */}
      <Pill label={typeLabel} active={filters.homeTypes.length > 0}>
        <div className="space-y-2">
          {HOME_TYPES.map((t) => {
            const checked = filters.homeTypes.includes(t);
            return (
              <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    update(
                      "homeTypes",
                      checked ? filters.homeTypes.filter((x) => x !== t) : [...filters.homeTypes, t]
                    )
                  }
                />
                {t}
              </label>
            );
          })}
          {filters.homeTypes.length > 0 && (
            <button
              onClick={() => update("homeTypes", [])}
              className="text-xs font-semibold text-primary hover:text-accent pt-1"
            >
              Clear home types
            </button>
          )}
        </div>
      </Pill>
    </div>
  );
}
