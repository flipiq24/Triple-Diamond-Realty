import { supabase, TENANT_NAME } from "@/lib/supabase";

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
    const { error } = await supabase.from("agent_contact_requests").insert({
      property_id: payload.propertyId ?? null,
      property_address: payload.propertyAddress ?? null,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message ?? null,
      is_military: payload.isMilitary ?? false,
      tenant: TENANT_NAME,
    });
    if (error) throw error;
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },
};
