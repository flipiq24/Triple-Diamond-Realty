import { useQuery } from "@tanstack/react-query";
import {
  mlsService,
  type CompsQueryParams,
  type CompsResponse,
} from "@/services/mls.service";

export interface UseCompsResult {
  data: CompsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useComps(
  subjectId: string | number | undefined,
  params: CompsQueryParams = {},
): UseCompsResult {
  const q = useQuery({
    queryKey: ["comps", subjectId, params],
    queryFn: () => mlsService.getComps(subjectId!, params),
    enabled: subjectId !== undefined && subjectId !== null && subjectId !== "",
    staleTime: 60_000,
    // Cap retries so a downed API doesn't drown the property page + Deal
    // Calculator + Run Comps (all three subscribe to this same query key)
    // in dozens of failing requests as each mounts.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    data: q.data,
    isLoading: q.isLoading,
    isError: q.isError,
    error: (q.error as Error) ?? null,
  };
}
