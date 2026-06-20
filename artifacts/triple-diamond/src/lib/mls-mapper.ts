import type { MlsNotificationItem } from "@/services/mls.service";
import type { Listing } from "@/data/listings";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22320%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2228%22%20fill%3D%22%239ca3af%22%3ENo%20photo%20available%3C%2Ftext%3E%3C%2Fsvg%3E";

type AnyRecord = Record<string, unknown>;

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

function deriveDealType(item: AnyRecord): Listing["dealType"] {
  const conditions = toStr(
    pick(item, "specialConditions", "specialconditions"),
  ).toUpperCase();
  if (conditions.includes("REO") || conditions.includes("FORECLOSURE")) {
    return "Cash Only";
  }
  if (conditions.includes("SHORT SALE")) return "Cash Only";
  if (conditions.includes("PROBATE")) return "Wholesale";

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
  const s = toStr(pick(item, "status", "caretsListingStatus", "caretslistingstatus")).toLowerCase();
  if (s.includes("pending")) return "Pending";
  if (s.includes("sold") || s.includes("closed")) return "Just Sold";
  return "Active";
}

function derivePropertyType(item: AnyRecord): Listing["propertyType"] {
  const subtype = toStr(pick(item, "propertySubtype", "propertysubtype")).toLowerCase();
  if (subtype.includes("condo")) return "Condo";
  if (subtype.includes("town")) return "Townhome";
  if (
    subtype.includes("multi") ||
    subtype.includes("duplex") ||
    subtype.includes("triplex")
  ) {
    return "Multi-Family";
  }
  if (subtype.includes("mobile") || subtype.includes("manufactured")) {
    return "Mobile";
  }
  if (subtype.includes("land") || subtype.includes("lot")) return "Land";
  if (subtype.includes("farm") || subtype.includes("ranch")) return "Farm";
  return "Single Family";
}

export function mapMlsItemToListing(raw: MlsNotificationItem | AnyRecord): Listing {
  const item = raw as AnyRecord;

  return {
    id: toStr(pick(item, "rId", "r_id", "rid")),
    price: toNumber(pick(item, "listPrice", "listprice")),
    beds: toNumber(pick(item, "bedroomsTotal", "bedroomstotal")),
    baths: toNumber(pick(item, "bathsTotal", "bathstotal")),
    sqft: toNumber(pick(item, "buildingSize", "buildingsize")),
    lotSqft: toNumber(pick(item, "lotSizeSqft", "lotsizesqft")),
    street: toStr(pick(item, "fullStreetAddress", "fullstreetaddress")),
    city: toStr(pick(item, "city")),
    state: "CA",
    zip: toStr(pick(item, "zipcode", "zipCode")),
    lat: toNumber(pick(item, "latitude")),
    lng: toNumber(pick(item, "longitude")),
    propertyType: derivePropertyType(item),
    dealType: deriveDealType(item),
    image: toStr(pick(item, "cover_url", "coverUrl"), PLACEHOLDER_IMAGE),
    description: undefined,
    yearBuilt: toNumber(pick(item, "yearBuilt", "yearbuilt")),
    hoaMonthly: 0,
    garage: toNumber(pick(item, "garageSpacesTotal", "garagespacestotal")),
    stories: 1,
    status: deriveStatus(item),
    saleType: "Existing",
    daysOnMarket: toNumber(pick(item, "dom", "DOM")),
    hasOpenHouse: false,
    has3DTour: false,
    hasVirtualTour: false,
    priceReduced: toNumber(pick(item, "priceChange", "price_change")) < 0,
    agentName: "",
    agentPhone: "",
    brokerage: "",
    brokerageDRE: "",
  };
}
