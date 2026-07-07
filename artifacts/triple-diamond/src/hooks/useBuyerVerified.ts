import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, TENANT_NAME } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export interface VerifiedBuyer {
  name: string;
  email: string;
  phone: string;
  verifiedAt: number;
}

function buyerFromSession(session: Session | null): VerifiedBuyer | null {
  if (!session?.user?.email) return null;
  const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    name: String(meta.name ?? ""),
    email: session.user.email,
    phone: String(meta.phone ?? ""),
    verifiedAt: session.user.confirmed_at
      ? new Date(session.user.confirmed_at).getTime()
      : Date.now(),
  };
}

export function useBuyerVerified(): {
  verified: boolean;
  buyer: VerifiedBuyer | null;
  loading: boolean;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Verification is scoped to THIS tenant. The Supabase project is shared
  // across every buyer site (buyers.<tenant>.flipiq.com), so without this
  // check a buyer who verified on tenant A would appear "verified" on
  // tenant B just by opening it — leaking address details across
  // brokerages that never onboarded them. We stamp the tenant slug into
  // user_metadata.tenant during signInWithOtp (see buyer.service.ts) and
  // gate verified on that matching the current deployment's slug.
  const sessionTenant = (session?.user?.user_metadata ?? {}) as {
    tenant?: unknown;
  };
  const tenantMatches =
    typeof sessionTenant.tenant === "string" &&
    sessionTenant.tenant.toLowerCase() === TENANT_NAME.toLowerCase();

  return {
    verified: !!session && tenantMatches,
    buyer: tenantMatches ? buyerFromSession(session) : null,
    loading,
  };
}
