import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { BarChart3, MapPin, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Listing } from "@/data/listings";
import { useComps } from "@/hooks/useComps";
import type { CompRecord } from "@/services/mls.service";

type CompStatus = "Active" | "Pending" | "Sold";

type Comp = {
  id: string;
  compStatus: CompStatus;
  price: number;
  ppsf: number;
  saleDate: string;      // e.g. "6 wk ago" / "Listed 3 d"
  saleTimestamp: number; // for sorting (ms since epoch, 0 if unknown)
  distance: number;      // miles as number for sort
  lat: number;
  lng: number;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
};

/**
 * Command's comps color grammar. Green/amber/red for status — not navy.
 * Orange (#F97316) drives every interactive state: active tab, selected
 * row border, sort chevron, hover pin ring. Matches Command exactly so
 * TDR feels like part of the same suite.
 */
const STATUS_COLOR: Record<CompStatus, string> = {
  Active: "#10B981",   // emerald-500
  Pending: "#F59E0B",  // amber-500
  Sold: "#EF4444",     // red-500
};

const STATUS_BG_TINT: Record<CompStatus, string> = {
  Active: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Sold: "bg-red-100 text-red-800",
};

const ORANGE = "#F97316";

/** Larger orange marker for the subject property, ring included. */
const subjectIcon = L.divIcon({
  className: "comp-subject-pin",
  html: `<div style="width:22px;height:22px;border-radius:9999px;background:${ORANGE};border:3px solid #fff;box-shadow:0 0 0 3px rgba(249,115,22,.25),0 2px 6px rgba(0,0,0,.3);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/** Comp pin — status-colored circle, white border, optional hover ring. */
function compIcon(status: CompStatus, hovered = false) {
  const size = hovered ? 20 : 16;
  const ring = hovered
    ? `box-shadow:0 0 0 3px rgba(249,115,22,.35),0 2px 6px rgba(0,0,0,.4);`
    : `box-shadow:0 1px 4px rgba(0,0,0,.4);`;
  return L.divIcon({
    className: "comp-pin",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${STATUS_COLOR[status]};border:2px solid #fff;${ring}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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

/** "6 wk ago" / "Listed 3 d" / "Pending 2 mo" — shorthand for the row cell. */
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
  const sqft = toNumber(row.buildingsize);
  const ppsf = sqft > 0 ? Math.round(price / sqft) : 0;

  const dateRaw =
    status === "Sold"
      ? row.closingdate
      : status === "Pending"
        ? row.pendingdate
        : row.listingdate;
  const when =
    status === "Sold"
      ? relativeAge(dateRaw, "ago")
      : status === "Pending"
        ? relativeAge(dateRaw, "Pending")
        : relativeAge(dateRaw, "Listed");
  const saleTimestamp = dateRaw ? new Date(dateRaw).getTime() : 0;

  return {
    id: String(row.r_id),
    compStatus: status,
    price,
    ppsf,
    saleDate: when || "—",
    saleTimestamp: Number.isFinite(saleTimestamp) ? saleTimestamp : 0,
    distance: toNumber(row.distance),
    lat,
    lng,
    city: row.city ?? "",
    state: row.state ?? "",
    beds: toNumber(row.bedroomstotal),
    baths: toNumber(row.bathstotal),
    sqft,
  };
}

type SortField = "status" | "price" | "ppsf" | "distance" | "saleDate";
type SortDir = "asc" | "desc";

export default function RunCompsDialog({
  listing,
  trigger,
}: {
  listing: Listing;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // The property page also calls useComps(id) so the fetch is already in
  // flight (or cached) by the time this dialog opens. React Query dedupes
  // by queryKey — no double request.
  const { data, isLoading, isError, error } = useComps(listing.id);

  const allComps = useMemo<Comp[]>(() => {
    if (!data?.comps) return [];
    return data.comps
      .map(toComp)
      .filter((c): c is Comp => c !== null);
  }, [data]);

  const [statusFilter, setStatusFilter] = useState<CompStatus | "All">("All");
  const [sortField, setSortField] = useState<SortField>("distance");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  // Hover sync — hovering a row highlights the pin on the map (and vice
  // versa). Single shared state, either surface can drive it.
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (statusFilter === "All" ? allComps : allComps.filter((c) => c.compStatus === statusFilter)),
    [allComps, statusFilter]
  );

  // Client-side sort. Cheap. No backend change needed.
  const visible = useMemo(() => {
    const rows = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      switch (sortField) {
        case "status":
          return a.compStatus.localeCompare(b.compStatus) * dir;
        case "price":
          return (a.price - b.price) * dir;
        case "ppsf":
          return (a.ppsf - b.ppsf) * dir;
        case "distance":
          return (a.distance - b.distance) * dir;
        case "saleDate":
          return (a.saleTimestamp - b.saleTimestamp) * dir;
        default:
          return 0;
      }
    });
    return rows;
  }, [filtered, sortField, sortDir]);

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
      pool.reduce((s, c) => s + c.price / Math.max(c.sqft, 1), 0) / pool.length
    );
    const avgPrice = Math.round(pool.reduce((s, c) => s + c.price, 0) / pool.length);
    const estArv = Math.round(avgPpsf * listing.sqft);
    return { avgPpsf, avgPrice, estArv };
  }, [allComps, listing.sqft]);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  // Segmented control tabs — sharp inner corners, orange when active.
  // Mirrors Command's CompsHeader segmented switcher exactly.
  const tabs: { key: CompStatus | "All"; label: string; count: number }[] = [
    { key: "All", label: "All", count: allComps.length },
    { key: "Active", label: "Active", count: counts.Active },
    { key: "Pending", label: "Pending", count: counts.Pending },
    { key: "Sold", label: "Sold", count: counts.Sold },
  ];

  const onSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "price" || field === "ppsf" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3 h-3 text-gray-400 ml-1 inline" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[#F97316] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#F97316] ml-1 inline" />
    );
  };

  const emptyMsg = isError
    ? error?.message || "Couldn't load comps."
    : `No ${statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}comps in this area.`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl p-0 overflow-hidden max-h-[92vh] flex flex-col bg-white">
        <div className="bg-[#0F1F3B] text-white px-6 py-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Comparable Sales near {listing.city}, {listing.state}
            </DialogTitle>
            <DialogDescription className="text-white/70 text-sm">
              Subject in orange &middot; comp pins colored by status &middot; hover a row to highlight its pin.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* KPI strip — Command's compact card style. Est ARV gets orange treatment. */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-gray-200 bg-gray-50 shrink-0">
          <div className="rounded-md bg-white border border-gray-200 p-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Asking</div>
            <div className="text-base font-extrabold text-[#0F1F3B] tabular-nums">{fmt(listing.price)}</div>
          </div>
          <div className="rounded-md bg-white border border-gray-200 p-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Avg sold $/sqft</div>
            <div className="text-base font-extrabold text-[#0F1F3B] tabular-nums">
              {summary.avgPpsf > 0 ? `$${summary.avgPpsf}` : "—"}
            </div>
          </div>
          <div className="rounded-md bg-white border border-gray-200 p-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Avg sold price</div>
            <div className="text-base font-extrabold text-[#0F1F3B] tabular-nums">
              {summary.avgPrice > 0 ? fmt(summary.avgPrice) : "—"}
            </div>
          </div>
          <div className="rounded-md bg-orange-50 border border-orange-200 p-3">
            <div className="text-[10px] uppercase tracking-wider text-orange-700 font-bold">Est. ARV</div>
            <div className="text-base font-extrabold text-[#0F1F3B] tabular-nums">
              {summary.estArv > 0 ? fmt(summary.estArv) : "—"}
            </div>
          </div>
        </div>

        {/* Segmented status tabs — Command style */}
        <div className="px-6 pt-3 pb-3 flex items-center gap-0 shrink-0">
          <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
            {tabs.map((t, i) => {
              const active = statusFilter === t.key;
              const isFirst = i === 0;
              const isLast = i === tabs.length - 1;
              return (
                <button
                  key={t.key}
                  onClick={() => setStatusFilter(t.key)}
                  disabled={isLoading}
                  className={`px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    active
                      ? "bg-[#F97316] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${!isFirst ? "border-l border-gray-200" : ""} ${
                    !isFirst && !isLast ? "" : ""
                  }`}
                >
                  {t.key !== "All" && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: active ? "#fff" : STATUS_COLOR[t.key as CompStatus] }}
                    />
                  )}
                  {t.label}
                  <span className={active ? "text-white/80" : "text-gray-500"}>({t.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map + table — 40/60 split (map / list) matching Command's ratio */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-0 min-h-0 overflow-hidden border-t border-gray-200">
          <div className="h-[400px] md:h-auto md:min-h-[420px] relative z-0 md:border-r border-gray-200">
            {/* Strip Leaflet's default padding + border-radius from the popup
                content wrapper so the photo section can bleed edge-to-edge
                like Command's HoverPreview. Scoped to `.tdr-comp-popup`. */}
            <style>{`
              .leaflet-popup-content-wrapper:has(.tdr-comp-popup) { padding: 0; border-radius: 10px; overflow: hidden; }
              .leaflet-popup-content:has(.tdr-comp-popup) { margin: 0; width: 300px !important; }
            `}</style>
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
              <FitBounds
                subject={[listing.lat, listing.lng]}
                points={visible.map((c) => [c.lat, c.lng] as [number, number])}
              />
              <Marker position={[listing.lat, listing.lng]} icon={subjectIcon}>
                <Popup>
                  <div className="text-xs">
                    <div className="font-bold text-[#0F1F3B]">Subject property</div>
                    <div className="text-gray-600">{fmt(listing.price)} · {listing.beds}bd / {listing.baths}ba · {listing.sqft.toLocaleString()} sqft</div>
                  </div>
                </Popup>
              </Marker>
              {visible.map((c) => (
                <Marker
                  key={c.id}
                  position={[c.lat, c.lng]}
                  icon={compIcon(c.compStatus, hoveredId === c.id)}
                  eventHandlers={{
                    mouseover: () => setHoveredId(c.id),
                    mouseout: () => setHoveredId(null),
                  }}
                >
                  <Popup maxWidth={300} minWidth={300} closeButton={false}>
                    <CompPopupCard comp={c} fmt={fmt} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Table — Command's dense grid with sortable columns + status
              cell that stacks status name + gray date pill. */}
          <div className="overflow-auto min-h-0 relative bg-white">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                  <div
                    aria-hidden="true"
                    style={{
                      width: 20,
                      height: 20,
                      border: "3px solid rgba(249, 115, 22, 0.18)",
                      borderTopColor: "#F97316",
                      borderRadius: "50%",
                      animation: "comps-spin 1s linear infinite",
                    }}
                  />
                  <span>Loading comps…</span>
                  <style>{`@keyframes comps-spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              </div>
            )}
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white border-b border-gray-200 z-[1]">
                <tr>
                  <SortableTh field="status" label="Status" onSort={onSort} sortField={sortField} SortIcon={SortIcon} align="left" className="pl-4 pr-2 w-24" />
                  <th className="text-left py-2 px-2 font-semibold uppercase text-gray-600 text-[10px] tracking-wider">Comp</th>
                  <SortableTh field="price" label="Price" onSort={onSort} sortField={sortField} SortIcon={SortIcon} align="right" />
                  <SortableTh field="ppsf" label="$/sqft" onSort={onSort} sortField={sortField} SortIcon={SortIcon} align="right" />
                  <SortableTh field="distance" label="Dist" onSort={onSort} sortField={sortField} SortIcon={SortIcon} align="right" />
                  <SortableTh field="saleDate" label="When" onSort={onSort} sortField={sortField} SortIcon={SortIcon} align="right" className="pl-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const isHovered = hoveredId === c.id;
                  return (
                    <tr
                      key={c.id}
                      onMouseEnter={() => setHoveredId(c.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`border-b border-gray-100 ${
                        isHovered
                          ? "bg-orange-50 border-l-4 border-l-[#F97316]"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <td className="py-2 pl-4 pr-2 w-24" style={{ color: STATUS_COLOR[c.compStatus] }}>
                        <div className="font-semibold">{c.compStatus}</div>
                        <div className="mt-0.5">
                          <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-normal">
                            {c.saleDate}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <div className="font-semibold text-[#0F1F3B] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#F97316]" /> {c.city}, {c.state}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {c.beds}bd/{c.baths}ba · {c.sqft.toLocaleString()} sqft
                        </div>
                      </td>
                      <td className="text-right py-2 px-2 font-bold text-[#0F1F3B] tabular-nums whitespace-nowrap">{fmt(c.price)}</td>
                      <td className="text-right py-2 px-2 text-gray-700 tabular-nums whitespace-nowrap">${c.ppsf}</td>
                      <td className="text-right py-2 px-2 text-gray-700 tabular-nums whitespace-nowrap">{c.distance.toFixed(2)}</td>
                      <td className="text-right py-2 pl-2 pr-4 text-gray-500 whitespace-nowrap tabular-nums">{c.saleDate}</td>
                    </tr>
                  );
                })}
                {!isLoading && visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-gray-500 py-8">
                      {emptyMsg}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-2 text-[11px] text-gray-500 leading-relaxed border-t border-gray-200 shrink-0 bg-gray-50">
          Comps pulled from the live MLS index. For a full CMA, request one from your buyer's agent.
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Sortable header cell. Renders the label + a sort chevron that flips
 * direction on click. Keeps table headers uniform and lets us swap
 * icons without touching each <th>.
 */
function SortableTh({
  field,
  label,
  onSort,
  sortField,
  SortIcon,
  align = "left",
  className = "",
}: {
  field: SortField;
  label: string;
  onSort: (f: SortField) => void;
  sortField: SortField;
  SortIcon: React.FC<{ field: SortField }>;
  align?: "left" | "right";
  className?: string;
}) {
  const isActive = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`py-2 px-2 font-semibold uppercase text-[10px] tracking-wider cursor-pointer select-none hover:bg-gray-100 ${
        isActive ? "bg-orange-50 text-orange-700" : "text-gray-600"
      } text-${align} ${className}`}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon field={field} />
      </span>
    </th>
  );
}

/**
 * Auto-fit the map bounds so all visible comps + the subject fit in the
 * viewport with sensible padding. Caps zoom at 14 so a single tightly-
 * clustered set doesn't slam into street-level view.
 */
function FitBounds({
  subject,
  points,
}: {
  subject: [number, number];
  points: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    const all: [number, number][] = [subject, ...points];
    if (all.length < 2) {
      // Just the subject — leave the map wherever it is; the initial
      // center prop already put us in the right neighborhood.
      return;
    }
    const bounds = L.latLngBounds(all);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14,     // don't zoom past street level even for tight clusters
      animate: true,
    });
    // Only refit when the set of points changes, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject[0], subject[1], points.length, points.map((p) => p.join(",")).join("|")]);
  return null;
}

/**
 * Popup card that opens on marker click. Structure mirrors Command's
 * HoverPreview: gray photo placeholder header, address + orange price
 * badge row, status pill + status date, then a label/value grid.
 * We don't have per-comp photos or agent contact fields on TDR, so
 * those sections are dropped — everything else is one-for-one.
 */
function CompPopupCard({ comp, fmt }: { comp: Comp; fmt: (n: number) => string }) {
  return (
    <div className="tdr-comp-popup" style={{ width: 300, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      {/* Photo placeholder — Command shows the property photo here; we
          fall back to a "No Photo Available" strip since comps don't
          come with cover_url on the TDR API side yet. */}
      <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
        No Photo Available
      </div>

      <div className="p-4">
        {/* Header row: address (truncated) + orange price badge */}
        <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center justify-between gap-2">
          <span className="truncate flex items-center gap-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
            <span className="truncate">{comp.city}, {comp.state}</span>
          </span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-[#F97316] text-white shrink-0">
            {fmt(comp.price)}
          </span>
        </div>

        {/* Status pill + relative date */}
        <div className="mb-3 flex items-center gap-2">
          <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${STATUS_BG_TINT[comp.compStatus]}`}>
            {comp.compStatus}
          </span>
          <span className="text-[11px] text-gray-600">{comp.saleDate}</span>
        </div>

        {/* Label/value rows — same visual pattern as Command's block */}
        <div className="text-xs text-gray-600 space-y-2">
          <div className="flex justify-between">
            <span>{comp.compStatus === "Sold" ? "Sold Price:" : "List Price:"}</span>
            <span className="font-medium text-gray-900 tabular-nums">{fmt(comp.price)}</span>
          </div>
          <div className="flex justify-between">
            <span>Bed/Bath:</span>
            <span className="font-medium text-gray-900">{comp.beds}/{comp.baths}</span>
          </div>
          <div className="flex justify-between">
            <span>Square Feet:</span>
            <span className="font-medium text-gray-900 tabular-nums">{comp.sqft > 0 ? `${comp.sqft.toLocaleString()} ft²` : "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>$/Sqft:</span>
            <span className="font-medium text-gray-900 tabular-nums">{comp.ppsf > 0 ? `$${comp.ppsf}` : "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance:</span>
            <span className="font-medium text-gray-900 tabular-nums">{comp.distance.toFixed(2)} mi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
