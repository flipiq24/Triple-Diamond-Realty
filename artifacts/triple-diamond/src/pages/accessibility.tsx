import LegalPage from "@/components/LegalPage";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

export default function Accessibility() {
  const { companyName } = useTenantBranding();
  const cf = useTenantCustomFields();
  const phone = cf.primary_phone;
  const phoneTel = cf.primary_phone_tel;
  const email = cf.accessibility_email;

  return (
    <LegalPage
      title={`Accessibility Statement | ${companyName}`}
      description={`${companyName}'s commitment to WCAG 2.1 Level AA accessibility under the ADA and California Unruh Civil Rights Act.`}
      path="/accessibility"
      heading="Accessibility Statement"
    >
      <p>
        {companyName} is committed to providing a website accessible to the widest possible audience, including individuals with disabilities. We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
      </p>
      <p>
        If you experience any difficulty accessing any portion of this site, please contact us
        {email ? (<> at <a href={`mailto:${email}`}>{email}</a></>) : null}
        {phone && phoneTel ? (<> or <a href={`tel:${phoneTel}`}>{phone}</a></>) : null}
        , and we will work with you to provide the information, item, or transaction through an accessible communication method.
      </p>
      <h2>Standards we follow</h2>
      <ul>
        <li>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</li>
        <li>Americans with Disabilities Act (ADA)</li>
        <li>California Unruh Civil Rights Act (Civil Code §51)</li>
      </ul>
      <h2>Ongoing effort</h2>
      <p>Accessibility is an ongoing effort. We regularly review the site, train our team, and welcome feedback to help us improve the experience for everyone.</p>
    </LegalPage>
  );
}
