import { http } from "@/lib/http-client";

export interface MlsNotificationItem {
  rId: number;
  listingId: string;
  listingType: string;
  caretsListingStatus?: string;
  propertySubtype?: string;
  fullStreetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  listPrice: number;
  closePrice?: number | null;
  originalListPrice?: number;
  bedroomsTotal: number;
  bathsTotal: number;
  yearBuilt: number;
  buildingSize: number;
  lotSizeSqft: number;
  poolDescriptions?: string;
  garageSpacesTotal?: number;
  dom: number;
  cdom: number;
  confidenceScore?: string;
  ptfv?: string | number;
  futureValue?: number;
  status: string;
  offerStatus?: string;
  priceChange?: number;
  keywordLevel?: number;
  keywords?: Array<{ keyword: string; value: number }>;
  cover_url?: string;
  specialConditions?: string;
  slcCodes?: string[];
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export interface MlsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: MlsNotificationItem[];
}

export interface MlsQueryParams {
  page?: number;
  pageSize?: number;
  last_24_hours?: boolean;
  last_week?: boolean;
  type?: "All" | "New" | "Viewed";
  source?: string;
  pricerange_from?: number;
  pricerange_to?: number;
  sqft_from?: number;
  sqft_to?: number;
  yearbuilt_from?: number;
  yearbuilt_to?: number;
  cities?: string[];
  zipcodes?: string[];
  counties?: string[];
  status?: string[];
  propertytype?: string[];
  searchQuery?: string;
  sortColumn?: string;
  sortOrder?: "ASC" | "DESC";
}

function buildQueryString(params: MlsQueryParams): string {
  const qs = new URLSearchParams();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") {
      qs.append(key, value ? "true" : "false");
      return;
    }
    qs.append(key, String(value));
  };

  append("page", params.page ?? 1);
  append("pageSize", params.pageSize ?? 25);
  // Only send when the caller explicitly asked for the hot-deals firehose.
  // Omitting the param means "return all matching ACTIVE listings" —
  // sending false as a string would break because URL params are strings
  // and any non-empty string coerces to true on the API side.
  if (params.last_24_hours) append("last_24_hours", true);
  // Homepage "This Week's Top Deals" strip uses last_week; the API prefers
  // last_24_hours when both are set.
  if (params.last_week) append("last_week", true);
  append("type", params.type ?? "All");
  append("source", params.source ?? "MLS");
  append("pricerange_from", params.pricerange_from ?? 0);
  append("pricerange_to", params.pricerange_to ?? 1500000);
  append("sqft_from", params.sqft_from);
  append("sqft_to", params.sqft_to);
  append("yearbuilt_from", params.yearbuilt_from);
  append("yearbuilt_to", params.yearbuilt_to);
  append("searchQuery", params.searchQuery);
  append("sortColumn", params.sortColumn);
  append("sortOrder", params.sortOrder);

  params.cities?.forEach((v) => qs.append("city", v));
  params.zipcodes?.forEach((v) => qs.append("zipcode", v));
  params.counties?.forEach((v) => qs.append("counties", v));
  params.status?.forEach((v) => qs.append("status", v));
  params.propertytype?.forEach((v) => qs.append("propertytype", v));

  return qs.toString();
}

export interface PropertyPhotosResponse {
  cover_url?: string;
  photo_urls?: Array<{ objectId: number; url: string }>;
}

export interface MlsAutocompleteHit {
  id: number;
  listing_id: string;
  fullstreetaddress: string;
  city: string;
  state: string;
  zipcode: string;
  list_price: number | null;
}

export interface MlsAutocompleteResponse {
  results: MlsAutocompleteHit[];
}

export const mlsService = {
  async getHotDeals(params: MlsQueryParams = {}): Promise<MlsResponse> {
    const query = buildQueryString(params);
    const response = await http.get(`/mls?${query}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch MLS hot deals");
    }
    return response.json();
  },

  async getById(rId: string | number): Promise<MlsNotificationItem> {
    const response = await http.get(`/property-details/${rId}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch property details");
    }
    return response.json();
  },

  async getPhotos(rId: string | number): Promise<PropertyPhotosResponse> {
    const response = await http.get(`/property-details/${rId}/photos`);
    if (!response.ok) {
      return {};
    }
    return response.json();
  },

  async autocomplete(q: string): Promise<MlsAutocompleteResponse> {
    if (q.trim().length < 2) return { results: [] };
    const response = await http.get(
      `/mls/autocomplete?q=${encodeURIComponent(q.trim())}`,
    );
    if (!response.ok) return { results: [] };
    return response.json();
  },
};
