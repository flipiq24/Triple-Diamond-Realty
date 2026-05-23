export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  variant: "a" | "b" | "c" | "d" | "e";
  variantHref: string;
  readMinutes: number;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "diamond-in-the-rough-handyman",
    title: "Diamond in the Rough: How to Spot a Handyman Special That's Actually Worth Buying",
    excerpt: "Not every fixer is a diamond. Here's the California buyer's checklist for separating real opportunity from money pits.",
    variant: "a",
    variantHref: "/a",
    readMinutes: 9,
    body: [
      "A true handyman special isn't just a cheap house. It's a property where the cost to cure the problems is significantly less than the value those repairs create. In California, where land is the lion's share of value, this math swings dramatically in the buyer's favor — if you know what you're looking at.",
      "Start with the bones: foundation, roof, electrical service, main sewer line, and major plumbing. Cosmetic issues are cheap. Structural issues are not. A $40,000 foundation surprise will end your flip before you start.",
      "Pull permits before you write. California cities are aggressive about unpermitted additions, garage conversions, and ADU work. An unpermitted bedroom isn't a bedroom — it's a lawsuit waiting for the next buyer.",
      "Run real comps on the as-repaired condition, not the current condition. ARV (After Repair Value) drives your offer. Subtract rehab, holding costs, transaction costs, and your target profit. The remainder is your maximum allowable offer.",
      "Finally, verify occupancy. A tenanted distressed property in California is a different animal than a vacant one — local rent control, just-cause eviction, and relocation payments can swing your numbers by tens of thousands.",
    ],
  },
  {
    slug: "off-market-7-ways",
    title: "Off-Market Real Estate: The 7 Ways We Find Deals Before They Hit Zillow",
    excerpt: "From direct mail to predictive AI scoring, here's how Triple Diamond Realty surfaces California off-market deals weeks before the public sees them.",
    variant: "b",
    variantHref: "/b",
    readMinutes: 8,
    body: [
      "Direct seller outreach. We mail and call homeowners in specific California zip codes who match distress profiles — long ownership, absentee, tax-delinquent, code-violation, probate, divorce.",
      "Wholesaler networks. We maintain working relationships with the top wholesalers in every major California metro, getting first-look on assignable contracts before they're blasted to a buyers list.",
      "Pocket listings. Investor-friendly agents bring us their off-MLS inventory because they know we close. The NAR Clear Cooperation Policy limits this — but the window between sourcing and MLS is where the deals live.",
      "Predictive AI scoring. Our technology ingests MLS, county records, tax data, and behavioral signals, scoring properties for likelihood of distressed sale 60–90 days before listing.",
      "Probate and trust pipelines. We monitor probate filings across California counties and reach out to executors before they call a retail agent.",
      "Code enforcement leads. Properties with open violations are often owned by tired landlords ready to sell at a discount.",
      "Bank and trustee relationships. REO inventory and trustee sale opportunities come to us before they go to the broader market.",
    ],
  },
  {
    slug: "brrrr-california-guide",
    title: "BRRRR in California: A Step-by-Step Guide for Cash-Flow Investors",
    excerpt: "The Buy-Rehab-Rent-Refinance-Repeat strategy applied to California's high-priced, high-rent markets.",
    variant: "c",
    variantHref: "/c",
    readMinutes: 11,
    body: [
      "BRRRR works in California, but it works differently than in cheap Midwest markets. The math depends on forcing appreciation through rehab, then refinancing into long-term debt at the new, higher value.",
      "Step 1 — Buy: target distressed properties at 65–75% of ARV minus rehab. Inland Empire, Central Valley, and parts of Sacramento offer the best entry numbers.",
      "Step 2 — Rehab: focus on the items that drive appraised value (kitchens, baths, flooring, exterior) and that survive a one-year tenant cycle.",
      "Step 3 — Rent: California tenant law is landlord-unfriendly. Screen aggressively, document everything, use a California-compliant lease.",
      "Step 4 — Refinance: most lenders require 6–12 months of seasoning before they'll lend on the new appraised value. Plan your cash accordingly.",
      "Step 5 — Repeat: pull the maximum cash out, redeploy into the next deal. Done right, a $100K seed can build a 5-property portfolio in 3–5 years.",
    ],
  },
  {
    slug: "foreclosure-vs-reo-vs-short-sale",
    title: "Foreclosure vs. Pre-Foreclosure vs. REO vs. Short Sale: California Buyer's Guide",
    excerpt: "The four flavors of California distressed property, what they actually mean, and which one is right for your strategy.",
    variant: "d",
    variantHref: "/d",
    readMinutes: 10,
    body: [
      "Pre-foreclosure: the homeowner has received a Notice of Default but still owns the property. You can negotiate directly. Financing typically still works.",
      "Short sale: the lender agrees to accept less than the loan balance to avoid foreclosure. Long timelines (3–6 months), but financing-friendly.",
      "Foreclosure auction: California uses non-judicial trustee sales held on courthouse steps. Cash only, no contingencies, no inspections. Highest risk, highest potential reward.",
      "REO (Real Estate Owned): the bank has already foreclosed and now owns the property. Listed through asset managers, accepts financing, usually AS-IS but with title cleared.",
      "Each path has a different risk profile, capital requirement, and timeline. Picking the wrong one for your situation is how investors lose money.",
    ],
  },
  {
    slug: "1031-replacement-45-days",
    title: "1031 Exchange Replacement Property: Beat the 45-Day Clock",
    excerpt: "A California investor's playbook for identifying and closing a 1031 replacement property inside the IRS deadlines.",
    variant: "e",
    variantHref: "/e",
    readMinutes: 9,
    body: [
      "Day 0: your relinquished property closes. The 45-day identification clock and the 180-day exchange clock both start.",
      "Days 1–10: assemble your buy box (price, geography, asset class, financing). Engage your Qualified Intermediary if you haven't already.",
      "Days 10–40: tour and underwrite. Triple Diamond Realty maintains a live 1031-eligible inventory of single-family rentals, small multifamily, and NNN commercial across California.",
      "Day 45: written identification of up to three properties (200% rule or 95% rule as alternates) delivered to your QI. Miss this and the exchange fails.",
      "Days 45–180: close on one or more of the identified properties. Funds flow through the QI — never your bank account.",
      "Triple Diamond Realty is not a tax advisor. Always consult your CPA and Qualified Intermediary before executing a 1031 exchange.",
    ],
  },
];

export const findPost = (slug?: string) => posts.find((p) => p.slug === slug);
