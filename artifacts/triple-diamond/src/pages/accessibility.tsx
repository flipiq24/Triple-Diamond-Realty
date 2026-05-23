import LegalPage from "@/components/LegalPage";

export default function Accessibility() {
  return (
    <LegalPage
      title="Accessibility Statement | Triple Diamond Realty"
      description="Triple Diamond Realty's commitment to WCAG 2.1 Level AA accessibility under the ADA and California Unruh Civil Rights Act."
      path="/accessibility"
      heading="Accessibility Statement"
    >
      <p>
        Triple Diamond Realty is committed to providing a website accessible to the widest possible audience, including individuals with disabilities. We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
      </p>
      <p>
        If you experience any difficulty accessing any portion of this site, please contact us at <a href="mailto:accessibility@tdrealty.net">accessibility@tdrealty.net</a> or <a href="tel:+19092804906">(909) 280-4906</a>, and we will work with you to provide the information, item, or transaction through an accessible communication method.
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
