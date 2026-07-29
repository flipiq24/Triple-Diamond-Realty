import { useQuery } from "@tanstack/react-query";
import { mlsService } from "@/services/mls.service";
import { mapMlsItemToListing } from "@/lib/mls-mapper";
import type { Listing } from "@/data/listings";

export interface UseMlsPropertyResult {
  listing: Listing | null;
  photos: string[];
  isLoading: boolean;
  /**
   * True while the `/photos` request is in flight. Kept separate from
   * `isLoading` (detail query) so the gallery skeleton stays visible until
   * we truly know whether the property has photos — otherwise the empty
   * state flashes for the gap between detail and photos responses.
   */
  photosLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Bounded retry config shared by both queries in this hook. Prevents an API
// outage from producing dozens of failing requests as components remount.
const RETRY_OPTS = {
  retry: 3,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
  retryOnMount: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export function useMlsProperty(rId: string | undefined): UseMlsPropertyResult {
  const detail = useQuery({
    queryKey: ["mls-property", rId],
    queryFn: () => mlsService.getById(rId!),
    enabled: !!rId,
    staleTime: 60_000,
    ...RETRY_OPTS,
  });

  const photos = useQuery({
    queryKey: ["mls-property-photos", rId],
    queryFn: () => mlsService.getPhotos(rId!),
    enabled: !!rId,
    staleTime: 60_000,
    ...RETRY_OPTS,
  });

  const photoUrls: string[] = [];
  if (photos.data?.cover_url) photoUrls.push(photos.data.cover_url);
  for (const p of photos.data?.photo_urls ?? []) {
    if (p.url && !photoUrls.includes(p.url)) photoUrls.push(p.url);
  }

  return {
    listing: detail.data ? mapMlsItemToListing(detail.data) : null,
    photos: photoUrls,
    isLoading: detail.isLoading,
    photosLoading: photos.isPending && !photos.data,
    isError: detail.isError,
    error: (detail.error as Error) ?? null,
  };
}
