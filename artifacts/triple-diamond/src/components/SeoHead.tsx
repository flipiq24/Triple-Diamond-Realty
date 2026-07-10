import { Helmet } from "react-helmet-async";
import { useTenantCustomField } from "@/hooks/useTenantCustomField";

type FaqItem = { q: string; a: string };

interface Props {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  faq?: FaqItem[];
}

export default function SeoHead({ title, description, keywords, path = "/", faq }: Props) {
  // Prefer the tenant-configured company_url so each brokerage owns their
  // own canonical + og:url. Fall back to whatever origin the buyer site is
  // being served from — never to a hardcoded Triple Diamond domain
  // (previously did, which was silently torpedoing tenant SEO by pointing
  // every deployment's canonical at tripledimondrealty.com).
  const configuredUrl = useTenantCustomField("company_url").trim();
  const runtimeOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const siteUrl = (configuredUrl || runtimeOrigin).replace(/\/$/, "");
  const url = `${siteUrl}${path}`;

  const faqLd = faq && faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
    </Helmet>
  );
}
