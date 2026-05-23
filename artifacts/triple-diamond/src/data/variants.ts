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

export const variants: Record<"a" | "b" | "c" | "d" | "e" | "f", VariantConfig> = {
  a: {
    slug: "a",
    path: "/fixer-uppers",
    pill: "Fixer-Uppers • Handyman Specials",
    h1Lead: "Fixer-Uppers &",
    h1Accent: "Handyman Specials",
    subHeadline: "Homes with real upside.",
    subCopy:
      "Delivered to your inbox based on your buying criteria. Off-market and MLS fixers — real comps, real ARV, real margin.",
    meta: {
      title: "Fixer-Upper & Handyman Special Listings | Triple Diamond Realty",
      description:
        "Off-market and MLS fixer-uppers. Real comps, real ARV, real margin.",
      keywords:
        "fixer upper, handyman special, fixer upper homes for sale, rehab properties, as-is homes, value-add properties, distressed homes",
    },
    faq: [
      { q: "What is a handyman special?", a: "A residential property sold as-is, typically priced below comparable updated homes because it needs cosmetic, mechanical, or structural repair work." },
      { q: "How do I finance a fixer upper?", a: "Common options include hard-money loans, FHA 203(k) renovation loans for owner-occupants, Fannie Mae HomeStyle loans, conventional financing with a separate construction line, and all-cash. We can introduce you to vetted lenders." },
      { q: "What's the difference between a fixer upper and a handyman special?", a: "A fixer upper generally needs primarily cosmetic updating. A handyman special often involves more substantial repairs to systems or structure. Each listing's condition is disclosed in the listing notes." },
      { q: "Can I buy a fixer upper with an FHA 203(k) loan?", a: "Yes, the FHA 203(k) program is generally available to owner-occupants for eligible properties. The loan combines purchase price and renovation budget into a single mortgage." },
      { q: "How do you find fixer-uppers before they hit the MLS?", a: "Through 30 years of direct-seller relationships, wholesaler networks, probate and distressed-property data, and proprietary off-market sourcing." },
    ],
  },
  b: {
    slug: "b",
    path: "/off-market-deals",
    pill: "Off-Market • Pre-Market • Pocket Listings",
    h1Lead: "Off-Market",
    h1Accent: "Investment Properties",
    subHeadline: "Pocket listings and pre-market deals.",
    subCopy:
      "Sourced direct, before they hit the MLS. Exclusive off-market investment properties — direct-to-seller pipeline, no bidding wars.",
    meta: {
      title: "Off-Market Real Estate Deals | Triple Diamond Realty",
      description:
        "Exclusive off-market investment properties. Direct-to-seller pipeline, no bidding wars.",
      keywords:
        "off market deals, off market properties, pocket listings, pre-market listings, off MLS properties, wholesale real estate, investor friendly agent",
    },
    faq: [
      { q: "What does \"off-market\" mean?", a: "An off-market property is one offered for sale but not actively listed on the MLS or public portals like Zillow or Redfin at the time of marketing." },
      { q: "How do you find off-market properties?", a: "Direct-seller outreach, wholesaler relationships, probate and divorce records, agent networks, and proprietary off-market sourcing software built over 30 years." },
      { q: "What is an investor-friendly agent?", a: "An agent experienced working with real estate investors — understands ARV, cap rate, cash-on-cash return, BRRRR, and rehab budgets, and writes contracts that protect investor buyers." },
      { q: "Are off-market deals always better than MLS deals?", a: "Not always. Off-market deals usually have less competition and more negotiation room, but we surface both. Compare each opportunity on its own numbers." },
      { q: "Are off-market listings published to the MLS?", a: "Publicly marketed listings are submitted to the MLS within one business day per the NAR Clear Cooperation Policy. Office-exclusive arrangements are disclosed individually." },
    ],
  },
  c: {
    slug: "c",
    path: "/cash-flow-rentals",
    pill: "Cash-Flow Rentals • BRRRR",
    h1Lead: "Cash-Flow Rentals &",
    h1Accent: "BRRRR Deals",
    subHeadline: "Buy-and-hold properties with the numbers that work.",
    subCopy:
      "Cap rate, rent, and refi-ready ARV on every listing. Rental properties built for cash flow and BRRRR — real rents, real cap rates, real ARV.",
    meta: {
      title: "BRRRR & Cash-Flow Rental Properties | Triple Diamond Realty",
      description:
        "Rental properties built for cash flow and BRRRR. Real rents, real cap rates, real ARV.",
      keywords:
        "BRRRR properties, cash flow rental property, turnkey rental, buy and hold investment, positive cash flow real estate, single family rental, rental property with tenant",
    },
    faq: [
      { q: "What is the BRRRR method?", a: "Buy, Rehab, Rent, Refinance, Repeat. You buy a distressed property under market, renovate to force appreciation, rent it to a qualified tenant, refinance into long-term debt at the new value, and repeat with recycled capital." },
      { q: "How do you calculate cash flow on a rental?", a: "Gross rent minus PITI, property management, vacancy reserve, maintenance, capex, HOA, and owner-paid utilities. Listing figures are seller- or public-record sourced — verify independently." },
      { q: "What's a typical cap rate?", a: "Cap rates vary by submarket and asset class. Dense coastal metros typically run lower; inland and secondary markets typically run higher. Any cap-rate figure on a listing is calculated from seller-provided income and expenses." },
      { q: "Can I buy a turnkey rental with a tenant in place?", a: "Yes. Tenant-occupied listings include disclosed lease terms, deposits, and rent history. Buyers must comply with all applicable landlord-tenant laws." },
      { q: "How do you underwrite a rental property?", a: "Live rent comps, expenses verified against tax records and HOA documents, realistic vacancy and capex reserves, and financing stress tests. You get an underwriting sheet with every deal." },
    ],
  },
  d: {
    slug: "d",
    path: "/wholesale-deals",
    pill: "Wholesale • Assignment Contracts",
    h1Lead: "Wholesale &",
    h1Accent: "Assignable Contracts",
    subHeadline: "Assignable deals direct from our pipeline.",
    subCopy:
      "Locked up, priced for margin, ready to move. Assignable wholesale contracts — locked-up deals with margin built in.",
    meta: {
      title: "Wholesale Real Estate & Assignment Contracts | Triple Diamond Realty",
      description:
        "Assignable wholesale contracts. Locked-up deals with margin built in.",
      keywords:
        "wholesale real estate, wholesale properties, assignment contracts, assignable contracts, real estate wholesalers, off market wholesale deals, cash buyer deals",
    },
    faq: [
      { q: "What is an assignment contract?", a: "An assignment is a real estate contract in which the original buyer (assignor) transfers their right to purchase a property to another buyer (assignee) for a fee, before closing." },
      { q: "Do you disclose your equitable interest?", a: "Yes. When Triple Diamond Realty or an affiliate holds an equitable interest or assignment, that status is disclosed on the listing. We comply with all applicable state and federal real estate disclosure requirements." },
      { q: "Are wholesale assignments legal?", a: "Assignment of real estate contracts is generally legal when properly disclosed and structured. State-specific rules apply; certain jurisdictions impose additional disclosure requirements on quick resales of residential property." },
      { q: "Who is an assignment deal best for?", a: "Cash buyers and hard-money pre-approved investors who can close quickly and take properties as-is. Assignment fees are paid at closing in addition to the contract price." },
      { q: "How fast can I close an assignment?", a: "Most assignments close in 7 to 21 days depending on funding source, title, and any contingencies in the original contract." },
    ],
  },
  e: {
    slug: "e",
    path: "/1031-exchange",
    pill: "1031 Exchange • Identification Ready",
    h1Lead: "1031 Exchange",
    h1Accent: "Replacement Properties",
    subHeadline: "Identification-ready inventory.",
    subCopy:
      "Close on your timeline. Defer your gain. Pre-vetted 1031 replacement inventory — close on your 45/180-day timeline.",
    meta: {
      title: "1031 Exchange Replacement Properties | Triple Diamond Realty",
      description:
        "Pre-vetted 1031 replacement inventory. Close on your 45/180-day timeline.",
      keywords:
        "1031 exchange properties, 1031 replacement property, like-kind exchange, 1031 eligible, NNN 1031, DST 1031 alternatives",
    },
    disclaimer:
      "Triple Diamond Realty is a licensed real estate brokerage and does not provide tax, legal, or accounting advice. Confirm 1031 eligibility and timelines with your CPA and Qualified Intermediary.",
    faq: [
      { q: "What is a 1031 exchange?", a: "A 1031 exchange (IRC §1031) allows investors to defer capital gains tax by exchanging one investment property for another like-kind investment property within IRS deadlines." },
      { q: "How does the 45-day identification rule work?", a: "From the close of the relinquished property, the taxpayer has 45 calendar days to formally identify replacement property in writing to the Qualified Intermediary, and 180 days total to close." },
      { q: "What properties qualify as 1031 replacement?", a: "Real property held for investment or productive use in a trade or business — single-family rentals, multifamily, commercial, NNN, land, and DST interests can qualify. Primary residences and flips generally do not." },
      { q: "Can I do a 1031 into a single-family rental?", a: "Yes. SFR rentals held for investment are one of the most common 1031 replacement choices. We maintain a live shortlist of SFRs ready to clear identification." },
      { q: "Do I need a Qualified Intermediary?", a: "Yes. The taxpayer cannot take constructive receipt of sale proceeds — they must flow through a Qualified Intermediary. We work with established QIs and can refer one." },
    ],
  },
  f: {
    slug: "f",
    path: "/focus",
    pill: "Focus List • Hand-Picked Weekly",
    h1Lead: "The Focus List —",
    h1Accent: "Our Best Deals This Week",
    subHeadline: "A short list. Hand-picked. Highest margin, lowest friction.",
    subCopy:
      "Every Monday we publish a tight Focus List of the strongest deals across our pipeline — fixers, off-market, cash-flow, wholesale, and 1031-ready inventory — ranked by margin, condition, and speed-to-close. No noise. Just the deals worth your time.",
    meta: {
      title: "The Focus List — Best Off-Market Deals This Week | Triple Diamond Realty",
      description:
        "Our weekly Focus List — hand-picked, ranked, and underwritten. The strongest off-market and fixer deals in California this week.",
      keywords:
        "best real estate deals, weekly deal list, hand picked investment properties, top off market deals, focus list, hot deals real estate, investor deal of the week",
    },
    faq: [
      { q: "What is the Focus List?", a: "A hand-picked, weekly shortlist of the strongest deals across our entire pipeline — typically 5 to 12 properties — ranked by margin, condition, and speed-to-close." },
      { q: "How often is the Focus List updated?", a: "Every Monday morning. Properties stay on the list until they're under contract or pulled — most clear within 7 days." },
      { q: "How do you pick what makes the Focus List?", a: "Each prospective deal is scored on margin (price vs. ARV or rent), condition risk, title and disclosure cleanliness, and how fast a vetted buyer could close. Only the top of the pipeline makes the list." },
      { q: "Can I get the Focus List by email?", a: "Yes. Verified buyers receive the Focus List every Monday at 6 a.m. PT, plus a 'just added' alert any time a new property is promoted to the list mid-week." },
      { q: "Do you charge for access to the Focus List?", a: "No. Access is free for verified buyers. We're compensated at closing per standard California brokerage agreements." },
    ],
  },
};
