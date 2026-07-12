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
  });

  return {
    data: q.data,
    isLoading: q.isLoading,
    isError: q.isError,
    error: (q.error as Error) ?? null,
  };
}
