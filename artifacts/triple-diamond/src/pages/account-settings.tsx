import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { User, Save, LogOut, ListOrdered, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SeoHead from "@/components/SeoHead";
import { buyerService } from "@/services/buyer.service";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";
import { useTenantBranding } from "@/hooks/useTenantBranding";

/**
 * Buyer account settings. Reads the current profile from
 * public.buyer_registrations (RLS-scoped to the signed-in user), lets them
 * edit name/phone/consent, and updates both the DB row and user_metadata so
 * subsequent magic-link logins don't reset the values.
 *
 * Redirects to /login?next=/account/settings if the buyer is not signed in.
 */
export default function AccountSettingsPage() {
  const [, setLocation] = useLocation();
  const { verified, loading: verifying } = useBuyerVerified();
  const { companyName } = useTenantBranding();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (verifying) return;
    if (!verified) {
      setLocation("/login?next=" + encodeURIComponent("/account/settings"));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const profile = await buyerService.getProfile();
        if (cancelled || !profile) return;
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setConsent(profile.consent);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [verifying, verified, setLocation]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      await buyerService.updateProfile({ name, phone, consent });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await buyerService.signOut();
    toast.success("Signed out");
    setLocation("/");
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
        title={`Account Settings — ${companyName}`}
        description="Update your buyer profile — name, phone, and communication preferences."
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            <User className="w-7 h-7 text-accent" /> Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Signed in as <strong>{email}</strong>
          </p>
        </header>

        <nav className="flex flex-wrap gap-3 mb-8">
          <Link href="/account/settings">
            <Button variant="default" className="bg-primary text-white">
              <User className="w-4 h-4 mr-2" /> Profile
            </Button>
          </Link>
          <Link href="/account/saved">
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2" /> Saved Properties
            </Button>
          </Link>
          <Link href="/account/my-ads">
            <Button variant="outline">
              <ListOrdered className="w-4 h-4 mr-2" /> My Ads
            </Button>
          </Link>
        </nav>

        <form
          onSubmit={save}
          className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5"
        >
          <div>
            <Label htmlFor="acct-name" className="text-xs">Full name</Label>
            <Input
              id="acct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <div>
            <Label htmlFor="acct-email" className="text-xs">Email</Label>
            <Input
              id="acct-email"
              value={email}
              disabled
              readOnly
              className="bg-muted/40"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Email is tied to your sign-in and can't be changed here.
            </p>
          </div>

          <div>
            <Label htmlFor="acct-phone" className="text-xs">Mobile phone</Label>
            <Input
              id="acct-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <label className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed">
            <Checkbox
              className="mt-0.5"
              checked={consent}
              onCheckedChange={(v) => setConsent(!!v)}
              disabled={saving}
            />
            <span>
              I authorize {companyName} to contact me at the email and phone
              number above about off-market deals and related services. Reply
              STOP to opt out.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={saving}
              className="bg-accent hover:bg-accent/90 text-white font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={signOut}
              className="sm:ml-auto"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
