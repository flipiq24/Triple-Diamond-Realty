import { useState, useMemo, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { type Listing } from "@/data/listings";

export default function DealCalculatorDialog({
  listing,
  trigger,
}: {
  listing: Listing;
  trigger?: ReactNode;
}) {
  const [arv, setArv] = useState(Math.round(listing.price * 1.45));
  const [repairs, setRepairs] = useState(Math.round(listing.sqft * 35));
  const [holding, setHolding] = useState(8000);
  const [margin, setMargin] = useState(70);

  const mao = useMemo(() => {
    return Math.max(0, Math.round(arv * (margin / 100) - repairs - holding));
  }, [arv, repairs, holding, margin]);

  const spread = mao - listing.price;
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5" /> Deal Calculator
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              70% rule — estimate your max allowable offer
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div>
            <Label className="text-xs">After-Repair Value (ARV)</Label>
            <Input type="number" value={arv} onChange={(e) => setArv(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs">Repair budget</Label>
            <Input type="number" value={repairs} onChange={(e) => setRepairs(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs">Holding + closing costs</Label>
            <Input type="number" value={holding} onChange={(e) => setHolding(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs">Margin % of ARV (60–75 typical)</Label>
            <Input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value) || 0)} />
          </div>

          <div className="mt-4 rounded-xl bg-accent/10 border border-accent/30 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Max Allowable Offer</div>
            <div className="text-3xl font-extrabold text-primary mt-1">{fmt(mao)}</div>
            <div className="mt-1 text-sm">
              Asking: <strong>{fmt(listing.price)}</strong>{" "}
              <span className={spread >= 0 ? "text-green-700" : "text-red-700"}>
                ({spread >= 0 ? "+" : ""}{fmt(spread)} spread)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
            Estimates only. Verify ARV with comps and repair scope with a contractor. Not financial advice.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
