import { useEffect } from "react";

export default function Legal() {
  useEffect(() => {
    document.title = "Legal, Privacy & Disclosures | Triple Diamond Realty";
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, []);

  return (
    <div className="w-full bg-white">
      <section className="bg-primary py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Legal, Privacy &amp; Disclosures</h1>
          <p className="text-primary-foreground/80">
            Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}. This page covers Triple Diamond Realty's privacy practices, California consumer rights, real-estate disclosures, fair-housing commitment, accessibility, and terms of use.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
          <nav aria-label="On this page" className="lg:sticky lg:top-24 self-start text-sm">
            <ul className="space-y-2">
              {[
                ["privacy", "Privacy Policy"],
                ["cookies", "Cookies & Tracking"],
                ["ccpa", "California Privacy (CCPA/CPRA)"],
                ["do-not-sell", "Do Not Sell or Share"],
                ["fair-housing", "Fair Housing"],
                ["dre", "DRE License & Brokerage Info"],
                ["disclaimers", "Listing Disclaimers"],
                ["accessibility", "Accessibility"],
                ["terms", "Terms of Use"],
                ["tcpa", "Communication Consent (TCPA)"],
                ["contact", "Contact"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-primary hover:text-accent font-medium">{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="prose prose-lg max-w-none text-muted-foreground prose-headings:text-primary prose-strong:text-primary prose-a:text-accent">
            <section id="privacy">
              <h2>Privacy Policy</h2>
              <p>
                Triple Diamond Realty ("we", "us", "our") respects your privacy. This Privacy Policy explains what information we collect when you use <strong>tdrealty.net</strong> and our services, how we use it, who we share it with, and the rights you have over it.
              </p>
              <p><strong>Information we collect:</strong> contact information you submit (name, email, phone, property of interest), information automatically collected when you visit (IP address, browser type, pages viewed, referring URL, device identifiers), and cookies and similar technologies.</p>
              <p><strong>How we use it:</strong> to respond to inquiries, send property information, operate and improve the site, prevent fraud, comply with legal obligations, and — with your consent — market our services.</p>
              <p><strong>Who we share it with:</strong> service providers (hosting, analytics, email/SMS, CRM), our licensed agents, lenders or title companies as needed to advance a transaction, and regulators or law enforcement when required by law. We do <em>not</em> sell personal information for monetary consideration. Certain analytics and advertising cookies may constitute "sharing" under California law; see the CCPA section below.</p>
              <p><strong>Data retention:</strong> we keep personal information only as long as reasonably necessary for the purposes described or as required by California real estate recordkeeping rules (typically three years for transaction records).</p>
            </section>

            <section id="cookies">
              <h2>Cookies &amp; Tracking Technologies</h2>
              <p>We use cookies, pixels, local storage and similar technologies to (a) keep the site working, (b) remember preferences like your saved filters and favorites, (c) measure traffic and performance, and (d) deliver and measure marketing.</p>
              <ul>
                <li><strong>Strictly necessary</strong> — required for site functionality (cannot be disabled).</li>
                <li><strong>Functional</strong> — remember choices like saved listings.</li>
                <li><strong>Analytics</strong> — anonymous usage stats so we can improve the site.</li>
                <li><strong>Advertising</strong> — measure ad effectiveness and re-engage interested visitors.</li>
              </ul>
              <p>You can change your choice at any time using the cookie banner or by clearing your browser storage. Most browsers also let you block or delete cookies — see your browser's help pages for details.</p>
            </section>

            <section id="ccpa">
              <h2>California Privacy Rights (CCPA / CPRA)</h2>
              <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act, as amended by the California Privacy Rights Act:</p>
              <ul>
                <li><strong>Right to know</strong> what personal information we collect, use, disclose, sell or share.</li>
                <li><strong>Right to delete</strong> personal information we have collected from you.</li>
                <li><strong>Right to correct</strong> inaccurate personal information.</li>
                <li><strong>Right to opt out</strong> of the sale or sharing of personal information.</li>
                <li><strong>Right to limit</strong> the use of sensitive personal information.</li>
                <li><strong>Right to non-discrimination</strong> for exercising any of these rights.</li>
              </ul>
              <p>Categories of personal information we collect: identifiers; commercial information (properties viewed, inquiries); internet/network activity; geolocation (approximate); and inferences drawn from the above. Categories of recipients: service providers, our licensed agents, and — where applicable — advertising partners.</p>
            </section>

            <section id="do-not-sell">
              <h2>Do Not Sell or Share My Personal Information</h2>
              <p>To opt out of the sale or sharing of your personal information, or to exercise any other California privacy right, email <a href="mailto:privacy@tdrealty.net">privacy@tdrealty.net</a> with the subject line <em>"CCPA Request"</em>, or call <a href="tel:+19092804906">(909) 280-4906</a>. We will respond within 45 days as required by law. You may also designate an authorized agent to submit a request on your behalf; we may require verification.</p>
              <p>We honor the Global Privacy Control (GPC) signal as a valid opt-out of sale and sharing for the browser session in which it is received.</p>
            </section>

            <section id="fair-housing">
              <h2>Fair Housing &amp; Equal Opportunity</h2>
              <p>Triple Diamond Realty fully supports the principles of the Federal Fair Housing Act and California's Fair Employment and Housing Act. We do not discriminate against any person on the basis of race, color, religion, sex, gender identity, gender expression, sexual orientation, marital status, national origin, ancestry, familial status, source of income, disability, veteran or military status, genetic information, or any other characteristic protected by federal, state, or local law.</p>
              <p>If you believe you have been the victim of housing discrimination, you may file a complaint with the U.S. Department of Housing and Urban Development at <a href="https://www.hud.gov/fairhousing" target="_blank" rel="noopener noreferrer">hud.gov/fairhousing</a> or the California Civil Rights Department at <a href="https://calcivilrights.ca.gov" target="_blank" rel="noopener noreferrer">calcivilrights.ca.gov</a>.</p>
            </section>

            <section id="dre">
              <h2>DRE License &amp; Brokerage Information</h2>
              <p>Triple Diamond Realty is a licensed California real estate brokerage. All real estate services are provided in accordance with the California Business and Professions Code and the regulations of the California Department of Real Estate (DRE).</p>
              <p><strong>Brokerage:</strong> Triple Diamond Realty<br/>
              <strong>DRE License #:</strong> [Insert DRE License Number]<br/>
              <strong>Designated Broker:</strong> [Insert Broker Name], DRE #[Insert]<br/>
              <strong>Office:</strong> California (serving the entire state)<br/>
              <strong>Phone:</strong> (909) 280-4906 &nbsp;·&nbsp; <strong>Email:</strong> info@tdrealty.net</p>
              <p>Consumers may verify any California real estate license at <a href="https://www2.dre.ca.gov/PublicASP/pplinfo.asp" target="_blank" rel="noopener noreferrer">dre.ca.gov</a>.</p>
            </section>

            <section id="disclaimers">
              <h2>Listing Information Disclaimer</h2>
              <p>All property information on this website — including but not limited to price, square footage, lot size, bedroom and bathroom count, condition, photos, mapped location, and after-repair-value or rehab estimates — is <strong>deemed reliable but not guaranteed</strong>. Information is provided for general informational purposes only and is subject to verification by all parties.</p>
              <p>Properties marketed as "off-market", "handyman special", "fixer", "wholesale", "cash only", or "distressed" are sold strictly <strong>as-is, where-is</strong>, with no representations or warranties of any kind by Triple Diamond Realty, express or implied. Buyers are strongly encouraged to conduct independent inspections, obtain professional contractor bids, verify all permits, perform a title search, and consult their own legal, tax, and financial advisors before entering into any agreement.</p>
              <p>Estimated ARVs and rehab budgets are good-faith estimates based on available comparable sales and contractor data. They are not appraisals and should not be relied upon as such. Past performance of Triple Diamond Realty deals is not indicative of future results. Real estate investing involves substantial risk, including the possible loss of principal.</p>
              <p>Nothing on this website constitutes legal, tax, financial, or investment advice.</p>
            </section>

            <section id="accessibility">
              <h2>Accessibility Statement</h2>
              <p>Triple Diamond Realty is committed to providing a website that is accessible to the widest possible audience, in accordance with the Americans with Disabilities Act (ADA) and California's Unruh Civil Rights Act. We strive to follow the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.</p>
              <p>If you encounter an accessibility barrier on this site, please contact us at <a href="mailto:accessibility@tdrealty.net">accessibility@tdrealty.net</a> or <a href="tel:+19092804906">(909) 280-4906</a> so we can address it promptly and provide the information you need through an alternative channel.</p>
            </section>

            <section id="terms">
              <h2>Terms of Use</h2>
              <p>By using this website you agree that: (a) you are at least 18 years old; (b) you will use the site for lawful purposes only; (c) you will not scrape, copy, redistribute, or use any listing data for any commercial purpose without written permission; (d) you accept that all content is provided "as is" without warranty of any kind; and (e) to the maximum extent permitted by law, Triple Diamond Realty's total liability arising out of your use of this site is limited to one hundred U.S. dollars ($100).</p>
              <p>Any dispute arising out of or relating to your use of this site will be governed by the laws of the State of California, without regard to conflict-of-laws principles, and resolved exclusively in the state or federal courts located in California.</p>
            </section>

            <section id="tcpa">
              <h2>Communication Consent (TCPA)</h2>
              <p>By submitting a phone number through any form on this website or by texting us, you expressly consent to receive calls and text messages from Triple Diamond Realty and its agents at that number — including via automated dialing systems and pre-recorded messages — for purposes of property updates, deal notifications, and customer service. Message and data rates may apply. Consent is not a condition of any purchase. You may opt out at any time by replying STOP to any text message or by emailing <a href="mailto:info@tdrealty.net">info@tdrealty.net</a>.</p>
            </section>

            <section id="contact">
              <h2>Contact Us</h2>
              <p>For any privacy, legal, accessibility, or disclosure question, contact:</p>
              <p>
                Triple Diamond Realty<br/>
                Email: <a href="mailto:info@tdrealty.net">info@tdrealty.net</a> &nbsp;·&nbsp; Privacy: <a href="mailto:privacy@tdrealty.net">privacy@tdrealty.net</a><br/>
                Phone: <a href="tel:+19092804906">(909) 280-4906</a>
              </p>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
