import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PropertyType, ListingStatus, SaleType } from "@/data/listings";
import { useBuyBoxes } from "@/hooks/useBuyBoxes";
import { toast } from "sonner";

export type FilterState = {
  priceMin: string;
  priceMax: string;
  beds: string; // "any" | "0" (studio) | "1".."5"
  baths: string;
  homeTypes: PropertyType[];
  listingStatus: ListingStatus[];
  saleTypes: SaleType[];
  openHouse: boolean;
  threeDTour: boolean;
  virtualTour: boolean;
  daysOnMarket: string; // "any" | "1" | "7" | "14" | "30"
  sqftMin: string;
  sqftMax: string;
  lotMin: string;
  lotMax: string;
  ageMin: string;
  ageMax: string;
  hoaMax: string;
  garage: string; // "any" | "1" | "2" | "3"
  stories: "any" | "single" | "multi";
  priceReduced: boolean;
};

export const defaultFilters: FilterState = {
  priceMin: "",
  priceMax: "",
  beds: "any",
  baths: "any",
  homeTypes: [],
  listingStatus: [],
  saleTypes: [],
  openHouse: false,
  threeDTour: false,
  virtualTour: false,
  daysOnMarket: "any",
  sqftMin: "",
  sqftMax: "",
  lotMin: "",
  lotMax: "",
  ageMin: "",
  ageMax: "",
  hoaMax: "",
  garage: "any",
  stories: "any",
  priceReduced: false,
};

const ALL_HOME_TYPES: PropertyType[] = ["Single Family", "Condo", "Townhome", "Multi-Family", "Mobile", "Land", "Farm"];
const ALL_LISTING_STATUSES: ListingStatus[] = ["Active", "Pending"];
const ALL_SALE_TYPES: SaleType[] = ["Existing", "Foreclosure", "New Construction", "55+ Community"];

const PILL_OPTIONS_BEDS = [
  { v: "any", l: "Any" },
  { v: "0", l: "Studio" },
  { v: "1", l: "1+" },
  { v: "2", l: "2+" },
  { v: "3", l: "3+" },
  { v: "4", l: "4+" },
  { v: "5", l: "5+" },
];
const PILL_OPTIONS_BATHS = [
  { v: "any", l: "Any" },
  { v: "1", l: "1+" },
  { v: "2", l: "2+" },
  { v: "3", l: "3+" },
  { v: "4", l: "4+" },
  { v: "5", l: "5+" },
];
const PILL_OPTIONS_GARAGE = [
  { v: "any", l: "Any" },
  { v: "1", l: "1+" },
  { v: "2", l: "2+" },
  { v: "3", l: "3+" },
];

