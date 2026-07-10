import { Helmet } from "react-helmet-async";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

/**
 * Global JSON-LD (`<script type="application/ld+json">`) mounted once at
 * the top of the tree. Populated from Buyers Hook custom_fields so each
 * tenant's structured-data record identifies THEM to Google — previously
 * this was a static const pointing at tripledimondrealty.com for every
 * deployment, which merged all tenants' SEO signals into TDR's own domain.
 *
 * Only emits fields the tenant has actually configured. Missing keys drop
 * out of the payload rather than shipping empty strings.
 */
export default function GlobalJsonLd() {
  const { companyName, logoUrl } = useTenantBranding();
  const cf = useTenantCustomFields();

  const url = cf.company_url;
  const phone = cf.primary_phone;
  const email = cf.primary_email;
  const areaServed = cf.service_area;
  const description = cf.marketing_description;
  const slogan = cf.tagline;

  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: companyName,
  };
  if (logoUrl) payload.logo = logoUrl;
  if (url) payload.url = url;
  if (phone) payload.telephone = phone;
  if (email) payload.email = email;
  if (areaServed) payload.areaServed = areaServed;
  if (description) payload.description = description;
  if (slogan) payload.slogan = slogan;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(payload)}</script>
    </Helmet>
  );
}
