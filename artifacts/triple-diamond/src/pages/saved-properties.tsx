import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQueries } from "@tanstack/react-query";
import { Heart, Loader2, User, ListOrdered, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import ListingCard from "@/components/ListingCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { mlsService } from "@/services/mls.service";
import { mapMlsItemToListing } from "@/lib/mls-mapper";
import type { Listing } from "@/data/listings";

/**
 * "Saved Properties" — buyer's favorited listings, hydrated from the MLS API
 * one detail-fetch per listing_id. React Query dedupes across cards and
 * shares cache with the property-detail page, so navigating between
 * saved-list and detail is instant.
 *
 * Signed-in buyers see their Supabase-backed favorites (cross-device). If
 * the buyer isn't verified, we render whatever's in localStorage — same
 * source-of-truth split as useFavorites.
 */
export default function SavedPropertiesPage() {
  const [, setLocation] = useLocation();
  const { verified, loading: verifying } = useBuyerVerified();
  const { companyName } = useTenantBranding();
  const { favorites } = useFavorites();

  useEffect(() => {
    if (verifying) return;
    if (!verified) {
      setLocation("/login?next=" + encodeURIComponent("/account/saved"));
    }
  }, [verifying, verified, setLocation]);

  const detailQueries = useQueries({
    queries: favorites.map((id) => ({
      queryKey: ["mls-property", id],
      queryFn: () => mlsService.getById(id),
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const listings: Listing[] = detailQueries
    .map((q) => (q.data ? mapMlsItemToListing(q.data) : null))
    .filter((x): x is Listing => x !== null);

  const isLoading =
    verifying ||
    (favorites.length > 0 && detailQueries.some((q) => q.isLoading));
  const missing = favorites.length - listings.length;

  return (
    <>
      <SeoHead
        title={`Saved Properties — ${companyName}`}
        description="Off-market deals you've saved for later."
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            <Heart className="w-7 h-7 text-accent" /> Saved Properties
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {favorites.length === 0
              ? "You haven't saved any properties yet."
              : `${favorites.length} saved${missing > 0 ? ` (${missing} unavailable)` : ""}`}
          </p>
        </header>

        <nav className="flex flex-wrap gap-3 mb-8">
          <Link href="/account/settings">
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" /> Profile
            </Button>
          </Link>
          <Link href="/account/saved">
            <Button variant="default" className="bg-primary text-white">
              <Heart className="w-4 h-4 mr-2" /> Saved Properties
            </Button>
          </Link>
          <Link href="/account/my-ads">
            <Button variant="outline">
              <ListOrdered className="w-4 h-4 mr-2" /> My Listings
            </Button>
          </Link>
        </nav>

        {favorites.length === 0 ? (
          <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
            <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground mb-2">
              Nothing saved yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Tap the heart on any property card to save it here for later.
            </p>
            <Link href="/search">
              <Button className="bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
                <SearchIcon className="w-4 h-4 mr-2" /> Browse deals
              </Button>
            </Link>
          </div>
        ) : isLoading && listings.length === 0 ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
        )}

        {missing > 0 && listings.length > 0 && (
          <p className="mt-6 text-xs text-muted-foreground">
            {missing} saved listing{missing > 1 ? "s" : ""}{" "}
            {missing > 1 ? "aren't" : "isn't"} showing — they may have been
            withdrawn from the MLS. You can un-save them individually from
            their card if you find them again.
          </p>
        )}
      </div>
    </>
  );
}