type PillGroupProps = { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] };
function PillGroup({ value, onChange, options }: PillGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition ${
            value === o.v
              ? "bg-primary text-white border-primary"
              : "bg-white text-primary border-border hover:border-primary"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

type Props = {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  resultCount: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export default function SearchFiltersSheet({ filters, setFilters, resultCount, open, onOpenChange }: Props) {
  const update = <K extends keyof FilterState>(k: K, v: FilterState[K]) => setFilters({ ...filters, [k]: v });

  const toggleArr = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const { boxes, add, remove } = useBuyBoxes();
  const [bbName, setBbName] = useState("");
  const handleSaveBuyBox = () => {
    const name = bbName.trim() || `Buy Box ${boxes.length + 1}`;
    add(name, filters);
    setBbName("");
    toast.success(`Saved "${name}"`, { description: "Apply it from the buy-box bar on the search page." });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white">
          <SlidersHorizontal className="w-4 h-4" /> All Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-extrabold text-primary">Filters</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
          {/* Buy Boxes */}
          <section className="bg-accent/5 border-2 border-accent/30 rounded-xl p-4">
            <h3 className="font-bold text-primary mb-1 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-accent" /> My Buy Boxes
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Save your current filter set as a buy box you can re-apply with one tap.
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={bbName}
                onChange={(e) => setBbName(e.target.value)}
                placeholder="Name this buy box (e.g. SoCal SFR Flips)"
                className="flex-1"
              />
              <Button onClick={handleSaveBuyBox} className="bg-accent hover:bg-accent/90 text-white">
                Save
              </Button>
            </div>
            {boxes.length > 0 && (
              <div className="space-y-1.5">
                {boxes.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 bg-white rounded-md px-3 py-2 border">
                    <Bookmark className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-sm font-semibold text-primary flex-1 truncate">{b.name}</span>
                    <button
                      type="button"
                      onClick={() => { setFilters(b.filters); toast.success(`Applied "${b.name}"`); }}
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(b.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete buy box"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Price */}
          <section>
            <h3 className="font-bold text-primary mb-3">Price</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="No min"
                    value={filters.priceMin}
                    onChange={(e) => update("priceMin", e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="No max"
                    value={filters.priceMax}
                    onChange={(e) => update("priceMax", e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3 text-sm">
              <Checkbox
                checked={filters.priceReduced}
                onCheckedChange={(v) => update("priceReduced", !!v)}
              />
              Price reduced
            </label>
          </section>

          <Separator />

          {/* Rooms */}
          <section>
            <h3 className="font-bold text-primary mb-3">Bedrooms</h3>
            <PillGroup value={filters.beds} onChange={(v) => update("beds", v)} options={PILL_OPTIONS_BEDS} />

            <h3 className="font-bold text-primary mt-6 mb-3">Bathrooms</h3>
            <PillGroup value={filters.baths} onChange={(v) => update("baths", v)} options={PILL_OPTIONS_BATHS} />
          </section>

          <Separator />

          {/* Home type */}
          <section>
            <h3 className="font-bold text-primary mb-3">Home type</h3>
            <div className="grid grid-cols-2 gap-2">
              {ALL_HOME_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={filters.homeTypes.includes(t)}
                    onCheckedChange={() => update("homeTypes", toggleArr(filters.homeTypes, t))}
                  />
                  {t}
                </label>
              ))}
            </div>
          </section>

          <Separator />

          {/* Listing details */}
          <section>
            <h3 className="font-bold text-primary mb-3">Listing details</h3>

            <Label className="text-xs text-muted-foreground">Listing status</Label>
            <div className="grid grid-cols-2 gap-2 mt-1 mb-4">
              {ALL_LISTING_STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={filters.listingStatus.includes(s)}
                    onCheckedChange={() => update("listingStatus", toggleArr(filters.listingStatus, s))}
                  />
                  {s === "Pending" ? "Pending / Contingent" : s}
                </label>
              ))}
            </div>

            <Label className="text-xs text-muted-foreground">Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-1 mb-4">
              {ALL_SALE_TYPES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={filters.saleTypes.includes(s)}
                    onCheckedChange={() => update("saleTypes", toggleArr(filters.saleTypes, s))}
                  />
                  {s === "Existing" ? "Existing homes" : s}
                </label>
              ))}
            </div>

<Label className="text-xs text-muted-foreground mt-4 block">Days on Triple Diamond</Label>
            <Select value={filters.daysOnMarket} onValueChange={(v) => update("daysOnMarket", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <Separator />

          {/* Home details */}
          <section>
            <h3 className="font-bold text-primary mb-3">Home details</h3>

            <Label className="text-xs text-muted-foreground">Square feet</Label>
            <div className="grid grid-cols-2 gap-3 mt-1 mb-4">
              <Input
                type="number"
                placeholder="No min"
                value={filters.sqftMin}
                onChange={(e) => update("sqftMin", e.target.value)}
              />
              <Input
                type="number"
                placeholder="No max"
                value={filters.sqftMax}
                onChange={(e) => update("sqftMax", e.target.value)}
              />
            </div>

            <Label className="text-xs text-muted-foreground">Lot size (sqft)</Label>
            <div className="grid grid-cols-2 gap-3 mt-1 mb-4">
              <Input
                type="number"
                placeholder="No min"
                value={filters.lotMin}
                onChange={(e) => update("lotMin", e.target.value)}
              />
              <Input
                type="number"
                placeholder="No max"
                value={filters.lotMax}
                onChange={(e) => update("lotMax", e.target.value)}
              />
            </div>

            <Label className="text-xs text-muted-foreground">Home age (years)</Label>
            <div className="grid grid-cols-2 gap-3 mt-1 mb-4">
              <Input
                type="number"
                placeholder="No min"
                value={filters.ageMin}
                onChange={(e) => update("ageMin", e.target.value)}
              />
              <Input
                type="number"
                placeholder="No max"
                value={filters.ageMax}
                onChange={(e) => update("ageMax", e.target.value)}
              />
            </div>

            <Label className="text-xs text-muted-foreground">Max HOA fees per month</Label>
            <div className="relative mt-1 mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="No max"
                value={filters.hoaMax}
                onChange={(e) => update("hoaMax", e.target.value)}
                className="pl-7"
              />
            </div>

            <Label className="text-xs text-muted-foreground">Garage</Label>
            <div className="mt-1 mb-4">
              <PillGroup value={filters.garage} onChange={(v) => update("garage", v)} options={PILL_OPTIONS_GARAGE} />
            </div>

            <Label className="text-xs text-muted-foreground">Stories</Label>
            <div className="flex gap-2 mt-1">
              {(["any", "single", "multi"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("stories", s)}
                  className={`flex-1 py-2 rounded-full border-2 text-sm font-semibold transition ${
                    filters.stories === s ? "bg-primary text-white border-primary" : "bg-white text-primary border-border"
                  }`}
                >
                  {s === "any" ? "Any" : s === "single" ? "Single" : "Multi"}
                </button>
              ))}
            </div>
          </section>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-white flex-row gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setFilters(defaultFilters)}
            className="flex-1"
          >
            Reset all
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-accent hover:bg-accent/90 text-white"
          >
            See {resultCount} deals
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
