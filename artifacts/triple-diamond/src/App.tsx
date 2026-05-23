import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
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
import { HomeA, HomeB, HomeC, HomeD, HomeE, HomeF } from "@/pages/variant-home";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import EbookPopup from "@/components/EbookPopup";

const queryClient = new QueryClient();

const globalLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Triple Diamond Realty",
  url: "https://tripledimondrealty.com",
  telephone: "(909) 280-4906",
  email: "info@tdrealty.net",
  areaServed: "California",
  description:
    "30 years finding off-market, handyman special, foreclosure, BRRRR, and 1031 investment properties across California.",
  slogan: "Diamonds in the Rough. Delivered Daily.",
};

function Router() {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-accent focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to content</a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Switch>
          <Route path="/" component={HomeA} />
          {/* SEO-friendly canonical routes */}
          <Route path="/fixer-uppers" component={HomeA} />
          <Route path="/off-market-deals" component={HomeB} />
          <Route path="/cash-flow-rentals" component={HomeC} />
          <Route path="/wholesale-deals" component={HomeD} />
          <Route path="/1031-exchange" component={HomeE} />
          <Route path="/focus" component={HomeF} />
          {/* Legacy short-code aliases (kept for existing PPC/print links) */}
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <SiteFooter />
      <CookieConsent />
      <EbookPopup />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <html lang="en" />
        <script type="application/ld+json">{JSON.stringify(globalLd)}</script>
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <Sonner position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
