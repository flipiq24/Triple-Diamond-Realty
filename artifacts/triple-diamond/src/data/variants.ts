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

export const variants: Record<"a" | "b" | "c" | "d" | "e", VariantConfig> = {
  a: {
    slug: "a",
    path: "/a",
    h1Lead: "Find Your Next",
    h1Accent: "Handyman Special",
    subHeadline: "Diamonds in the Rough. Delivered Daily Across California.",
    subCopy:
      "Hand-picked fixers, wholesale deals, and cash-only opportunities across California. Every property is a diamond in the rough — we just found it first. New deals added daily, before they hit the MLS.",
    meta: {
      title: "Handyman Specials & Fixer Upper Homes in California | Triple Diamond Realty",
      description:
        "Find your next handyman special or fixer upper in California. Hand-picked diamonds in the rough delivered daily — before they hit the MLS. 30 years of deal-finding experience.",
      keywords:
        "handyman special, fixer upper, fixer upper homes for sale, california fixer upper, rehab properties, as-is homes, value-add properties, cheap houses california, diamond in the rough",
    },
    faq: [
      { q: "What is a handyman special?", a: "A handyman special is a residential property sold below market value because it needs cosmetic or structural repair work. They're typically priced for investors, cash buyers, or owner-occupants willing to put in sweat equity." },
      { q: "How do I finance a fixer upper in California?", a: "Common options include hard-money loans (fast, asset-based), FHA 203(k) renovation loans (for owner-occupants), Fannie Mae HomeStyle loans, conventional loans with a separate construction line, and all-cash. Triple Diamond Realty can introduce you to vetted California lenders." },
      { q: "What's the difference between a fixer upper and a handyman special?", a: "A fixer upper usually needs moderate updating (paint, flooring, kitchen, bath). A handyman special is more distressed — often requiring foundation, roof, plumbing, or major systems work. Pricing and financing options differ accordingly." },
      { q: "Can I buy a fixer upper with an FHA 203k loan?", a: "Yes, if you intend to occupy the property. The FHA 203(k) loan rolls the purchase price and the renovation budget into a single mortgage. Investors typically use hard money or HomeStyle loans instead." },
      { q: "How do you find fixer uppers before they hit the MLS?", a: "We combine 30 years of direct-seller relationships, wholesaler networks, probate and distressed-property data feeds, and AI-driven off-market sourcing technology to identify properties weeks or months before they would ever list on the MLS." },
    ],
  },
  b: {
    slug: "b",
    path: "/b",
    pill: "Off-Market Deals • Investor-Friendly Agents",
    h1Lead: "Off-Market Deals",
    h1Accent: "Before They Hit Zillow",
    subHeadline: "The Diamonds in the Rough Nobody Else Sees.",
    subCopy:
      "Connect with investor-friendly agents who source off-market and pre-market opportunities across California. Pre-screened deals, real numbers, no bidding wars. We disclose property status on every listing — off-market or active MLS.",
    meta: {
      title: "Off-Market Investment Properties in California | Investor-Friendly Agents | Triple Diamond Realty",
      description:
        "Get off-market deals in California before they hit Zillow. Investor-friendly agents, pre-market listings, exclusive investor inventory. 30 years finding diamonds in the rough.",
      keywords:
        "off market properties, off market deals california, investor friendly agent, pre-market listings, off MLS properties, wholesale real estate, exclusive investment properties",
    },
    faq: [
      { q: "What does \"off-market\" really mean?", a: "An off-market property is one that's for sale but not publicly listed on the MLS or major portals like Zillow or Redfin. Sellers may want privacy, speed, or a guaranteed cash close — and they're often willing to accept a lower price to get it." },
      { q: "How do you find off-market properties in California?", a: "We use a combination of direct mail, cold outreach, probate and divorce records, wholesaler partnerships, agent referral networks, and proprietary AI-driven distressed-property scoring to surface opportunities at scale across every California county." },
      { q: "What is an investor-friendly agent?", a: "An investor-friendly agent understands ARV, cap rate, cash-on-cash return, BRRRR strategy, and rehab budgets — and writes contracts that protect investor buyers. Most retail agents do not." },
      { q: "Are off-market deals always better than MLS deals?", a: "Not always. Off-market deals usually have less competition and more negotiation room, but MLS deals can still offer value when motivated sellers list with the wrong agent or in a slow window. We surface both." },
      { q: "Why do off-market sellers accept less than market value?", a: "Speed, certainty, and privacy. A cash buyer who can close in 7–14 days, take the property as-is, and skip the showings is often worth a 10–25% discount to a seller dealing with distress, probate, divorce, or a tired-landlord situation." },
    ],
  },
  c: {
    slug: "c",
    path: "/c",
    pill: "Cash Flow Rentals • BRRRR Ready",
    h1Lead: "Cash-Flowing Rentals",
    h1Accent: "With Day-One Income",
    subHeadline: "Rental Diamonds in the Rough — Underwritten and Ready.",
    subCopy:
      "Underwritten rental properties with rent, taxes, insurance, vacancy, and cap rate already calculated. Turnkey with tenant in place, or BRRRR-ready value-add. Stop guessing pro formas. Start collecting rent.",
    meta: {
      title: "Cash Flow Rentals & BRRRR Properties California | Turnkey Investment | Triple Diamond Realty",
      description:
        "Day-one income rentals and BRRRR-ready properties in California. Underwritten cap rates, tenant-in-place options, real numbers. 30 years finding rental diamonds in the rough.",
      keywords:
        "cash flow rental property, BRRRR property, turnkey rental california, buy and hold investment, positive cash flow real estate, single family rental, rental property with tenant",
    },
    faq: [
      { q: "What is the BRRRR method?", a: "BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat. You buy a distressed property under market, renovate to force appreciation, rent it to a qualified tenant, refinance into long-term debt at the new higher value, and repeat with the recycled capital." },
      { q: "How do you calculate cash flow on a rental property?", a: "Cash flow = monthly rent − (PITI + property management + vacancy reserve + maintenance reserve + capex reserve + HOA + utilities you cover). Our listings show this math up front." },
      { q: "What's a good cap rate in California?", a: "California cap rates vary widely by submarket. In coastal metros, 4–5% is typical. In the Inland Empire and Central Valley, 6–8% is achievable on value-add deals. We focus on the higher-cap submarkets for cash-flow buyers." },
      { q: "Can I buy a turnkey rental with a tenant already in place?", a: "Yes. Many of our rental listings come with paying tenants, signed leases, and rent rolls — so you collect rent the day you close. We disclose lease terms, deposits, and rent history on every tenant-occupied listing." },
      { q: "How do you underwrite a rental property?", a: "Our team pulls live rent comps, verifies operating expenses against tax records and HOA documents, applies realistic vacancy and capex reserves, and stress-tests financing scenarios. You get an underwriting sheet with every deal." },
    ],
  },
  d: {
    slug: "d",
    path: "/d",
    pill: "Foreclosures • REO • Pre-Foreclosure • Short Sale",
    h1Lead: "Verified Foreclosure Deals",
    h1Accent: "Not the Same Stale Lists",
    subHeadline: "Distressed Diamonds in the Rough, Verified Weekly.",
    subCopy:
      "REO bank-owned, court-step auction, short sale, and pre-foreclosure inventory updated weekly. Real properties, verified status, current pricing. Cash buyers and hard-money pre-approved investors get first look.",
    meta: {
      title: "Foreclosures, REO & Pre-Foreclosure Homes California | Triple Diamond Realty",
      description:
        "Verified California foreclosures, REO bank-owned homes, short sales, and pre-foreclosure deals updated weekly. Cash buyers get first look. 30 years finding distressed diamonds.",
      keywords:
        "foreclosure homes california, foreclosures near me, pre-foreclosure, bank owned homes, REO properties, short sale homes, distressed properties california, auction homes",
    },
    faq: [
      { q: "What's the difference between REO, pre-foreclosure, and short sale?", a: "Pre-foreclosure means the owner is behind on payments but still owns the home. A short sale is when the lender agrees to accept less than is owed. REO (Real Estate Owned) means the bank has already foreclosed and now owns the property outright." },
      { q: "Can I buy a foreclosure with financing or only cash?", a: "REO bank-owned properties typically accept conventional, FHA, or VA financing. Court-step auction purchases almost always require cash or hard money — there's no inspection or financing contingency." },
      { q: "How do California foreclosure auctions work?", a: "California uses non-judicial trustee sales held on courthouse steps. Properties are sold to the highest bidder for cashier's check, as-is, with no warranty. We help investors prep due diligence and bid strategy before the sale date." },
      { q: "Are foreclosure homes a good deal?", a: "They can be — but condition, title issues, and occupancy can erase the discount fast. Our team verifies every distressed listing for occupancy status, title clouds, and rehab scope before it hits your inbox." },
      { q: "How often is your foreclosure list updated?", a: "Weekly at minimum. Pre-foreclosure notices are pulled from county records as they're filed, and REO inventory refreshes as banks list and re-price. You'll never see a 6-month-old stale listing on our feed." },
    ],
  },
  e: {
    slug: "e",
    path: "/e",
    pill: "1031 Exchange • Identification Ready",
    h1Lead: "The Clock Is Ticking.",
    h1Accent: "We Have Your Replacement Property.",
    subHeadline: "1031-Ready Diamonds in the Rough — Identification Cleared.",
    subCopy:
      "45 days to identify. 180 days to close. We maintain a live inventory of 1031-eligible single-family rentals, small multifamily, and NNN commercial properties — pre-vetted for cash flow and clean title. We coordinate directly with your Qualified Intermediary.",
    meta: {
      title: "1031 Exchange Replacement Properties California | Identification Ready | Triple Diamond Realty",
      description:
        "Live 1031-eligible inventory in California. Close inside your 45/180 day windows. SFR, small multifamily, and NNN — pre-vetted and ready. 30 years of deal-finding power.",
      keywords:
        "1031 exchange property, 1031 replacement property california, like-kind exchange, 1031 eligible, NNN 1031, DST 1031 alternatives",
    },
    disclaimer:
      "Triple Diamond Realty is not a tax advisor. Consult your CPA and Qualified Intermediary for 1031 guidance.",
    faq: [
      { q: "What is a 1031 exchange?", a: "A 1031 exchange (named after IRC Section 1031) lets investors defer capital gains tax by exchanging one investment property for another \"like-kind\" investment property within strict deadlines." },
      { q: "How does the 45-day identification rule work?", a: "From the day you close on the sale of your relinquished property, you have 45 calendar days to formally identify up to three replacement properties (or more under the 200% or 95% rules). The list goes to your Qualified Intermediary in writing." },
      { q: "What properties qualify as 1031 replacement property?", a: "Any real property held for investment or productive use in a trade or business — single-family rentals, multifamily, commercial, NNN, land, and DST interests can all qualify. Primary residences and flips do not." },
      { q: "Can I do a 1031 into a single-family rental?", a: "Yes. SFR rentals are one of the most common 1031 replacement choices. We maintain a live shortlist of California SFRs with leases in place, ready to clear identification." },
      { q: "Do I need a Qualified Intermediary?", a: "Yes. You cannot touch the sale proceeds at any point — they must flow through a Qualified Intermediary (QI). We work with established California QIs and can refer one if you need one." },
    ],
  },
};
