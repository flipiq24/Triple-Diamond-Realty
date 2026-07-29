import { useQuery } from "@tanstack/react-query";
import { mlsService, type MlsQueryParams } from "@/services/mls.service";
import { mapMlsItemToListing } from "@/lib/mls-mapper";
import type { Listing } from "@/data/listings";

export interface UseMlsListingsResult {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMlsListings(
  params: MlsQueryParams = {},
): UseMlsListingsResult {
  const query = useQuery({
    queryKey: ["mls-hot-deals", params],
    queryFn: () => mlsService.getHotDeals(params),
    staleTime: 60_000,
    // Cap retries at 3 (default is same but explicit — plus we want the
    // exponential backoff to hit its ceiling fast, not drag on for minutes).
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    // Once the query errors out, don't retry every time a new consumer
    // mounts. Without this, ListingCard / Search / Home each remounting
    // triggers a fresh 3-retry cycle → dozens of requests over minutes.
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    listings: (query.data?.results ?? []).map(mapMlsItemToListing),
    total: query.data?.total ?? 0,
    page: query.data?.page ?? params.page ?? 1,
    pageSize: query.data?.pageSize ?? params.pageSize ?? 25,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error) ?? null,
    refetch: query.refetch,
  };
}
