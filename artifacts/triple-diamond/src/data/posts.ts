export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "handyman-special-checklist",
    title: "The Handyman Special Checklist: What to Look For Before You Write the Offer",
    excerpt: "Not every fixer is a diamond. Here's the buyer's checklist for separating real opportunity from money pits.",
    date: "2025-09-12",
    readTime: "7 min read",
    category: "Fixer-Uppers",
    body: [
      "A true handyman special isn't just a cheap house. It's a property where the cost to cure the problems is significantly less than the value those repairs create. In high-land-value markets, this math swings dramatically in the buyer's favor — if you know what you're looking at.",
      "Start with the bones. Foundation, roof, electrical, plumbing, and HVAC. These are the five systems that turn a fixer into a money pit overnight. Get a contractor walk-through before you remove inspection contingencies.",
      "Pull permits before you write. Many municipalities are aggressive about unpermitted additions, garage conversions, and ADU work. An unpermitted bedroom isn't a bedroom — it's a lawsuit waiting for the next buyer.",
      "Check the comps — but check them honestly. A $700k ARV based on a single outlier sale is fiction. Use 3–5 closed comps within the last 90 days, within a quarter-mile, with similar bed/bath/square-footage.",
      "Finally, verify occupancy. A tenanted distressed property is a different animal than a vacant one — local rent control, just-cause eviction, and relocation payments can swing your numbers by tens of thousands.",
    ],
  },
  {
    slug: "off-market-sourcing-playbook",
    title: "How We Find Off-Market Deals Before They Hit the MLS",
    excerpt: "From direct mail to predictive AI scoring, here's how Triple Diamond Realty surfaces off-market deals weeks before the public sees them.",
    date: "2025-09-05",
    readTime: "9 min read",
    category: "Off-Market",
    body: [
      "Off-market sourcing isn't one thing. It's a portfolio of overlapping signal sources, each catching a different type of motivated seller.",
      "Direct seller outreach. We mail and call homeowners in specific zip codes who match distress profiles — long ownership, absentee, tax-delinquent, code-violation, probate, divorce.",
      "Wholesaler networks. We maintain working relationships with the top wholesalers in every major metro we cover, getting first-look on assignable contracts before they're blasted to a buyers list.",
      "Predictive AI scoring. Our proprietary platform ingests public records, MLS withdrawals, mortgage data, and behavioral signals to score every property in our coverage area on likelihood-to-sell-soon.",
      "Probate and trust pipelines. We monitor probate filings across counties we cover and reach out to executors before they call a retail agent.",
      "The result: a constant flow of inventory that retail buyers and most agents will never see. Some of it is great; some of it isn't. We screen for the great ones.",
    ],
  },
  {
    slug: "brrrr-guide",
    title: "BRRRR Step-by-Step: A Guide for Cash-Flow Investors",
    excerpt: "The Buy-Rehab-Rent-Refinance-Repeat strategy applied to high-priced, high-rent markets.",
    date: "2025-08-22",
    readTime: "12 min read",
    category: "Rentals",
    body: [
      "BRRRR works in expensive coastal markets, but it works differently than in cheap Midwest markets. The math depends on forcing appreciation through rehab, then refinancing into long-term debt at the new, higher value.",
      "Step 1 — Buy: distressed, undermarket, ideally off-market. Targeting 70–75% of post-rehab ARV minus rehab cost.",
      "Step 2 — Rehab: scope to the rent comp, not the sale comp. Over-improving destroys cash-on-cash.",
      "Step 3 — Rent: tenant law in some states is landlord-unfriendly. Screen aggressively, document everything, use a jurisdiction-compliant lease.",
      "Step 4 — Refinance: most BRRRR investors use DSCR loans, which underwrite to the property's debt-service coverage rather than the borrower's W-2 income. Expect 75% LTV on the new appraisal.",
      "Step 5 — Repeat: recycle as much of your initial capital as the refi allows, and stack the next deal. Most BRRRR investors target 1 deal per quarter as a sustainable pace.",
    ],
  },
  {
    slug: "foreclosure-vs-reo-vs-short-sale",
    title: "Foreclosure vs. Pre-Foreclosure vs. REO vs. Short Sale: A Buyer's Guide",
    excerpt: "The four flavors of distressed property, what they actually mean, and which one is right for your strategy.",
    date: "2025-08-08",
    readTime: "10 min read",
    category: "Distressed",
    body: [
      "Pre-foreclosure: the owner has missed payments and a Notice of Default has been recorded, but the home hasn't yet been sold at auction. Window for a discounted private sale.",
      "Short sale: the lender agrees to accept less than the loan balance. Long timelines, but inventory exists that no other channel touches.",
      "Foreclosure auction: many states use non-judicial trustee sales held on courthouse steps. Cash only, no contingencies, no inspections. Highest risk, highest potential reward.",
      "REO (Real Estate Owned): the bank now owns the property post-auction. Listed on the MLS, but often mispriced and stale — opportunity for buyers who know how to underwrite condition risk.",
      "Each category has a different investor profile. Cash buyers dominate auction. Patient buyers win short sales. Rehab-focused buyers clean up on REOs. The right strategy depends on your capital, timeline, and risk tolerance.",
    ],
  },
  {
    slug: "1031-exchange-45-day-playbook",
    title: "The 1031 Exchange 45-Day Playbook",
    excerpt: "An investor's playbook for identifying and closing a 1031 replacement property inside the IRS deadlines.",
    date: "2025-07-19",
    readTime: "11 min read",
    category: "1031 Exchange",
    body: [
      "The clock starts the moment your relinquished property closes. You have 45 calendar days to identify, and 180 days total to close on a replacement. Miss either deadline and the deferral collapses.",
      "Days 0–10: line up your Qualified Intermediary, confirm your identification strategy (3-property, 200%, or 95% rule), and start screening inventory.",
      "Days 10–40: tour and underwrite. Triple Diamond Realty maintains a live 1031-eligible inventory of single-family rentals, small multifamily, and NNN commercial properties.",
      "Day 45: submit your formal identification list to your QI in writing. After this, you cannot change it.",
      "Days 45–180: close. Inspection, financing, title — same process as any normal real estate transaction, but with hard deadlines.",
      "The investors who win at 1031 don't start the timer empty-handed. They've already been building a shortlist for weeks before the relinquished property closes.",
    ],
  },
];
