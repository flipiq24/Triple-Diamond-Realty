import { useState, useMemo, useEffect, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, Edit } from "lucide-react";
import { type Listing } from "@/data/listings";

/* ─────────────────────────────────────────────────────────────────────────────
 *  Admin-configurable knobs (ported from ARV IQ WDA)
 * ────────────────────────────────────────────────────────────────────────── */
const CONFIG = {
  arv_thresholds: { A: 1_000_000, B_min: 500_000 },
  finished_quality_pct: { A: 1.0, B: 1.0, C: 1.0 } as Record<string, number>,
  year_buckets: [
    { key: "min_paint_carpet", label: "Min Paint/Carpet (Use Poor)", rate_sqft: 25, force_poor_display: true, range: null as [number, number | null] | null },
    { key: "1991_plus", label: "1991 or newer", rate_sqft: 40, force_poor_display: false, range: [1991, null] as [number, number | null] },
    { key: "1971_1990", label: "1971\u20131990", rate_sqft: 47, force_poor_display: false, range: [1971, 1990] as [number, number | null] },
    { key: "1961_1970", label: "1961\u20131970", rate_sqft: 70, force_poor_display: false, range: [1961, 1970] as [number, number | null] },
    { key: "1960_older", label: "1960 or older", rate_sqft: 90, force_poor_display: false, range: [null, 1960] as [number | null, number | null] },
  ],
  condition_pct: { Excellent: 0.4, Good: 0.5, Fair: 0.8, Poor: 1.0 } as Record<string, number>,
};

/* ─── Helpers ─── */
function qualityFromARV(arv: number | null): string {
  if (arv == null) return "B";
  if (arv > CONFIG.arv_thresholds.A) return "A";
  if (arv >= CONFIG.arv_thresholds.B_min) return "B";
  return "C";
}

function bucketFromYear(year: number | null): string {
  if (year == null || year === 0) return "1991_plus";
  if (year >= 1991) return "1991_plus";
  if (year >= 1971 && year <= 1990) return "1971_1990";
  if (year >= 1961 && year <= 1970) return "1961_1970";
  return "1960_older";
}

function rateForBucket(bucketKey: string): number {
  const found = CONFIG.year_buckets.find((b) => b.key === bucketKey);
  return found ? found.rate_sqft : 40;
}

function isForcePoor(bucketKey: string): boolean {
  const found = CONFIG.year_buckets.find((b) => b.key === bucketKey);
  return !!(found && found.force_poor_display);
}

