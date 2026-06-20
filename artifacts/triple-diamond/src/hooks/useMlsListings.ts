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
