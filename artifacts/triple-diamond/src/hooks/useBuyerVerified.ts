import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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

  return {
    verified: !!session,
    buyer: buyerFromSession(session),
    loading,
  };
}