function formatMoney(n: number): string {
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/* ─── ROI rows ─── */
const roiRows = [
  { roi: 8, msg: "Thin deal \u2013 tight margins" },
  { roi: 10, msg: "Borderline \u2013 limited upside" },
  { roi: 12, msg: "Market sweet spot \u2013 easy to move" },
  { roi: 14, msg: "Preferred investor zone" },
  { roi: 15, msg: "Strong deal \u2013 high confidence" },
  { roi: 18, msg: "Home Run!" },
];

function getMarketHint(rehabType: string): string {
  switch (rehabType) {
    case "Light":
      return "Investors expect at least 10\u201312% ROI on light rehabs. Below 10% is thin; 14%+ is a Home Run.";
    case "Moderate":
      return "Most investors aim for 12\u201314% ROI on moderate rehabs; 15%+ is a Home Run.";
    case "Heavy":
      return "Heavy rehabs require 15%+ ROI to move; 18%+ is a Home Run.";
    default:
      return "";
  }
}

/* ═════════════════════════════════════════════════════════════════════════════
 *  Component
 * ═══════════════════════════════════════════════════════════════════════════ */
export default function DealCalculatorDialog({
  listing,
  trigger,
}: {
  listing: Listing;
  trigger?: ReactNode;
}) {
  const buildingSize = listing.sqft || 1500;

  /* ─── State ─── */
  const [arvInput, setArvInput] = useState(listing.price);
  const [repairCost, setRepairCost] = useState(0);
  const [assignmentFee, setAssignmentFee] = useState(15_000);
  const [selectedRoi, setSelectedRoi] = useState(12);

  const [userQuality, setUserQuality] = useState(() => qualityFromARV(listing.price));
  const [userBucket, setUserBucket] = useState(() => bucketFromYear(listing.yearBuilt));
  const [selectedCondition, setSelectedCondition] = useState("Fair");
  const [rehabType, setRehabType] = useState("Moderate");

  /* Auto-update quality when ARV changes */
  useEffect(() => {
    setUserQuality(qualityFromARV(arvInput));
  }, [arvInput]);

  /* Compute repair estimates for all conditions */
  const baseRate = rateForBucket(userBucket);
  const qualityPct = CONFIG.finished_quality_pct[userQuality] ?? 1.0;

  const estimates = useMemo(() => {
    const e: Record<string, number> = {};
    Object.entries(CONFIG.condition_pct).forEach(([cond, pct]) => {
      e[cond] = buildingSize * baseRate * qualityPct * pct;
    });
    return e;
  }, [buildingSize, baseRate, qualityPct]);

  /* When condition/estimates change, drive repairCost */
  useEffect(() => {
    const next = estimates[selectedCondition] ?? 0;
    setRepairCost(Math.round(next));

    const map: Record<string, string> = {
      Excellent: "Light",
      Good: "Light",
      Fair: "Moderate",
      Poor: "Heavy",
    };
    setRehabType(map[selectedCondition] || "Moderate");
  }, [estimates, selectedCondition]);

  /* ─── Derived calculations ─── */
  const selectedRow = roiRows.find((r) => r.roi === selectedRoi);
  const buyerPrice = selectedRow ? arvInput / (1 + selectedRow.roi / 100) - repairCost : 0;
  const sellerPrice = buyerPrice - assignmentFee;

  const bucketOptions = CONFIG.year_buckets.map((b) => ({ key: b.key, label: b.label }));
  const qualityOptions = ["A", "B", "C"];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-primary-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5" /> Deal Calculator
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-sm">
              Wholesale deal analysis &mdash; investor ROI-based pricing
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Two-column grid: ARV + Repair Estimator ── */}
          <div className="grid gap-4 md:grid-cols-5">
            {/* LEFT — ARV & Assignment Fee */}
            <div className="rounded-lg border p-4 col-span-2 space-y-3">
              <div>
                <Label className="text-sm font-medium">After Repair Value (ARV)</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
                  Calculated from selected comps
                </p>
                <div className="">
                  <Input
                    type="number"
                    value={arvInput}
                    onChange={(e) => setArvInput(Number(e.target.value) || 0)}
                  />
                 
                </div>
              </div>

              {/* Finished Quality */}
              <div>
                <Label className="text-xs text-muted-foreground">Finished Quality (A/B/C)</Label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={userQuality}
                  onChange={(e) => setUserQuality(e.target.value)}
                >
                  {qualityOptions.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Auto from ARV &bull; A: &gt;$1M &bull; B: $500k&ndash;$1M &bull; C: &lt;$500k
                </p>
              </div>

              {/* Assignment Fee */}
              <div>
                <Label className="text-sm font-medium">Wholesale assignment fee</Label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <Input
                    type="number"
                    value={assignmentFee || ""}
                    placeholder="Enter Custom Assignment Fee"
                    onChange={(e) =>
                      setAssignmentFee(Number(e.target.value) > 0 ? Number(e.target.value) : 0)
                    }
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — Rehab Estimator */}
            <div className="rounded-lg border p-4 col-span-3 space-y-3">
              <Label className="text-sm font-medium">Estimated repair costs</Label>
              <p className="text-xs text-muted-foreground">
                {buildingSize.toLocaleString()} ft&sup2; &times; ${baseRate.toFixed(0)} (Base Rate)
                &times; {CONFIG.condition_pct[selectedCondition]?.toFixed(2)} (Condition Factor)
              </p>

              {/* Year bucket + Condition dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Rehab Estimator &rarr; Status (by Year Built)
                  </Label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={userBucket}
                    onChange={(e) => setUserBucket(e.target.value)}
                  >
                    {bucketOptions.map((b) => (
                      <option key={b.key} value={b.key}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Year built: {listing.yearBuilt || "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Choose condition</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                  >
                    {Object.keys(CONFIG.condition_pct).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Sets the &ldquo;Est. Cost&rdquo; used in ROI table
                  </p>
                </div>
              </div>

              {/* Four condition estimate cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {Object.keys(CONFIG.condition_pct).map((cond) => {
                  const active = cond === selectedCondition;
                  const forcedPoor = isForcePoor(userBucket);
                  const note =
                    forcedPoor && cond !== "Poor" ? " (priced as Poor scope)" : "";
                  return (
                    <div
                      key={cond}
                      onClick={() => setSelectedCondition(cond)}
                      className={`rounded-md border px-2 py-2 text-sm cursor-pointer transition-colors ${
                        active
                          ? "border-accent bg-accent/10 font-semibold"
                          : "border-border bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground">
                        {cond}
                        {note}
                      </div>
                      <div className="mt-0.5">${formatMoney(estimates[cond])}</div>
                    </div>
                  );
                })}
              </div>

              {/* Manual repair cost override */}
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                </span>
                <Input
                  type="number"
                  value={repairCost || ""}
                  onChange={(e) => setRepairCost(Number(e.target.value) || 0)}
                  className="pl-7"
                  placeholder="Or enter custom repair cost"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {buildingSize.toLocaleString()} ft&sup2; &times; $
                {(repairCost / buildingSize).toFixed(2)} per ft&sup2;
              </p>
            </div>
          </div>

          {/* ── ROI Table ── */}
          <div>
            <h4 className="text-base font-semibold mb-2">
              Investor Cash on Cash Return ROI Table
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 font-semibold">Select</th>
                    <th className="py-2 font-semibold">Target ROI %</th>
                    <th className="py-2 font-semibold">Max Buyer Price</th>
                    <th className="py-2 font-semibold">Max Offer to Seller</th>
                    <th className="py-2 font-semibold">Market Message</th>
                  </tr>
                </thead>
                <tbody>
                  {roiRows.map((row) => {
                    const buyer = arvInput / (1 + row.roi / 100) - repairCost;
                    const seller = buyer - assignmentFee;
                    const isSelected = selectedRoi === row.roi;
                    const highlight = [12, 14, 15, 18].includes(row.roi);
                    return (
                      <tr
                        key={row.roi}
                        className={`border-b cursor-pointer transition-colors ${
                          isSelected ? "bg-accent/10" : "hover:bg-muted/30"
                        }`}
                        onClick={() => setSelectedRoi(row.roi)}
                      >
                        <td className="py-1.5">
                          <input
                            type="radio"
                            name="roiSelect"
                            checked={isSelected}
                            onChange={() => setSelectedRoi(row.roi)}
                          />
                        </td>
                        <td className={`py-1.5 ${highlight ? "font-semibold" : ""}`}>
                          {row.roi} %
                        </td>
                        <td className={`py-1.5 ${highlight ? "font-semibold" : ""}`}>
                          ${formatMoney(buyer)}
                        </td>
                        <td className={`py-1.5 ${highlight ? "font-semibold" : ""}`}>
                          ${formatMoney(seller)}
                        </td>
                        <td className={`py-1.5 ${highlight ? "font-semibold" : ""}`}>
                          {row.msg}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Investor Summary ── */}
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <h4 className="text-base font-semibold text-primary mb-2">Investor Summary</h4>
            {selectedRow ? (
              <div className="mb-3">
                <p className="text-sm font-medium text-primary">Target ROI Selected: {selectedRoi}%</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your maximum buyer price is{" "}
                  <span className="font-semibold text-primary">
                    ${formatMoney(buyerPrice)}
                  </span>{" "}
                  and your maximum offer to seller is{" "}
                  <span className="font-semibold text-primary">
                    ${formatMoney(sellerPrice)}
                  </span>
                  .
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Select a ROI row to see detailed breakdown.
              </p>
            )}
            <div className="border-t pt-3 text-sm leading-relaxed">
              {getMarketHint(rehabType)}
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Estimates only. Verify ARV with comps and repair scope with a contractor. Not
            financial advice.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
