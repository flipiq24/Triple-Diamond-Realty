import { Link } from "wouter";
import { Phone, Mail, MapPin, Home as HomeIcon } from "lucide-react";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { logoUrl, companyName } = useTenantBranding();
  const cf = useTenantCustomFields();

  const phone = cf.primary_phone;
  const phoneTel = cf.primary_phone_tel;
  const email = cf.primary_email;
  const tagline = cf.tagline;
  const marketingDescription = cf.marketing_description;
  const dre = cf.dre_broker_license;
  const responsibleBroker = cf.responsible_broker_name;
  const responsibleBrokerDre = cf.responsible_broker_dre;
  const addressLine1 = cf.office_address_line1;
  const addressCity = cf.office_address_city;
  const addressState = cf.office_address_state;
  const addressZip = cf.office_address_zip;
  const serviceArea = cf.service_area;

  const addressCombined = [
    addressLine1,
    [addressCity, addressState, addressZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" • ");

  const licenseLine = [
    `${companyName}`,
    dre ? `CA DRE Broker License #${dre}` : null,
    responsibleBroker && responsibleBrokerDre
      ? `Responsible Broker ${responsibleBroker} CA DRE #${responsibleBrokerDre}`
      : responsibleBroker
        ? `Responsible Broker ${responsibleBroker}`
        : null,
    addressCombined || null,
    phone || null,
    email || null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-primary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="bg-white p-2 rounded-lg inline-block mb-4">
              <img src={logoUrl} alt={companyName} className="h-10 w-auto" />
            </div>
            {tagline && (
              <p className="text-accent font-bold text-lg mb-3">{tagline}</p>
            )}
            {marketingDescription && (
              <p className="text-primary-foreground/80 text-sm max-w-md leading-relaxed">
                {marketingDescription}
              </p>
            )}
          </div>

          <div>
            <h2 className="font-bold text-lg mb-4 text-white">Explore</h2>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/" className="hover:text-accent">Home</Link></li>
              <li><Link href="/search" className="hover:text-accent">Search Deals</Link></li>
              <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
              <li><Link href="/fixer-uppers" className="hover:text-accent">Fixer-Uppers</Link></li>
              <li><Link href="/off-market-deals" className="hover:text-accent">Off-Market Deals</Link></li>
              <li><Link href="/cash-flow-rentals" className="hover:text-accent">Cash-Flow Rentals</Link></li>
              <li><Link href="/wholesale-deals" className="hover:text-accent">Wholesale Deals</Link></li>
              <li><Link href="/1031-exchange" className="hover:text-accent">1031 Exchange</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-4 text-white">Contact</h2>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              {phone && phoneTel && (
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-accent" aria-hidden="true" />
                  <a href={`tel:${phoneTel}`} className="hover:text-accent">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-accent" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="hover:text-accent">{email}</a>
                </li>
              )}
              {(addressLine1 || serviceArea) && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-accent" aria-hidden="true" />
                  <span>
                    {addressLine1 && <>{addressLine1}<br/></>}
                    {(addressCity || addressState || addressZip) && (
                      <>{[addressCity, addressState, addressZip].filter(Boolean).join(", ")}<br/></>
                    )}
                    {serviceArea && <>Serving all of {serviceArea}</>}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Compliance block — assembled from custom fields; hidden if the required license info is absent */}
        {(dre || responsibleBroker) && (
          <div className="border-t border-primary-foreground/10 pt-6 mb-6 text-xs text-primary-foreground/80 leading-relaxed">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 border-2 border-white rounded flex items-center justify-center" aria-hidden="true">
                  <HomeIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">Equal Housing Opportunity</span>
              </div>
              <p>
                <strong className="text-white">{companyName}</strong>
                {licenseLine.startsWith(companyName) ? licenseLine.slice(companyName.length) : ` • ${licenseLine}`}
              </p>
            </div>
            <p className="text-primary-foreground/60">
              All property information deemed reliable but not guaranteed. Properties offered AS-IS, WHERE-IS. Listings may be on-market (MLS), off-market, or held by {companyName} or an affiliate via equitable interest or assignment — status is disclosed on each listing. Publicly marketed listings are submitted to the MLS within one business day per the NAR Clear Cooperation Policy. Real estate investing carries substantial risk including loss of principal; no representation of profit, ARV, cap rate, cash flow, or appreciation is made. We support the Federal Fair Housing Act, the California Fair Employment and Housing Act, and the Unruh Civil Rights Act.
            </p>
          </div>
        )}

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/60">
          <p>© {year} {companyName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            <Link href="/terms" className="hover:text-white">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/disclosures" className="hover:text-white">Disclosures</Link>
            <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
            <Link href="/do-not-sell" className="hover:text-white font-semibold text-accent">Do Not Sell or Share My Personal Info</Link>
            <a href="/sitemap.xml" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
