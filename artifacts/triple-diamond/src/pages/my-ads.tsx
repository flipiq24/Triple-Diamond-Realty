import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  Plus,
  MapPin,
  DollarSign,
  ListOrdered,
  User,
  Heart,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/SeoHead";
import { buyerService, type SellPropertyListingRow } from "@/services/buyer.service";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { useTenantBranding } from "@/hooks/useTenantBranding";

/**
 * "My Ads" — buyer's own submitted sell-property listings. Readonly view
 * (per client meeting decision — editing goes through the tenant admin's
 * moderation queue in Command) with a delete button so a buyer can withdraw
 * a listing they no longer want to sell.
 */
export default function MyAdsPage() {
  const [, setLocation] = useLocation();
  const { verified, loading: verifying } = useBuyerVerified();
  const { companyName } = useTenantBranding();

  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<SellPropertyListingRow[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (verifying) return;
    if (!verified) {
      setLocation("/login?next=" + encodeURIComponent("/account/my-ads"));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await buyerService.listMyAds();
        if (!cancelled) setAds(rows);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not load your ads");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [verifying, verified, setLocation]);

  const remove = async (id: string) => {
    if (!confirm("Withdraw this listing? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await buyerService.deleteMyAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
      toast.success("Listing withdrawn");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (verifying || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={`My Ads — ${companyName}`}
        description="Manage the off-market properties you've submitted."
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
              <ListOrdered className="w-7 h-7 text-accent" /> My Ads
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Properties you've submitted through Sell a Property.
            </p>
          </div>
          <Link href="/sell-property">
            <Button className="bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Post a new property
            </Button>
          </Link>
        </header>

        <nav className="flex flex-wrap gap-3 mb-8">
          <Link href="/account/settings">
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" /> Profile
            </Button>
          </Link>
          <Link href="/account/saved">
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2" /> Saved Properties
            </Button>
          </Link>
          <Link href="/account/my-ads">
            <Button variant="default" className="bg-primary text-white">
              <ListOrdered className="w-4 h-4 mr-2" /> My Ads
            </Button>
          </Link>
        </nav>

        {ads.length === 0 ? (
          <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
            <ListOrdered className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground mb-2">
              You haven't posted any properties yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Off-market deal? Post it free and connect with serious cash buyers.
            </p>
            <Link href="/sell-property">
              <Button className="bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
                Post your first property
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                deleting={deletingId === ad.id}
                onDelete={() => remove(ad.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function AdCard({
  ad,
  deleting,
  onDelete,
}: {
  ad: SellPropertyListingRow;
  deleting: boolean;
  onDelete: () => void;
}) {
  const price =
    ad.asking_price != null
      ? `$${Number(ad.asking_price).toLocaleString()}`
      : "—";
  const created = new Date(ad.created_at).toLocaleDateString();
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    live: "bg-green-100 text-green-800",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <li className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 shrink-0 bg-muted/40">
          {ad.photo_urls?.[0] ? (
            <img
              src={ad.photo_urls[0]}
              alt={ad.address}
              className="w-full h-40 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-40 md:h-full flex items-center justify-center text-muted-foreground/40">
              <MapPin className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusStyles[ad.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {ad.status}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Posted {created}
                </span>
              </div>
              <h2 className="font-bold text-primary truncate">{ad.address}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4 text-accent" />
                <span className="font-semibold text-foreground">{price}</span>
                <span className="text-muted-foreground">·</span>
                <span className="capitalize">{ad.seller_role}</span>
                {ad.has_contract && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span>
                      Contract: <strong>{ad.has_contract}</strong>
                    </span>
                  </>
                )}
              </div>
              {ad.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {ad.description}
                </p>
              )}
              {(ad.photo_urls.length > 0 || ad.photo_link) && (
                <div className="flex flex-wrap gap-3 mt-3 text-xs">
                  {ad.photo_urls.length > 0 && (
                    <span className="text-muted-foreground">
                      {ad.photo_urls.length} uploaded photo
                      {ad.photo_urls.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {ad.photo_link && (
                    <a
                      href={ad.photo_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Photos link
                    </a>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={deleting}
              className="text-red-600 border-red-200 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {deleting ? "Removing…" : "Withdraw"}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
