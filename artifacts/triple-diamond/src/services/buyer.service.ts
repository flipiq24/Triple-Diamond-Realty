import { supabase, TENANT_NAME } from "@/lib/supabase";
import { http } from "@/lib/http-client";

export interface BuyerRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export interface EbookSignupPayload {
  name: string;
  email: string;
  phone: string;
}

export interface AgentContactPayload {
  propertyId?: string | null;
  propertyAddress?: string | null;
  name: string;
  email: string;
  phone: string;
  message?: string;
  isMilitary?: boolean;
}

export const buyerService = {
  /**
   * Send a magic link to the buyer. Their name/phone/consent + tenant ride
   * along in user_metadata so we can persist them when the session callback
   * lands. emailRedirectTo brings them back to the page they were on.
   */
  async startRegistration(
    payload: BuyerRegistrationPayload,
    redirectTo: string,
  ): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email: payload.email,
      options: {
        data: {
          name: payload.name,
          phone: payload.phone,
          consent: payload.consent,
          tenant: TENANT_NAME,
        },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
  },

  /**
   * Called once the buyer has clicked the magic link and a session exists.
   * Persists their profile (idempotent — safe to call on every session start).
   */
  async upsertRegistrationFromSession(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user?.email) return;

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

    // Skip the upsert when the current deployment's tenant doesn't match
    // the tenant the session was created on. Supabase is shared across every
    // buyer site (buyers.<tenant>.flipiq.com), so a buyer who signed in on
    // tenant A and later opens tenant B would otherwise overwrite the
    // `tenant` column on their buyer_registrations row with B — quietly
    // remapping them to a brokerage they never opted in to. Also keeps
    // buyer_registrations honest for downstream analytics.
    const sessionTenant =
      typeof meta.tenant === "string" ? meta.tenant.toLowerCase() : null;
    if (!sessionTenant || sessionTenant !== TENANT_NAME.toLowerCase()) {
      return;
    }

    const row = {
      auth_user_id: user.id,
      name: String(meta.name ?? ""),
      email: user.email,
      phone: String(meta.phone ?? ""),
      consent: Boolean(meta.consent ?? false),
      tenant: TENANT_NAME,
    };

    await supabase
      .from("buyer_registrations")
      .upsert(row, { onConflict: "auth_user_id" });
  },

  async submitEbookSignup(payload: EbookSignupPayload): Promise<void> {
    const { error } = await supabase.from("ebook_signups").insert({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      tenant: TENANT_NAME,
    });
    if (error) throw error;
  },

  async submitAgentContact(payload: AgentContactPayload): Promise<void> {
    // Routes through the TDR API so the tenant's configured
    // `agent_contact_email` (via Buyers Hook) receives the inquiry — not
    // just written to Supabase and never seen by the tenant. The API also
    // performs the audit-write server-side, so we no longer duplicate it
    // here.
    const response = await http.post("/agent-contact", {
      listing_id: payload.propertyId ?? "",
      property_address: payload.propertyAddress ?? undefined,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message ?? undefined,
      is_military: payload.isMilitary ?? false,
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(body?.message || `Contact request failed (${response.status})`);
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  // ─── Favorites (verified buyers only) ────────────────────────────
  //
  // Table: public.buyer_favorites (auth_user_id, tenant, listing_id).
  // RLS restricts a buyer to their own rows. We store only the listing_id;
  // the full property record lives in mls.listings and is fetched on demand.

  async listFavorites(): Promise<string[]> {
    const { data, error } = await supabase
      .from("buyer_favorites")
      .select("listing_id")
      .eq("tenant", TENANT_NAME);
    if (error) throw error;
    return (data ?? []).map((r) => r.listing_id as string);
  },

  async addFavorite(listingId: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) throw new Error("Sign in to save favorites");
    const { error } = await supabase
      .from("buyer_favorites")
      .insert({
        auth_user_id: userId,
        tenant: TENANT_NAME,
        listing_id: listingId,
      });
    // Ignore the unique-constraint violation so double-clicking Save on
    // the same row never surfaces as a UI error — the second insert is a
    // no-op, the buyer's intent is already satisfied.
    if (error && error.code !== "23505") throw error;
  },

  async removeFavorite(listingId: string): Promise<void> {
    const { error } = await supabase
      .from("buyer_favorites")
      .delete()
      .eq("tenant", TENANT_NAME)
      .eq("listing_id", listingId);
    if (error) throw error;
  },
};
