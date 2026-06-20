import type { MlsNotificationItem } from "@/services/mls.service";
import type { Listing } from "@/data/listings";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22320%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2228%22%20fill%3D%22%239ca3af%22%3ENo%20photo%20available%3C%2Ftext%3E%3C%2Fsvg%3E";

function toNumber(v: unknown, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function deriveDealType(item: MlsNotificationItem): Listing["dealType"] {
  const conditions = (item.specialConditions || "").toUpperCase();
  if (conditions.includes("REO") || conditions.includes("FORECLOSURE")) {
    return "Cash Only";
  }
  if (conditions.includes("SHORT SALE")) {
    return "Cash Only";
  }
  if (conditions.includes("PROBATE")) {
    return "Wholesale";
  }
  const keywords = (item.keywords || []).map((k) =>
    k.keyword.toUpperCase(),
  );
  if (
    keywords.some((k) => k.includes("FIXER") || k.includes("HANDYMAN") || k.includes("TLC"))
  ) {
    return "Handyman Special";
  }
  if (keywords.some((k) => k.includes("CASH"))) {
    return "Cash Only";
  }
  return "New Listing";
}

function deriveStatus(item: MlsNotificationItem): Listing["status"] {
  const s = (item.status || "").toLowerCase();
  if (s.includes("pending")) return "Pending";
  if (s.includes("sold") || s.includes("closed")) return "Just Sold";
  return "Active";
}

function derivePropertyType(item: MlsNotificationItem): Listing["propertyType"] {
  const subtype = (item.propertySubtype || "").toLowerCase();
  if (subtype.includes("condo")) return "Condo";
  if (subtype.includes("town")) return "Townhome";
  if (subtype.includes("multi") || subtype.includes("duplex") || subtype.includes("triplex")) {
    return "Multi-Family";
  }
  if (subtype.includes("mobile") || subtype.includes("manufactured")) return "Mobile";
  if (subtype.includes("land") || subtype.includes("lot")) return "Land";
  if (subtype.includes("farm") || subtype.includes("ranch")) return "Farm";
  return "Single Family";
}

export function mapMlsItemToListing(item: MlsNotificationItem): Listing {
  return {
    id: String(item.rId),
    price: toNumber(item.listPrice),
    beds: toNumber(item.bedroomsTotal),
    baths: toNumber(item.bathsTotal),
    sqft: toNumber(item.buildingSize),
    lotSqft: toNumber(item.lotSizeSqft),
    street: item.fullStreetAddress || "",
    city: item.city || "",
    state: "CA",
    zip: item.zipcode || "",
    lat: toNumber(item.latitude, 0),
    lng: toNumber(item.longitude, 0),
    propertyType: derivePropertyType(item),
    dealType: deriveDealType(item),
    image: item.cover_url || PLACEHOLDER_IMAGE,
    description: undefined,
    yearBuilt: toNumber(item.yearBuilt),
    hoaMonthly: 0,
    garage: toNumber(item.garageSpacesTotal),
    stories: 1,
    status: deriveStatus(item),
    saleType: "Existing",
    daysOnMarket: toNumber(item.dom),
    hasOpenHouse: false,
    has3DTour: false,
    hasVirtualTour: false,
    priceReduced: toNumber(item.priceChange) < 0,
    agentName: "",
    agentPhone: "",
    brokerage: "",
    brokerageDRE: "",
  };
}
