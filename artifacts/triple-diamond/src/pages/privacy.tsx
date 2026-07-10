import LegalPage from "@/components/LegalPage";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

export default function Privacy() {
  const { companyName } = useTenantBranding();
  const cf = useTenantCustomFields();
  const phone = cf.primary_phone;
  const phoneTel = cf.primary_phone_tel;
  const privacyEmail = cf.privacy_email;
  const addressLine1 = cf.office_address_line1;
  const addressCity = cf.office_address_city;
  const addressState = cf.office_address_state;
  const addressZip = cf.office_address_zip;
  const addressCombined = [
    addressLine1,
    [addressCity, addressState, addressZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <LegalPage
      title={`Privacy Policy | ${companyName}`}
      description={`${companyName} Privacy Policy — how we collect, use, and protect personal information under the California CCPA/CPRA. Includes Do Not Sell and Global Privacy Control.`}
      path="/privacy"
      heading="Privacy Policy"
    >
      <p>
        {companyName} ("{companyName}," "we," "us") respects your privacy. This Policy explains how we collect, use, disclose, and protect personal information when you use our website, mobile app, deal alerts, SMS, email, or any related services ("Services"), and describes the rights of California residents under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA).
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Identifiers:</strong> name, email, phone, postal address, IP address, device ID.</li>
        <li><strong>Commercial information:</strong> properties viewed, saved, inquired about, transaction history.</li>
        <li><strong>Internet activity:</strong> browsing, search queries, clicks, pixel/cookie data, referring pages.</li>
        <li><strong>Geolocation:</strong> approximate (from IP); precise only with permission.</li>
        <li><strong>Inferences:</strong> buyer preferences, deal type, budget, market area.</li>
        <li><strong>Sensitive PI (CPRA):</strong> we do not knowingly collect government IDs, financial account numbers, precise location, or other sensitive categories through the Services. Do not submit such information through web forms; we will provide a secure channel when required for a transaction.</li>
      </ul>

      <h2>2. How We Collect</h2>
      <p>Directly from you (forms, calls, emails, SMS), automatically (cookies, pixels, server logs, analytics), and from third parties (MLS, public records, marketing partners, business affiliates).</p>

      <h2>3. How We Use Your Information</h2>
      <p>To deliver Services, send deal alerts, respond to inquiries, facilitate transactions, market new properties and services, perform analytics, prevent fraud, comply with California real estate and tax laws, and enforce our Terms.</p>

      <h2 id="cookies">4. Cookies, Pixels, and Analytics</h2>
      <p>We use Google Analytics, Google Tag Manager, Meta Pixel, and similar tools to measure traffic, optimize the Services, and enable interest-based advertising. You may disable cookies in your browser; some features may not work. Opt out of interest-based ads at <a href="https://aboutads.info/choices" target="_blank" rel="noopener noreferrer">aboutads.info/choices</a> and <a href="https://networkadvertising.org/choices" target="_blank" rel="noopener noreferrer">networkadvertising.org/choices</a>.</p>

      <h2>5. Disclosure of Information</h2>
      <p>We share personal information with (a) service providers (CRM, email, SMS, analytics, cloud hosting), (b) MLS and cooperating brokerages for transaction purposes, (c) affiliates and joint-marketing partners (with proper disclosures), (d) lenders, title, and escrow companies you choose, (e) governmental or regulatory authorities when legally required, and (f) successors in a merger or asset sale.</p>

      <h2>6. RESPA Affiliated Business Arrangement (AfBA) Disclosure</h2>
      <p>If {companyName} refers you to an affiliated title, escrow, lender, or other settlement service provider in which we have an ownership interest, you will receive a written AfBA Disclosure at or before the referral as required by RESPA. You are not required to use any referred provider.</p>

      <h2>7. California Residents — CCPA / CPRA Rights</h2>
      <p>Subject to verification, California residents have the right to:</p>
      <ul>
        <li><strong>Know</strong> what personal information we collect, use, disclose, and sell/share.</li>
        <li><strong>Delete</strong> personal information we hold about you (with limited statutory exceptions).</li>
        <li><strong>Correct</strong> inaccurate personal information.</li>
        <li><strong>Opt-Out of Sale or Sharing</strong> of personal information for cross-context behavioral advertising. We respect the Global Privacy Control (GPC) signal.</li>
        <li><strong>Limit Use of Sensitive Personal Information</strong> (we minimize collection).</li>
        <li><strong>Non-Discrimination</strong> for exercising these rights.</li>
        <li><strong>Designate an Authorized Agent</strong> to act on your behalf.</li>
      </ul>
      <p>To exercise CCPA/CPRA rights:
        {privacyEmail ? (<> email <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>,</>) : null}
        {phone && phoneTel ? (<> call <a href={`tel:${phoneTel}`}>{phone}</a>,</>) : null}
        {" "}or use the <a href="/do-not-sell">Do Not Sell or Share My Personal Information</a> link in the site footer. We will verify your identity and respond within 45 days (extendable by 45 days as permitted).</p>

      <h2>8. Data Retention</h2>
      <p>We retain personal information only as long as necessary to provide Services, comply with California real estate record-keeping (DRE requires brokerage transaction records for 3 years per Bus. &amp; Prof. Code §10148), tax law, and other legal obligations.</p>

      <h2>9. Data Security</h2>
      <p>We use reasonable administrative, technical, and physical safeguards including encryption in transit, access controls, and vendor due diligence. No system is 100% secure.</p>

      <h2>10. Children's Privacy</h2>
      <p>The Services are not directed to children under 18. We do not knowingly collect personal information from minors. If you believe we have, contact
        {privacyEmail ? (<> <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a></>) : <> us</>}.
      </p>

      <h2>11. Do Not Track</h2>
      <p>Our Services do not currently respond to browser Do-Not-Track signals but DO honor the Global Privacy Control signal as required by CPRA.</p>

      <h2>12. Third-Party Links</h2>
      <p>Our site may link to third-party services governed by their own privacy policies. We are not responsible for those practices.</p>

      <h2>13. Changes to This Policy</h2>
      <p>We will post material changes here with an updated date.</p>

      <h2>14. Contact</h2>
      <p>
        {companyName} — Privacy Officer
        {addressCombined ? `, ${addressCombined}` : ""}
        {phone ? `, ${phone}` : ""}
        {privacyEmail ? (<>, <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a></>) : null}
        .
      </p>
    </LegalPage>
  );
}
