import { useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { BarChart3, MapPin, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Listing } from "@/data/listings";
import { useComps } from "@/hooks/useComps";
import type { CompRecord } from "@/services/mls.service";

type CompStatus = "Active" | "Pending" | "Sold";

type Comp = {
  id: string;
  compStatus: CompStatus;
  soldPrice: number;
  soldOrListedDate: string;
  distance: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
};

const statusColor: Record<CompStatus, string> = {
  Active: "#16a34a",   // green
  Pending: "#eab308",  // yellow
  Sold: "#1e3a8a",     // navy
};

const subjectIcon = L.divIcon({
  className: "comp-subject-pin",
  html: `<div style="width:22px;height:22px;border-radius:9999px;background:#f97316;border:3px solid #fff;box-shadow:0 0 0 3px rgba(30,58,138,.25),0 2px 6px rgba(0,0,0,.3);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function compIcon(status: CompStatus) {
  return L.divIcon({
    className: "comp-pin",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${statusColor[status]};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function toNumber(v: unknown, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapStatus(raw: string | null | undefined): CompStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("pending") || s.includes("back up")) return "Pending";
  if (s.includes("sold") || s.includes("closed")) return "Sold";
  return "Active";
}

// "6 wk ago" / "1 mo ago" / "Listed 4 d" / "Pending 3 wk" — matches the tone
// of the old mock strings so the UI keeps its shorthand feel.
function relativeAge(iso: string | null, prefix?: string): string {
  if (!iso) return prefix ?? "";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return prefix ?? "";
  const days = Math.max(0, Math.round((Date.now() - then) / 86_400_000));
  let core: string;
  if (days < 7) core = `${days} d`;
  else if (days < 60) core = `${Math.round(days / 7)} wk`;
  else if (days < 730) core = `${Math.round(days / 30)} mo`;
  else core = `${Math.round(days / 365)} y`;
  if (prefix === "ago") return `${core} ago`;
  if (prefix) return `${prefix} ${core}`;
  return core;
}

function toComp(row: CompRecord): Comp | null {
  const lat = toNumber(row.latitude, NaN);
  const lng = toNumber(row.longitude, NaN);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const status = mapStatus(row.listingstatus);
  const price =
    toNumber(row.closeprice, 0) > 0
      ? toNumber(row.closeprice)
      : toNumber(row.listprice);

  const when =
    status === "Sold"
      ? relativeAge(row.closingdate, "ago")
      : status === "Pending"
        ? relativeAge(row.pendingdate, "Pending")
        : relativeAge(row.listingdate, "Listed");

  return {
    id: String(row.r_id),
    compStatus: status,
    soldPrice: price,
    soldOrListedDate: when || "—",
    distance: toNumber(row.distance).toFixed(1),
    lat,
    lng,
    city: row.city ?? "",
    state: row.state ?? "",
    beds: toNumber(row.bedroomstotal),
    baths: toNumber(row.bathstotal),
    sqft: toNumber(row.buildingsize),
  };
}

export default function RunCompsDialog({
  listing,
  trigger,
}: {
  listing: Listing;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Only fetch once the dialog has been opened — avoids one API hit per
  // Run Comps button in a listing grid.
  const { data, isLoading, isError, error } = useComps(open ? listing.id : undefined);

  const allComps = useMemo<Comp[]>(() => {
    if (!data?.comps) return [];
    return data.comps
      .map(toComp)
      .filter((c): c is Comp => c !== null);
  }, [data]);

  const [statusFilter, setStatusFilter] = useState<CompStatus | "All">("All");

  const visible = useMemo(
    () => (statusFilter === "All" ? allComps : allComps.filter((c) => c.compStatus === statusFilter)),
    [allComps, statusFilter]
  );

  const counts = useMemo(() => {
    const c = { Active: 0, Pending: 0, Sold: 0 };
    allComps.forEach((x) => c[x.compStatus]++);
    return c;
  }, [allComps]);

  const summary = useMemo(() => {
    const soldOnly = allComps.filter((c) => c.compStatus === "Sold");
    const pool = soldOnly.length > 0 ? soldOnly : allComps;
    if (pool.length === 0) return { avgPpsf: 0, avgPrice: 0, estArv: 0 };
    const avgPpsf = Math.round(
      pool.reduce((s, c) => s + c.soldPrice / Math.max(c.sqft, 1), 0) / pool.length
    );
    const avgPrice = Math.round(pool.reduce((s, c) => s + c.soldPrice, 0) / pool.length);
    const estArv = Math.round(avgPpsf * listing.sqft);
    return { avgPpsf, avgPrice, estArv };
  }, [allComps, listing.sqft]);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const tabs: { key: CompStatus | "All"; label: string; count: number; dot?: string }[] = [
    { key: "All", label: "All", count: allComps.length },
    { key: "Active", label: "Active", count: counts.Active, dot: statusColor.Active },
    { key: "Pending", label: "Pending", count: counts.Pending, dot: statusColor.Pending },
    { key: "Sold", label: "Sold", count: counts.Sold, dot: statusColor.Sold },
  ];

  const emptyMsg = isError
    ? error?.message || "Couldn't load comps."
    : `No ${statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}comps in this area.`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-primary text-primary-foreground px-6 py-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Comparable Sales near {listing.city}, {listing.state}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              Subject property in orange. Comp pins colored by status.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Quick summary */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-border bg-muted/30 shrink-0">
          <div className="rounded-lg bg-white border border-border p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Asking</div>
            <div className="text-base font-extrabold text-primary">{fmt(listing.price)}</div>
          </div>
          <div className="rounded-lg bg-white border border-border p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Avg sold $/sqft</div>
            <div className="text-base font-extrabold text-primary">
              {summary.avgPpsf > 0 ? `$${summary.avgPpsf}` : "—"}
            </div>
          </div>
          <div className="rounded-lg bg-white border border-border p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Avg sold price</div>
            <div className="text-base font-extrabold text-primary">
              {summary.avgPrice > 0 ? fmt(summary.avgPrice) : "—"}
            </div>
          </div>
          <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Est. ARV</div>
            <div className="text-base font-extrabold text-primary">
              {summary.estArv > 0 ? fmt(summary.estArv) : "—"}
            </div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-6 pt-3 flex flex-wrap items-center gap-2 shrink-0">
          {tabs.map((t) => {
            const active = statusFilter === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:border-primary/50"
                }`}
              >
                {t.dot && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: t.dot }}
                  />
                )}
                {t.label} <span className={active ? "text-white/80" : "text-muted-foreground"}>({t.count})</span>
              </button>
            );
          })}
        </div>

        {/* Map + table — search-style */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-0 min-h-0 overflow-hidden">
          <div className="h-[400px] md:h-auto md:min-h-[420px] relative z-0 border-t md:border-t-0 md:border-r border-border">
            <MapContainer
              center={[listing.lat, listing.lng]}
              zoom={13}
              scrollWheelZoom
              style={{ width: "100%", height: "100%", zIndex: 0 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[listing.lat, listing.lng]} icon={subjectIcon}>
                <Popup>
                  <div className="text-xs">
                    <div className="font-bold text-primary">Subject property</div>
                    <div>{fmt(listing.price)} · {listing.beds}bd / {listing.baths}ba · {listing.sqft.toLocaleString()} sqft</div>
                  </div>
                </Popup>
              </Marker>
              {visible.map((c) => (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={compIcon(c.compStatus)}>
                  <Popup>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-primary flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: statusColor[c.compStatus] }} />
                        {c.compStatus}
                      </div>
                      <div>{fmt(c.soldPrice)} · {c.beds}bd / {c.baths}ba · {c.sqft.toLocaleString()} sqft</div>
                      <div className="text-muted-foreground">{c.distance} mi · {c.soldOrListedDate}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="overflow-auto min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading comps…
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0 bg-white border-b border-border">
                <tr>
                  <th className="text-left py-2 pl-4 pr-2 font-bold">Status</th>
                  <th className="text-left py-2 px-2 font-bold">Comp</th>
                  <th className="text-right py-2 px-2 font-bold">Price</th>
                  <th className="text-right py-2 px-2 font-bold">$/sqft</th>
                  <th className="text-right py-2 pl-2 pr-4 font-bold">When</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="py-2 pl-4 pr-2">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${statusColor[c.compStatus]}22`, color: statusColor[c.compStatus] }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[c.compStatus] }} />
                        {c.compStatus}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-accent" /> {c.city}, {c.state}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.distance} mi · {c.beds}bd/{c.baths}ba · {c.sqft.toLocaleString()} sqft
                      </div>
                    </td>
                    <td className="text-right py-2 px-2 font-bold text-primary whitespace-nowrap">{fmt(c.soldPrice)}</td>
                    <td className="text-right py-2 px-2 whitespace-nowrap">
                      ${Math.round(c.soldPrice / Math.max(c.sqft, 1))}
                    </td>
                    <td className="text-right py-2 pl-2 pr-4 text-muted-foreground whitespace-nowrap">{c.soldOrListedDate}</td>
                  </tr>
                ))}
                {!isLoading && visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      {emptyMsg}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-2 text-[11px] text-muted-foreground leading-relaxed border-t border-border shrink-0">
          Comps pulled from the live MLS index. For a full CMA, request one from your buyer's agent.
        </div>
      </DialogContent>
    </Dialog>
  );
}
