import { Helmet } from "react-helmet-async";

type FaqItem = { q: string; a: string };

interface Props {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  faq?: FaqItem[];
}

const SITE_URL = "https://tripledimondrealty.com";

export default function SeoHead({ title, description, keywords, path = "/", faq }: Props) {
  const url = `${SITE_URL}${path}`;
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
