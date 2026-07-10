import LegalPage from "@/components/LegalPage";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

export default function Terms() {
  const { companyName } = useTenantBranding();
  const cf = useTenantCustomFields();
  const phone = cf.primary_phone;
  const email = cf.primary_email;
  const dre = cf.dre_broker_license;
  const responsibleBroker = cf.responsible_broker_name;
  const responsibleBrokerDre = cf.responsible_broker_dre;
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
      title={`Terms of Use | ${companyName}`}
      description={`${companyName} Terms of Use — California brokerage agreement covering investor services, off-market listings, AS-IS properties, TCPA consent, arbitration, and fair housing.`}
      path="/terms"
      heading="Terms of Use"
    >
      <p>
        Welcome to {companyName} ("we," "our," or "us"). By accessing, browsing, submitting information through, or otherwise using our website, mobile application, deal alerts, SMS notifications, or any related services (collectively, the "Services"), you ("User" or "you") agree to be bound by these Terms of Use ("Terms"). If you do not agree, do not use the Services.
      </p>
      <p>You certify that you are at least 18 years of age, a California resident or otherwise authorized to transact business in California, and have legal capacity to agree to these Terms.</p>

      <h2>1. Brokerage Identity and California License Disclosure</h2>
      <p>{companyName} is a California real estate brokerage.</p>
      <ul>
        {dre && <li>California DRE Broker License #{dre}</li>}
        {responsibleBroker && (
          <li>
            Responsible Broker: {responsibleBroker}
            {responsibleBrokerDre ? `, CA DRE #${responsibleBrokerDre}` : ""}
          </li>
        )}
        {addressCombined && <li>Principal Office: {addressCombined}</li>}
        {(phone || email) && (
          <li>
            {phone ? `Phone: ${phone}` : ""}
            {phone && email ? " • " : ""}
            {email ? `Email: ${email}` : ""}
          </li>
        )}
      </ul>
      <p>The brokerage operates in compliance with California Business &amp; Professions Code §10140.6 and California Code of Regulations, Title 10, §2773. License information appears on every page of the Services.</p>

      <h2>2. No Agency Relationship Without Written Agreement</h2>
      <p>Use of the Services alone does NOT create a brokerage, agency, fiduciary, or representation relationship between {companyName} and you. A representation relationship is created only upon execution of a written agreement (e.g., a California Buyer Representation Agreement or Listing Agreement). Until then, {companyName} does not represent you, owes no fiduciary duty, and provides no advice; you are solely responsible for your own due diligence and decisions.</p>

      <h2>3. Real Estate Investment Risk Disclosure</h2>
      <p>California real estate investing carries substantial risk including loss of principal. {companyName} does NOT guarantee profit, appreciation, rental income, occupancy, cash flow, cap rate, or any specific outcome on any property displayed. Estimates such as ARV, rehab cost, cash-on-cash return, cap rate, and projected rent are unverified, broker-provided assumptions for convenience only. Past performance is not indicative of future results. Nothing on the Services constitutes legal, tax, financial, or investment advice.</p>

      <h2>4. AS-IS, WHERE-IS Property Condition</h2>
      <p>Properties offered through the Services are AS-IS, WHERE-IS, with all faults. {companyName}, its agents, employees, and affiliates make no representations or warranties regarding condition, square footage, lot dimensions, zoning, permits, ADU eligibility, code compliance, environmental hazards (including mold, asbestos, lead paint, radon, soil contamination), structural integrity, prior repairs, occupancy status, tenancy, rent rolls, title condition, encumbrances, easements, HOA assessments, or any other property characteristic. You must conduct your own independent inspection and due diligence.</p>
      <p>Where the seller has provided a California Transfer Disclosure Statement (Civil Code §1102), Natural Hazard Disclosure (Civil Code §1103), lead-based paint disclosure, Megan's Law database notice, or similar disclosures, {companyName} will deliver those documents to you. Where a seller (such as an REO bank, foreclosure trustee, or assignee of an equitable interest) is exempt from disclosure or has no knowledge of the property, no seller disclosures will be available, and the AS-IS terms above control.</p>

      <h2>5. On-Market, Off-Market, and Assignment Listings</h2>
      <p>The Services may display properties that are (a) actively listed on the California MLS, (b) off-market or pre-market opportunities, or (c) properties in which {companyName} or an affiliated investor holds an equitable, contractual, or assignment interest. Status will be disclosed on each listing. Where {companyName} or an affiliate holds an equitable interest and intends to assign or resell, that intent will be disclosed in writing prior to contract, consistent with California Business &amp; Professions Code requirements and DRE guidance. Publicly marketed listings will be submitted to the MLS within one business day in accordance with the NAR Clear Cooperation Policy.</p>

      <h2>6. Fair Housing</h2>
      <p>{companyName} fully supports the federal Fair Housing Act and the California Fair Employment and Housing Act (Gov. Code §12955). We do not discriminate based on race, color, religion, sex, gender, gender identity, gender expression, sexual orientation, marital status, national origin, ancestry, familial status, source of income (including Section 8 housing vouchers), disability, veteran or military status, genetic information, age, citizenship, primary language, or immigration status.</p>

      <h2>7. California TCPA Communications Consent</h2>
      <p>By submitting your phone number on any form within the Services, you expressly consent to receive calls and SMS/MMS messages from {companyName} and its affiliated agents, including via automated telephone dialing systems (ATDS), prerecorded or artificial-voice messages, ringless voicemail, and SMS/MMS, at the number you provided, for purposes including property alerts, deal notifications, transaction coordination, customer service, and marketing. Your consent is NOT a condition of obtaining any Services. Message and data rates may apply. Reply STOP to opt out of SMS
        {email ? (<> or email <a href={`mailto:${email}`}>{email}</a> with the subject "Unsubscribe"</>) : null}
        {" "}to opt out of marketing emails.</p>

      <h2>8. Email Communications (CAN-SPAM)</h2>
      <p>By submitting your email, you consent to receive marketing, transactional, and informational emails. Each marketing email includes an unsubscribe link and our physical mailing address as required by the CAN-SPAM Act.</p>

      <h2>9. California Civil Code §1632 — Language of Negotiation</h2>
      <p>If any portion of a transaction with {companyName} is negotiated primarily in Spanish, Chinese, Tagalog, Vietnamese, or Korean, you are entitled to a translated copy of certain contracts as required by California Civil Code §1632.
        {email ? (<> Request translations at <a href={`mailto:${email}`}>{email}</a>.</>) : null}
      </p>

      <h2>10. Non-Circumvention</h2>
      <p>All properties, sellers, off-market contacts, agents, lenders, contractors, title officers, and other parties introduced through the Services are confidential and proprietary to {companyName}. For two (2) years from your last use of the Services, you and your affiliates shall not directly or indirectly solicit, negotiate with, contract with, or transact business with such parties for the purpose of bypassing {companyName}. Breach entitles {companyName} to liquidated damages of the greater of the commission that would have been earned or $25,000 per occurrence, plus injunctive relief and reasonable attorneys' fees.</p>

      <h2>11. Non-Solicitation of Personnel</h2>
      <p>For two (2) years, you shall not solicit, hire, or attempt to hire any {companyName} personnel without written consent.</p>

      <h2>12. Permitted Use; Restrictions</h2>
      <p>We grant you a limited, non-exclusive, revocable, non-transferable license to use the Services for personal real estate investment evaluation. You may not: (a) scrape, spider, crawl, or use automated tools on the Services; (b) reproduce, redistribute, or create derivative works of content; (c) compete with the Services or solicit {companyName} clients; (d) reverse-engineer or bypass security; (e) transmit malware, spam, or unlawful content; (f) violate California or federal law.</p>

      <h2>13. Intellectual Property</h2>
      <p>All Services content (text, images, logos, "{companyName}," code, design) is owned by {companyName} or its licensors and protected under California, federal, and international IP law. No rights are granted except as expressly stated.</p>

      <h2>14. Indemnification</h2>
      <p>You agree to defend, indemnify, and hold harmless {companyName}, its officers, agents, employees, affiliates, and licensors from any claims, damages, liabilities, costs, and attorneys' fees arising from (a) your breach of these Terms, (b) your violation of any law including the TCPA, CAN-SPAM, Fair Housing, or California real estate law, or (c) your use of the Services.</p>

      <h2>15. Disclaimer of Warranties</h2>
      <p>THE SERVICES ARE PROVIDED "AS-IS" AND "AS-AVAILABLE." {companyName.toUpperCase()} DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, AND UNINTERRUPTED AVAILABILITY.</p>

      <h2>16. Limitation of Liability</h2>
      <p>TO THE MAXIMUM EXTENT PERMITTED BY CALIFORNIA LAW, {companyName.toUpperCase()} SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES. AGGREGATE LIABILITY FOR ANY CLAIM SHALL NOT EXCEED $100. This limitation does not apply where prohibited by California law (e.g., gross negligence, fraud, or statutory consumer protections).</p>

      <h2>17. Governing Law and Venue</h2>
      <p>These Terms are governed by the laws of the State of California, without regard to conflict-of-laws principles. Exclusive venue for any dispute lies in the state or federal courts located in {addressCity ? `${addressCity} County` : "the county of the brokerage's principal office"}, California, except as provided in Section 18.</p>

      <h2>18. Dispute Resolution — Binding Arbitration; Class Action Waiver</h2>
      <p>Any dispute, claim, or controversy arising out of or relating to these Terms or the Services ("Claim") shall be resolved exclusively by binding individual arbitration administered by JAMS in {addressCity ? addressCity : "the brokerage's county"}, California, under its Streamlined Arbitration Rules, except: (a) either party may bring an individual claim in small-claims court if eligible; (b) either party may seek injunctive relief in court for IP or non-circumvention violations. <strong>CLASS ACTION WAIVER:</strong> YOU AND {companyName.toUpperCase()} WAIVE THE RIGHT TO PARTICIPATE IN ANY CLASS, COLLECTIVE, OR REPRESENTATIVE ACTION.</p>

      <h2>19. Severability</h2>
      <p>If any provision is found unenforceable, the remainder of the Terms remain in effect; the unenforceable provision shall be modified to the minimum extent necessary to be enforceable.</p>

      <h2>20. Changes to These Terms</h2>
      <p>We may revise these Terms at any time. Material changes will be posted with a new "Last Modified" date. Continued use after posting constitutes acceptance.</p>

      <h2>21. Contact</h2>
      <p>
        {companyName}
        {addressCombined ? `, ${addressCombined}` : ""}
        {phone ? `, ${phone}` : ""}
        {email ? (<>, <a href={`mailto:${email}`}>{email}</a></>) : null}
        .
      </p>
    </LegalPage>
  );
}
