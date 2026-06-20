import { useQuery } from "@tanstack/react-query";
import { mlsService } from "@/services/mls.service";
import { mapMlsItemToListing } from "@/lib/mls-mapper";
import type { Listing } from "@/data/listings";

export interface UseMlsPropertyResult {
  listing: Listing | null;
  photos: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useMlsProperty(rId: string | undefined): UseMlsPropertyResult {
  const detail = useQuery({
    queryKey: ["mls-property", rId],
    queryFn: () => mlsService.getById(rId!),
    enabled: !!rId,
    staleTime: 60_000,
  });

  const photos = useQuery({
    queryKey: ["mls-property-photos", rId],
    queryFn: () => mlsService.getPhotos(rId!),
    enabled: !!rId,
    staleTime: 60_000,
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
    isError: detail.isError,
    error: (detail.error as Error) ?? null,
  };
}
