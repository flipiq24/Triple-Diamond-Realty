import LegalPage from "@/components/LegalPage";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

export default function Disclosures() {
  const { companyName } = useTenantBranding();
  const cf = useTenantCustomFields();
  const dre = cf.dre_broker_license;
  const responsibleBroker = cf.responsible_broker_name;
  const responsibleBrokerDre = cf.responsible_broker_dre;

  const licenseLine = [
    companyName,
    dre ? `CA DRE Broker License #${dre}` : null,
    responsibleBroker && responsibleBrokerDre
      ? `Responsible Broker ${responsibleBroker}, CA DRE #${responsibleBrokerDre}`
      : responsibleBroker
        ? `Responsible Broker ${responsibleBroker}`
        : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <LegalPage
      title={`California Real Estate Disclosures | ${companyName}`}
      description={`Required California real estate disclosures from ${companyName}: DRE license, Equal Housing, AS-IS terms, Natural Hazard, Megan's Law, RESPA AfBA, Clear Cooperation, and §1632 language of negotiation.`}
      path="/disclosures"
      heading="Required Disclosures"
    >
      <h2>1. Brokerage License (Bus. &amp; Prof. Code §10140.6)</h2>
      <p>{licenseLine}.</p>

      <h2>2. Equal Housing Opportunity</h2>
      <p>{companyName} is an Equal Housing Opportunity brokerage and complies with the federal Fair Housing Act, California FEHA, and Unruh Civil Rights Act.</p>

      <h2>3. AS-IS Properties / No Seller Disclosures on Certain Listings</h2>
      <p>Many investment properties offered through the Services are AS-IS, WHERE-IS. Where the seller is an REO bank, trustee, assignee, or otherwise exempt from California Civil Code §1102 (Transfer Disclosure Statement), no TDS will be provided. Independent inspection is essential.</p>

      <h2>4. Natural Hazard Disclosure</h2>
      <p>California Civil Code §1103 requires sellers of 1–4 unit residential properties to deliver a Natural Hazard Disclosure Statement. Where available, it will be provided.</p>

      <h2>5. Megan's Law Notice</h2>
      <p>Information about specified registered sex offenders is made available to the public via the California Department of Justice website at <a href="https://www.meganslaw.ca.gov" target="_blank" rel="noopener noreferrer">meganslaw.ca.gov</a>.</p>

      <h2>6. Investment Disclaimer</h2>
      <p>No representation of profit, return, appreciation, rental income, or any outcome is made. All projections (ARV, cap rate, cash-on-cash, rehab cost, rent) are unverified estimates. Real estate investing carries substantial risk including loss of principal.</p>

      <h2>7. AfBA Disclosure (RESPA §8)</h2>
      <p>{companyName} may have business relationships with affiliated title, escrow, or lending providers. A written Affiliated Business Arrangement Disclosure will be provided at or before any referral. Use of referred providers is voluntary.</p>

      <h2>8. Clear Cooperation Policy</h2>
      <p>Publicly marketed listings are submitted to the MLS within one business day per the NAR Clear Cooperation Policy.</p>

      <h2>9. Language of Negotiation (Civil Code §1632)</h2>
      <p>Translated contracts available upon request for Spanish, Chinese, Tagalog, Vietnamese, and Korean transactions.</p>
    </LegalPage>
  );
}
