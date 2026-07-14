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
}

export type SellSellerRole = "seller" | "wholesaler" | "agent";

export interface CreateSellPropertyListingPayload {
  sellerRole: SellSellerRole;
  hasContract?: "yes" | "no" | null;
  address: string;
  askingPrice: number | null;
  description?: string;
  showingInstructions?: string;
  photoFiles: File[];
  photoLink?: string;
  name: string;
  email: string;
  phone: string;
}

export interface SellPropertyListingRow {
  id: string;
  address: string;
  asking_price: number | null;
  description: string | null;
  photo_urls: string[];
  photo_link: string | null;
  status: string;
  seller_role: string;
  has_contract: string | null;
  showing_instructions: string | null;
  name: string;
  email: string;
  phone: string;
  created_at: string;
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
   * Login-flavored magic link — no profile fields are attached to
   * user_metadata, so an existing buyer's stored name/phone/consent aren't
   * overwritten with blanks when they sign back in. The tenant slug still
   * rides along because verification is tenant-scoped.
   */
  async startLogin(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { tenant: TENANT_NAME },
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

    const nameVal = String(meta.name ?? "").trim();
    const phoneVal = String(meta.phone ?? "").trim();
    const consentPresent = Object.prototype.hasOwnProperty.call(meta, "consent");

    // Skip when the session callback carries no profile fields — that's a
    // login (startLogin only stamps `tenant`), and the existing row's
    // name/phone/consent should NOT be nuked back to empty just because
    // the buyer signed back in.
    if (!nameVal && !phoneVal && !consentPresent) return;

    const row = {
      auth_user_id: user.id,
      name: nameVal,
      email: user.email,
      phone: phoneVal,
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

  /**
   * CCPA / CPRA privacy request from the /do-not-sell page.
   *
   *   1. Writes a durable audit row to public.ccpa_requests (anon-insert RLS)
   *      — this is the compliance artifact tenants can pull for their 45-day
   *      response tracking.
   *   2. Fires a Resend email to the tenant's configured privacy inbox
   *      (privacy_email → agent_contact_email → primary_email) so the admin
   *      sees the request without having to poll the table.
   *
   * The audit row is the source of truth; the email is a courtesy. If email
   * fails we still consider the submission successful for the requester —
   * their legal right has been recorded either way.
   */
  async submitCcpaRequest(payload: {
    name: string;
    email: string;
    phone?: string;
    state?: string;
    requestType: "opt_out" | "know" | "delete" | "correct" | "limit";
    details?: string;
  }): Promise<void> {
    const { error } = await supabase.from("ccpa_requests").insert({
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      state: payload.state ?? null,
      request_type: payload.requestType,
      details: payload.details ?? null,
      tenant: TENANT_NAME,
    });
    if (error) throw error;

    try {
      const response = await http.post("/do-not-sell", {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        state: payload.state,
        request_type: payload.requestType,
        details: payload.details,
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        console.warn("[submitCcpaRequest] tenant email failed:", detail.slice(0, 200));
      }
    } catch (err) {
      console.warn(
        "[submitCcpaRequest] tenant email failed:",
        err instanceof Error ? err.message : err,
      );
    }
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

  // ─── Buyer profile (for /account/settings) ────────────────────────
  //
  // Reads from public.buyer_registrations. RLS restricts a buyer to their
  // own row via (auth_user_id = auth.uid()).

  async getProfile(): Promise<{
    name: string;
    email: string;
    phone: string;
    consent: boolean;
  } | null> {
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user?.email) return null;
    const { data, error } = await supabase
      .from("buyer_registrations")
      .select("name, email, phone, consent")
      .eq("auth_user_id", user.id)
      .eq("tenant", TENANT_NAME)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // No row yet — fall back to whatever's in user_metadata so the
      // settings form isn't empty on a buyer who verified but never had
      // their registration row upserted.
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      return {
        name: String(meta.name ?? ""),
        email: user.email,
        phone: String(meta.phone ?? ""),
        consent: Boolean(meta.consent ?? false),
      };
    }
    return {
      name: String(data.name ?? ""),
      email: String(data.email ?? user.email),
      phone: String(data.phone ?? ""),
      consent: Boolean(data.consent ?? false),
    };
  },

  async updateProfile(payload: {
    name: string;
    phone: string;
    consent: boolean;
  }): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user?.email) throw new Error("Not signed in");

    // Mirror the trimmed values into user_metadata as well so a future
    // session (fresh magic-link with no options.data) still sees the
    // updated profile via the same fallback path in getProfile().
    await supabase.auth.updateUser({
      data: {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        consent: payload.consent,
      },
    });

    const { error } = await supabase
      .from("buyer_registrations")
      .upsert(
        {
          auth_user_id: user.id,
          name: payload.name.trim(),
          email: user.email,
          phone: payload.phone.trim(),
          consent: payload.consent,
          tenant: TENANT_NAME,
        },
        { onConflict: "auth_user_id" },
      );
    if (error) throw error;
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

  // ─── Sell-property listings ("My Ads") ────────────────────────────
  //
  // Table: public.sell_property_listings (auth_user_id, tenant, ...).
  // Photos go into the `sell-property-photos` storage bucket under
  // `<tenant>/<user_id>/<listing_id>/<filename>` so RLS can gate uploads
  // by user id path segment.

  /**
   * Create a sell-property listing. Uploads any attached files to Supabase
   * Storage first, then inserts the row with the public URLs. On success,
   * fires the tenant-notification email through the TDR API (Resend) so
   * the tenant's configured inbox receives the lead. The email step is
   * best-effort — if it fails, the row is still in place and visible in
   * My Ads, and the caller sees the success screen.
   */
  async createSellPropertyListing(
    payload: CreateSellPropertyListingPayload,
  ): Promise<SellPropertyListingRow> {
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user?.id) throw new Error("Sign in to post a property");

    // Reserve a listing id up-front so we can name the storage folder
    // deterministically before the DB insert.
    const listingId = crypto.randomUUID();

    // Upload photos to the tenant/user/listing folder. `upsert: false` so a
    // repeat submit with the same file name doesn't silently overwrite.
    const uploadedUrls: string[] = [];
    for (const file of payload.photoFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${TENANT_NAME}/${user.id}/${listingId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("sell-property-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage
        .from("sell-property-photos")
        .getPublicUrl(path);
      uploadedUrls.push(pub.publicUrl);
    }

    const { data: inserted, error } = await supabase
      .from("sell_property_listings")
      .insert({
        id: listingId,
        auth_user_id: user.id,
        tenant: TENANT_NAME,
        on_market: "off",
        seller_role: payload.sellerRole,
        has_contract: payload.hasContract ?? null,
        address: payload.address,
        asking_price: payload.askingPrice,
        description: payload.description ?? null,
        showing_instructions: payload.showingInstructions ?? null,
        photo_urls: uploadedUrls,
        photo_link: payload.photoLink?.trim() || null,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
      })
      .select("*")
      .single();
    if (error) throw error;

    // Fire-and-forget tenant notification. The API resolves the recipient
    // from Buyers Hook (`agent_contact_email` → `primary_email` → env
    // fallback), so it works even if the tenant only configured a single
    // email in their preferences.
    try {
      await http.post("/sell-property-notify", {
        listing_id: listingId,
        address: payload.address,
        asking_price: payload.askingPrice,
        description: payload.description ?? undefined,
        showing_instructions: payload.showingInstructions ?? undefined,
        photo_urls: uploadedUrls,
        photo_link: payload.photoLink?.trim() || undefined,
        seller_role: payload.sellerRole,
        has_contract: payload.hasContract ?? undefined,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
      });
    } catch (err) {
      // Row is safe; log-and-continue so the UI success flow isn't
      // gated on the notification hop.
      console.warn(
        "[sell-property] tenant notification failed:",
        err instanceof Error ? err.message : err,
      );
    }

    return inserted as SellPropertyListingRow;
  },

  async listMyAds(): Promise<SellPropertyListingRow[]> {
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user?.id) return [];
    const { data, error } = await supabase
      .from("sell_property_listings")
      .select("*")
      .eq("auth_user_id", user.id)
      .eq("tenant", TENANT_NAME)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SellPropertyListingRow[];
  },

  async deleteMyAd(id: string): Promise<void> {
    const { error } = await supabase
      .from("sell_property_listings")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
