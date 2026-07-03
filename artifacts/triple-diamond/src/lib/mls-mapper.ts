import type { MlsNotificationItem } from "@/services/mls.service";
import type { Listing } from "@/data/listings";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22320%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2228%22%20fill%3D%22%239ca3af%22%3ENo%20photo%20available%3C%2Ftext%3E%3C%2Fsvg%3E";

type AnyRecord = Record<string, unknown>;
type ListingAgent = {
  name?: string;
  email?: string;
  phone?: string;
  officeName?: string;
  officePhone?: string;
  officeKey?: string;
  mlsId?: string;
};

function pick<T = unknown>(obj: AnyRecord, ...keys: string[]): T | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

function toNumber(v: unknown, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toStr(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function readListingAgent(item: AnyRecord): ListingAgent {
  const raw = item["listing_agent"] ?? item["listingAgent"];
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as ListingAgent;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as ListingAgent;
  return {};
}

function deriveDealType(item: AnyRecord): Listing["dealType"] {
  const conditions = toStr(
    pick(item, "specialConditions", "specialconditions"),
  ).toUpperCase();
  if (conditions.includes("REO") || conditions.includes("FORECLOSURE")) {
    return "Cash Only";
  }
  if (conditions.includes("SHORT SALE")) return "Cash Only";
  if (conditions.includes("PROBATE")) return "Wholesale";

  // property-data schema stores extra info under `features` (array of {name, value})
  const features = pick<Array<{ name?: string; value?: string }>>(item, "features");
  if (Array.isArray(features)) {
    const specialCond = features.find(
      (f) => f?.name?.toLowerCase() === "special listing conditions",
    );
    const sc = specialCond?.value?.toUpperCase() ?? "";
    if (sc.includes("REO") || sc.includes("FORECLOSURE")) return "Cash Only";
    if (sc.includes("SHORT SALE")) return "Cash Only";
    if (sc.includes("PROBATE")) return "Wholesale";
  }

  const keywords = (pick<Array<{ keyword: string; value: number }>>(item, "keywords") || [])
    .map((k) => k.keyword.toUpperCase());
  if (
    keywords.some((k) =>
      k.includes("FIXER") || k.includes("HANDYMAN") || k.includes("TLC"),
    )
  ) {
    return "Handyman Special";
  }
  if (keywords.some((k) => k.includes("CASH"))) return "Cash Only";
  return "New Listing";
}

function deriveStatus(item: AnyRecord): Listing["status"] {
  const s = toStr(
    pick(item, "status", "caretsListingStatus", "caretslistingstatus"),
  ).toLowerCase();
  if (s.includes("pending")) return "Pending";
  if (s.includes("sold") || s.includes("closed")) return "Just Sold";
  return "Active";
}

function derivePropertyType(item: AnyRecord): Listing["propertyType"] {
  // property-data.mls.listings uses uppercased enum: SINGLE_FAMILY, CONDO, etc.
  const raw = toStr(
    pick(item, "property_type", "propertyType", "propertySubtype", "propertysubtype"),
  ).toLowerCase();
  if (raw.includes("condo")) return "Condo";
  if (raw.includes("town")) return "Townhome";
  if (
    raw.includes("multi") ||
    raw.includes("duplex") ||
    raw.includes("triplex")
  ) {
    return "Multi-Family";
  }
  if (raw.includes("mobile") || raw.includes("manufactured")) return "Mobile";
  if (raw.includes("land") || raw.includes("lot")) return "Land";
  if (raw.includes("farm") || raw.includes("ranch")) return "Farm";
  return "Single Family";
}

export function mapMlsItemToListing(raw: MlsNotificationItem | AnyRecord): Listing {
  const item = raw as AnyRecord;
  const agent = readListingAgent(item);

  return {
    id: toStr(pick(item, "id", "rId", "r_id", "rid")),
    price: toNumber(pick(item, "list_price", "listPrice", "listprice")),
    beds: toNumber(pick(item, "beds_count", "bedroomsTotal", "bedroomstotal")),
    baths: toNumber(pick(item, "baths_count", "bathsTotal", "bathstotal")),
    sqft: toNumber(pick(item, "sqft", "buildingSize", "buildingsize")),
    lotSqft: toNumber(pick(item, "lot_size_sqft", "lotSizeSqft", "lotsizesqft")),
    street: toStr(
      pick(item, "street_address", "fullStreetAddress", "fullstreetaddress"),
    ),
    city: toStr(pick(item, "city")),
    state: toStr(pick(item, "state"), "CA"),
    zip: toStr(pick(item, "postal_code", "zipcode", "zipCode")),
    lat: toNumber(pick(item, "latitude")),
    lng: toNumber(pick(item, "longitude")),
    propertyType: derivePropertyType(item),
    dealType: deriveDealType(item),
    image: toStr(pick(item, "cover_url", "coverUrl"), PLACEHOLDER_IMAGE),
    description: toStr(pick(item, "description")) || undefined,
    yearBuilt: toNumber(pick(item, "year_built", "yearBuilt", "yearbuilt")),
    hoaMonthly: 0,
    garage: toNumber(
      pick(item, "garage_size", "garageSpacesTotal", "garagespacestotal"),
    ),
    stories: 1,
    status: deriveStatus(item),
    saleType: "Existing",
    daysOnMarket: toNumber(pick(item, "days_on_market", "dom", "DOM")),
    hasOpenHouse: false,
    has3DTour: false,
    hasVirtualTour: false,
    priceReduced: toNumber(pick(item, "priceChange", "price_change")) < 0,
    agentName: toStr(agent.name),
    agentPhone: toStr(agent.phone),
    brokerage: toStr(agent.officeName),
    brokerageDRE: toStr(agent.mlsId ? `MLS# ${agent.mlsId}` : ""),
    apiStatus: toStr(
      pick(item, "status", "caretsListingStatus", "caretslistingstatus"),
    ),
    specialConditions: toStr(
      pick(item, "specialConditions", "specialconditions"),
    ),
    source: toStr(pick(item, "mls_code", "source")),
    mlsNumber: toStr(pick(item, "listing_id", "listingId", "mls", "mlsnum")),
  };
}
