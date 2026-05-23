import { useMemo, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { BarChart3, MapPin } from "lucide-react";
import { listings, type Listing } from "@/data/listings";

export default function RunCompsDialog({
  listing,
  trigger,
}: {
  listing: Listing;
  trigger?: ReactNode;
}) {
  const comps = useMemo(() => {
    const others = listings.filter((l) => l.id !== listing.id && l.city === listing.city);
    const pool = others.length >= 3 ? others : listings.filter((l) => l.id !== listing.id);
    return pool.slice(0, 4).map((l, i) => ({
      ...l,
      soldPrice: Math.round(l.price * (1.05 + i * 0.07)),
      soldDate: ["2 wk ago", "1 mo ago", "6 wk ago", "3 mo ago"][i],
      distance: (0.3 + i * 0.4).toFixed(1),
    }));
  }, [listing.id]);

  const avgPpsf = Math.round(
    comps.reduce((s, c) => s + c.soldPrice / Math.max(c.sqft, 1), 0) / comps.length
  );
  const estArv = Math.round(avgPpsf * listing.sqft);
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Comparable Sales
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              Recent sold properties near {listing.city}, {listing.state}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-muted/60 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Avg $/sqft</div>
              <div className="text-lg font-extrabold text-primary">${avgPpsf}</div>
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Est. ARV</div>
              <div className="text-lg font-extrabold text-primary">{fmt(estArv)}</div>
            </div>
            <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Asking</div>
              <div className="text-lg font-extrabold text-primary">{fmt(listing.price)}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-bold">Property</th>
                  <th className="text-right py-2 px-2 font-bold">Sold</th>
                  <th className="text-right py-2 px-2 font-bold">$/sqft</th>
                  <th className="text-right py-2 px-2 font-bold">Beds/Bath</th>
                  <th className="text-right py-2 pl-2 font-bold">When</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-accent" /> {c.city}, {c.state}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{c.distance} mi · {c.sqft.toLocaleString()} sqft</div>
                    </td>
                    <td className="text-right py-2 px-2 font-bold text-primary">{fmt(c.soldPrice)}</td>
                    <td className="text-right py-2 px-2">${Math.round(c.soldPrice / Math.max(c.sqft, 1))}</td>
                    <td className="text-right py-2 px-2">{c.beds}/{c.baths}</td>
                    <td className="text-right py-2 pl-2 text-muted-foreground">{c.soldDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed pt-3">
            Comp data shown for illustration. Triple Diamond Realty pulls live MLS comps for verified buyers — request a full CMA from your buyer's agent.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
