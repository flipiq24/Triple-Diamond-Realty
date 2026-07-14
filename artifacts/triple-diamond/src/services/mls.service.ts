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
  // Calendar range against mls.listings.list_date. YYYY-MM-DD strings.
  // Takes precedence over last_24_hours / last_week on the API side.
  list_date_from?: string;
  list_date_to?: string;
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
  append("list_date_from", params.list_date_from);
  append("list_date_to", params.list_date_to);
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

export interface CompRecord {
  r_id: number | string;
  fullstreetaddress: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  listprice: number | string | null;
  closeprice: number | string | null;
  bedroomstotal: number | null;
  bathstotal: number | null;
  buildingsize: number | null;
  yearbuilt: number | null;
  listingstatus: string | null;
  listingdate: string | null;
  pendingdate: string | null;
  closingdate: string | null;
  dom: number | null;
  distance: number | string | null;
}

export interface CompsResponse {
  subject: {
    id: string;
    r_id: number | string;
    latitude: number;
    longitude: number;
    bedroomstotal: number | null;
    bathstotal: number | null;
    buildingsize: number | null;
    listprice: number | null;
  };
  appliedFilters: {
    radius_miles: number;
    bed_tolerance: number | null;
    bath_tolerance: number | null;
    sqft_tolerance_pct: number | null;
    limit: number;
  };
  comps: CompRecord[];
}

export interface CompsQueryParams {
  radius_miles?: number;
  limit?: number;
  bed_tolerance?: number;
  bath_tolerance?: number;
  sqft_tolerance_pct?: number;
  // Rolling recency window for CLOSED comps. API default is 12 months so
  // callers get sensible sold-recency by default (ARV IQ style). Pass 0 to
  // disable the recency clause entirely.
  sold_within_months?: number;
  // Explicit close-date window (YYYY-MM-DD). Wins over sold_within_months
  // when either is set. Non-closed statuses (Active/Pending/Hold/BackUpOffer)
  // always pass through — the recency clause only gates CLOSED rows.
  minclosingdate?: string;
  maxclosingdate?: string;
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

  async getComps(
    subjectId: string | number,
    params: CompsQueryParams = {},
  ): Promise<CompsResponse> {
    const qs = new URLSearchParams();
    if (params.radius_miles !== undefined)
      qs.append("radius_miles", String(params.radius_miles));
    if (params.limit !== undefined) qs.append("limit", String(params.limit));
    if (params.bed_tolerance !== undefined)
      qs.append("bed_tolerance", String(params.bed_tolerance));
    if (params.bath_tolerance !== undefined)
      qs.append("bath_tolerance", String(params.bath_tolerance));
    if (params.sqft_tolerance_pct !== undefined)
      qs.append("sqft_tolerance_pct", String(params.sqft_tolerance_pct));
    if (params.sold_within_months !== undefined)
      qs.append("sold_within_months", String(params.sold_within_months));
    if (params.minclosingdate !== undefined)
      qs.append("minclosingdate", params.minclosingdate);
    if (params.maxclosingdate !== undefined)
      qs.append("maxclosingdate", params.maxclosingdate);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const response = await http.get(`/comps/${subjectId}${suffix}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || "Failed to fetch comps");
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
