export type VariantConfig = {
  slug: string;
  path: string;
  pill?: string;
  h1Lead: string;
  h1Accent: string;
  subHeadline: string;
  subCopy: string;
  meta: { title: string; description: string; keywords: string };
  faq: { q: string; a: string }[];
  disclaimer?: string;
};

const baseDisclaimer =
  "All property information provided by sellers, public records, or third parties and deemed reliable but not guaranteed. Properties offered AS-IS, WHERE-IS. No representation is made regarding investment performance, profit, ARV, rent, cap rate, or appreciation. Buyers should independently verify all information and consult their own legal, tax, and financial advisors.";

export const variants: Record<"a" | "b" | "c" | "d" | "e", VariantConfig> = {
  a: {
    slug: "a",
    path: "/a",
    h1Lead: "Fixer-Upper &",
    h1Accent: "Handyman Special Listings",
    subHeadline: "Residential properties sold as-is.",
    subCopy:
      "Browse residential properties marketed as fixer-uppers or handyman specials — homes sold AS-IS that may need cosmetic, mechanical, or structural repair. Each listing discloses the seller's condition notes, asking price, and listing status (MLS, off-market, or held by Triple Diamond or an affiliate).",
    meta: {
      title: "Handyman Specials & Fixer Upper Homes in California | Triple Diamond Realty",
      description:
        "Browse handyman special and fixer-upper home listings in California. Each property is offered as-is with seller-disclosed condition notes and listing status.",
      keywords:
        "handyman special, fixer upper, fixer upper homes for sale, california fixer upper, rehab properties, as-is homes, value-add properties",
    },
    disclaimer: baseDisclaimer,
    faq: [
      { q: "What is a handyman special?", a: "A handyman special is a residential property sold as-is, typically priced below comparable updated homes because it needs cosmetic, mechanical, or structural repair work." },
      { q: "What financing options exist for a fixer upper in California?", a: "Common options include hard-money loans, FHA 203(k) renovation loans for owner-occupants, Fannie Mae HomeStyle loans, conventional financing with a separate construction line, and all-cash. Eligibility, rates, and terms vary by lender and borrower. Consult a licensed mortgage professional." },
      { q: "What's the difference between a fixer upper and a handyman special?", a: "Terminology varies by seller and listing agent. Generally, a fixer upper needs primarily cosmetic updating, while a handyman special often involves more substantial repairs to systems or structure. Review each individual listing's condition disclosures." },
      { q: "Can I buy a fixer upper with an FHA 203(k) loan?", a: "The FHA 203(k) program is generally available to owner-occupant borrowers for eligible properties. Loan approval and property eligibility are determined by the lender and FHA underwriting guidelines." },
      { q: "How are properties sourced before public listing?", a: "We source through direct-seller outreach, wholesaler relationships, public records (probate, distressed-property filings), and proprietary off-market sourcing tools. Availability of pre-listing inventory is not guaranteed at any given time." },
    ],
  },
  b: {
    slug: "b",
    path: "/b",
    pill: "Off-Market & Pre-Market Listings",
    h1Lead: "Off-Market &",
    h1Accent: "Pre-Market Listings",
    subHeadline: "Properties not currently advertised on the MLS or major portals.",
    subCopy:
      "Browse properties marketed off-market, pre-market, or via assignment. Each listing clearly discloses its status — off-market, pre-market, active MLS, or held by Triple Diamond or an affiliate via equitable interest. Publicly marketed listings are submitted to the MLS within one business day per the NAR Clear Cooperation Policy.",
    meta: {
      title: "Off-Market Investment Properties in California | Triple Diamond Realty",
      description:
        "Browse off-market and pre-market property listings in California. Listing status, seller disclosures, and pricing shown on every property.",
      keywords:
        "off market properties, off market deals california, investor friendly agent, pre-market listings, off MLS properties, wholesale real estate",
    },
    disclaimer: baseDisclaimer,
    faq: [
      { q: "What does \"off-market\" mean?", a: "An off-market property is one offered for sale but not actively listed on the MLS or public portals such as Zillow or Redfin at the time of marketing." },
      { q: "How are off-market properties sourced?", a: "We source through direct-seller outreach, wholesaler relationships, public records, agent referrals, and proprietary sourcing tools. Inventory availability changes daily." },
      { q: "What is an investor-friendly agent?", a: "A general industry term for an agent experienced working with real estate investor clients. The agent's actual experience, license status, and scope of services should be verified directly." },
      { q: "Are off-market deals always priced below MLS deals?", a: "No. Pricing depends on seller motivation, property condition, and market conditions. Off-market does not by itself imply a discount." },
      { q: "Are off-market listings published to the MLS?", a: "Publicly marketed listings are submitted to the MLS within one business day in compliance with the NAR Clear Cooperation Policy. Some listings are exempt from publication (for example, certain office-exclusive or seller-restricted arrangements) and are disclosed individually." },
    ],
  },
  c: {
    slug: "c",
    path: "/c",
    pill: "Rental & Buy-and-Hold Listings",
    h1Lead: "Rental &",
    h1Accent: "Buy-and-Hold Listings",
    subHeadline: "Residential properties marketed for long-term hold.",
    subCopy:
      "Browse single-family and small multifamily listings marketed for buy-and-hold investors. Where available, listings include seller-provided rent figures, lease status, and operating information. All financial information is provided by the seller or public records and must be independently verified. No representation is made regarding future rent, occupancy, cash flow, or appreciation.",
    meta: {
      title: "Rental & BRRRR Property Listings California | Triple Diamond Realty",
      description:
        "Browse residential rental and buy-and-hold property listings in California. Seller-disclosed rent and lease status shown where available.",
      keywords:
        "rental property california, BRRRR property, buy and hold investment, single family rental, rental property with tenant",
    },
    disclaimer: baseDisclaimer,
    faq: [
      { q: "What is the BRRRR method?", a: "BRRRR is an industry term describing a strategy of Buy, Rehab, Rent, Refinance, Repeat. It is a strategy framework, not a guarantee of results. Outcomes depend on market conditions, financing, execution, and other factors." },
      { q: "How is cash flow calculated on a rental property?", a: "A standard calculation is gross monthly rent minus principal, interest, taxes, insurance, HOA, management, vacancy, maintenance, capex reserves, and any owner-paid utilities. Figures shown on any listing are estimates based on seller or public data and should be independently verified." },
      { q: "What are typical cap rates in California?", a: "Cap rates vary widely by submarket, asset class, and condition. Any cap-rate figure shown on a listing is calculated from seller-provided income and expense information and is not a projection of future returns." },
      { q: "Can I purchase a rental with a tenant already in place?", a: "Some listings are tenant-occupied. Where applicable, lease terms, deposits, and rent history are disclosed in the listing materials. Buyers are responsible for reviewing lease documents and complying with all applicable landlord-tenant laws." },
      { q: "How is rental property information underwritten?", a: "Listing data is compiled from seller disclosures, public records, and market comparables. Triple Diamond Realty does not warrant the accuracy of seller-supplied figures and recommends independent verification by the buyer's professionals." },
    ],
  },
  d: {
    slug: "d",
    path: "/d",
    pill: "Foreclosure • REO • Pre-Foreclosure • Short Sale",
    h1Lead: "Foreclosure, REO &",
    h1Accent: "Distressed Property Listings",
    subHeadline: "Bank-owned, short-sale, pre-foreclosure, and trustee-sale inventory.",
    subCopy:
      "Browse distressed residential listings including REO (bank-owned), short sales, pre-foreclosures, and trustee-sale properties. Status and source data are pulled from public records and seller channels and refreshed regularly. Buyers are responsible for verifying status, title condition, and occupancy.",
    meta: {
      title: "Foreclosures, REO & Pre-Foreclosure Homes California | Triple Diamond Realty",
      description:
        "Browse foreclosure, REO, short-sale, and pre-foreclosure property listings in California. Status and source data shown on every listing.",
      keywords:
        "foreclosure homes california, pre-foreclosure, bank owned homes, REO properties, short sale homes, distressed properties california, auction homes",
    },
    disclaimer: baseDisclaimer,
    faq: [
      { q: "What is the difference between REO, pre-foreclosure, and short sale?", a: "Pre-foreclosure: the owner is in default but has not yet been foreclosed upon. Short sale: the lender agrees to accept less than the outstanding loan balance. REO (Real Estate Owned): the lender has foreclosed and holds title." },
      { q: "Can foreclosure properties be purchased with financing?", a: "REO properties may be purchased with conventional, FHA, or VA financing subject to lender and property approval. Trustee-sale (courthouse-step) purchases in California generally require cashier's check at the time of sale and offer no inspection or financing contingency." },
      { q: "How do California foreclosure auctions work?", a: "California primarily uses non-judicial trustee sales. Properties are sold to the highest qualified bidder, as-is and without warranty. Buyers should review the trustee's notice, complete independent title and lien research, and consult counsel prior to bidding." },
      { q: "Are foreclosure properties always a discount?", a: "No. Condition, title issues, occupancy status, junior liens, and post-sale eviction costs can materially affect total cost. Each property must be evaluated independently." },
      { q: "How often is distressed inventory updated?", a: "Public-record notices are monitored continuously, and our internal list is refreshed at least weekly. We make no representation that any specific listing is currently available, accurately priced, or free of title or occupancy issues." },
    ],
  },
  e: {
    slug: "e",
    path: "/e",
    pill: "1031 Exchange — Replacement Property Listings",
    h1Lead: "1031 Exchange",
    h1Accent: "Replacement Property Listings",
    subHeadline: "Real property listings that may be eligible as like-kind replacement under IRC §1031.",
    subCopy:
      "Browse residential, multifamily, and commercial listings that may be considered as replacement property in a 1031 exchange. Eligibility, identification, and exchange compliance must be determined by your CPA and Qualified Intermediary. Triple Diamond Realty does not provide tax or legal advice.",
    meta: {
      title: "1031 Exchange Replacement Properties California | Triple Diamond Realty",
      description:
        "Browse California property listings that may qualify as 1031 exchange replacement property. Verify eligibility with your CPA and Qualified Intermediary.",
      keywords:
        "1031 exchange property, 1031 replacement property california, like-kind exchange, 1031 eligible",
    },
    disclaimer:
      "Triple Diamond Realty is a licensed real estate brokerage and does not provide tax, legal, or accounting advice. Section 1031 eligibility, identification deadlines, and exchange procedures must be confirmed with your CPA, attorney, and Qualified Intermediary. " + baseDisclaimer,
    faq: [
      { q: "What is a 1031 exchange?", a: "A 1031 exchange (Internal Revenue Code §1031) is a tax provision that may allow an investor to defer capital gains tax when exchanging certain investment or business-use real property for like-kind investment or business-use real property, subject to IRS rules and timelines. Consult a qualified tax advisor." },
      { q: "How does the 45-day identification rule work?", a: "Under current IRS rules, the taxpayer generally has 45 calendar days from the sale of the relinquished property to identify potential replacement property in writing to the Qualified Intermediary, and 180 days to close. Specific rules and exceptions should be reviewed with your tax advisor and QI." },
      { q: "What property types may qualify as 1031 replacement property?", a: "Real property held for productive use in a trade or business or for investment may qualify. Primary residences and property held primarily for resale generally do not. Eligibility for any specific property must be determined by your tax advisor." },
      { q: "Can I exchange into a single-family rental?", a: "Single-family residential rentals held for investment are commonly used as replacement property. Specific facts and intent matter; consult your CPA." },
      { q: "Is a Qualified Intermediary required?", a: "A 1031 exchange generally requires use of a Qualified Intermediary (QI). The taxpayer cannot take actual or constructive receipt of the sale proceeds. Triple Diamond Realty does not act as a QI." },
    ],
  },
};
