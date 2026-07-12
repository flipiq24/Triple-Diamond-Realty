import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NotFound from "@/pages/not-found";
import Search from "@/pages/search";
import About from "@/pages/about";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Disclosures from "@/pages/disclosures";
import Accessibility from "@/pages/accessibility";
import DoNotSell from "@/pages/do-not-sell";
import CityPage from "@/pages/city";
import Property from "@/pages/property";
import SellProperty from "@/pages/sell-property";
import CompWithAI from "@/pages/comp-with-ai";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import AccountSettingsPage from "@/pages/account-settings";
import MyAdsPage from "@/pages/my-ads";
import SavedPropertiesPage from "@/pages/saved-properties";
import { HomeA, HomeB, HomeC, HomeD, HomeE, HomeF } from "@/pages/variant-home";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import EbookPopup from "@/components/EbookPopup";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { buyerService } from "@/services/buyer.service";
import { TenantThemeProvider } from "@/components/TenantThemeProvider";
import GlobalJsonLd from "@/components/GlobalJsonLd";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-accent focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to content</a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Switch>
          <Route path="/" component={HomeA} />
          <Route path="/fixer-uppers" component={HomeA} />
          <Route path="/off-market-deals" component={HomeB} />
          <Route path="/cash-flow-rentals" component={HomeC} />
          <Route path="/wholesale-deals" component={HomeD} />
          <Route path="/1031-exchange" component={HomeE} />
          <Route path="/focus" component={HomeF} />
          <Route path="/a" component={HomeA} />
          <Route path="/b" component={HomeB} />
          <Route path="/c" component={HomeC} />
          <Route path="/d" component={HomeD} />
          <Route path="/e" component={HomeE} />
          <Route path="/f" component={HomeF} />
          <Route path="/california/:city" component={CityPage} />
          <Route path="/property/:id" component={Property} />
          <Route path="/sell-property" component={SellProperty} />
          <Route path="/comp-with-ai" component={CompWithAI} />
          <Route path="/search" component={Search} />
          <Route path="/about" component={About} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/disclosures" component={Disclosures} />
          <Route path="/accessibility" component={Accessibility} />
          <Route path="/do-not-sell" component={DoNotSell} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/account/settings" component={AccountSettingsPage} />
          <Route path="/account/my-ads" component={MyAdsPage} />
          <Route path="/account/saved" component={SavedPropertiesPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <SiteFooter />
      <CookieConsent />
      <EbookPopup />
    </div>
  );
}

function AuthBootstrap() {
  // Explicit magic-link callback handler.
  //
  // The magic-link email brings the buyer back to their exact page with
  // `?code=<pkce>` appended. Supabase's built-in `detectSessionInUrl` is
  // meant to exchange that code for a session automatically, but it fails
  // silently when the PKCE code_verifier is missing or the code has
  // expired — leaving the buyer stuck seeing the Register modal after
  // clicking their own link. We do the exchange explicitly here so:
  //   - success clears `?code` from the URL and lets the auth state
  //     propagate through onAuthStateChange
  //   - failure surfaces a toast so the buyer knows to request a new link
  //     instead of staring at an unresponsive modal
  const [exchanging, setExchanging] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("code");
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setExchanging(false);
      return;
    }
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (!code) return;

    let cancelled = false;
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;
      if (error) {
        toast.error(
          "This link is expired or invalid. Please request a new magic link.",
        );
      } else {
        toast.success("You're verified. Full property details unlocked.");
      }
      // Strip `?code` (and Supabase's optional `error*` params) from the URL
      // regardless of outcome so a refresh doesn't retry a stale code.
      url.searchParams.delete("code");
      url.searchParams.delete("error");
      url.searchParams.delete("error_code");
      url.searchParams.delete("error_description");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      setExchanging(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist buyer profile ONCE per authenticated user id.
  //
  // supabase-js fires SIGNED_IN far more liberally than the name suggests
  // (initial session restore from storage, tab focus, BroadcastChannel
  // cross-tab sync, and — in some versions — after every token refresh).
  // A naive `if (event === "SIGNED_IN")` handler upserts the same row
  // dozens of times over a browsing session, hammering Supabase. Dedupe
  // by tracking the last user id we've already written, so re-signing in
  // as the same buyer is a no-op while a genuine account switch still
  // triggers a fresh upsert.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let lastUpsertedUserId: string | null = null;

    const upsertIfNew = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;
      if (!uid || uid === lastUpsertedUserId) return;
      lastUpsertedUserId = uid;
      try {
        await buyerService.upsertRegistrationFromSession();
      } catch {
        // Roll back the guard so a transient failure can retry on the
        // next real auth event instead of silently skipping forever.
        lastUpsertedUserId = null;
      }
    };

    // Fire once at mount if a session was restored from localStorage.
    upsertIfNew();

    // Fire on genuine sign-ins. We deliberately ignore USER_UPDATED and
    // TOKEN_REFRESHED — neither changes the columns we care about.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") upsertIfNew();
      if (event === "SIGNED_OUT") lastUpsertedUserId = null;
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // While the code exchange is in flight, block the app so no page tries to
  // read `verified=false` and pop the Register modal on top of an
  // already-verified buyer.
  if (exchanging) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <div className="text-sm font-medium text-slate-500 tracking-wide">
          Verifying your link…
        </div>
      </div>
    );
  }
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <html lang="en" />
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthBootstrap />
            <TenantThemeProvider>
              <GlobalJsonLd />
              <Router />
            </TenantThemeProvider>
          </WouterRouter>
          <Toaster />
          <Sonner position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
