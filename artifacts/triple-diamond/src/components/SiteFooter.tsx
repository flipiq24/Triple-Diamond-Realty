import { Link } from "wouter";
import logo from "@assets/image_1779548344914.png";
import { Phone, Mail, MapPin, Home as HomeIcon, ScaleIcon } from "lucide-react";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-primary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="bg-white p-2 rounded-lg inline-block mb-4">
              <img src={logo} alt="Triple Diamond Realty" className="h-10 w-auto" />
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-md leading-relaxed">
              California's off-market real estate brokerage. 30 years sourcing handyman specials, fixer-uppers, wholesale assignments, and distressed investment properties — powered by the most advanced deal-finding technology on the market today.
            </p>
            <p className="text-primary-foreground/60 text-xs mt-4 max-w-md leading-relaxed">
              Triple Diamond Realty is a licensed California real estate brokerage. DRE License #[INSERT]. All property information deemed reliable but not guaranteed. Properties sold as-is. See full <Link href="/legal#disclaimers" className="underline hover:text-accent">disclosures</Link>.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-accent transition-colors">Search Deals</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/legal" className="hover:text-accent transition-colors">Legal &amp; Disclosures</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-accent" aria-hidden="true" />
                <a href="tel:+19092804906" className="hover:text-accent">(909) 280-4906</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-accent" aria-hidden="true" />
                <a href="mailto:info@tdrealty.net" className="hover:text-accent">info@tdrealty.net</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-accent" aria-hidden="true" />
                <span>Serving all of California</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance Strip */}
        <div className="border-t border-primary-foreground/10 pt-6 mb-6 flex flex-wrap items-center gap-6 text-xs text-primary-foreground/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-white rounded flex items-center justify-center" aria-hidden="true">
              <HomeIcon className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-white">Equal Housing Opportunity</div>
              <div>We support the Federal Fair Housing Act.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScaleIcon className="w-5 h-5 text-accent" aria-hidden="true" />
            <div className="leading-tight">
              <div className="font-bold text-white">Licensed in California</div>
              <div>DRE License #[INSERT] · Verify at dre.ca.gov</div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/60">
          <p>© {year} Triple Diamond Realty. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            <Link href="/legal#privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/legal#terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/legal#cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/legal#do-not-sell" className="hover:text-white transition-colors font-semibold text-accent">Do Not Sell or Share My Info</Link>
            <Link href="/legal#accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="/legal#fair-housing" className="hover:text-white transition-colors">Fair Housing</Link>
            <Link href="/legal#dre" className="hover:text-white transition-colors">DRE</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
