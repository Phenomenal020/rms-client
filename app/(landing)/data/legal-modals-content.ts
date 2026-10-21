export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

// About Modal Content
export const aboutModalContent = {
  title: "About AiD",
  subtitle:
    "AiD is the pilot software of the 3SR Project, a non-profit initiative of TekSkillUp Academy. It is a result management system that helps schools digitise result processing, from setup through release - a notoriously innacurate and time-consuming process. A survey of several teachers in Nigerian schools revealed that manual result processing is one of the most time-consuming and error-prone tasks in their jobs. So, we decided to build an affordable and accessible solution to automate this process.",
  sections: [
    {
      heading: "Our mission",
      paragraphs: [
        "To provide a simple, affordable, and accessible solution to help schools digitise result processing.",
        "To reduce manual work, improve accuracy, and give stakeholders clearer visibility into student performance.",
        "To take advantage of technology to improve the quality of education and the mental wellbeing of stakeholders.",
      ],
    },
    {
      heading: "Our vision",
      paragraphs: [
        "To completely eliminate manual result processing, especially in Nigerian schools.",
        "To build an ecosystem of tools and services that bridge the gap in the quality of education across institutions regardless of their location or socio-economic background.",
      ],
    },
    {
      heading: "Our approach",
      paragraphs: [
        "We believe the importance of teachers in our society cannot be overemphasised. So, we are always looking for ways to support them and improve the experience of teaching. A survey conducted by TekSkillUp Academy revealed that many teachers would really appreciate a result management system. However, existing tools were either too expensive or inefficient at scale (for example, Spreadsheet software). So, we decided to build a dedicated solution that would help schools automate this with minimal manual intervention and scale effortlessly. By adopting a multi-tenant architecture, we can offer a solution that is affordable and accessible to schools of all sizes and locations. We also offer separate options for schools that want custom solutions tailored to their needs.",
      ],
    },
    {
      heading: "The Company",
      paragraphs: [
        "3SR Project · TekSkillUp Academy",
        "Product: AiD (Result Management System)",
        "Contact: 3srproject@teachersaid.tech (Use 'About AiD' as the subject)",
      ],
    },
  ] satisfies LegalSection[],
};

// Privacy Modal Content
export const privacyModalContent = {
  title: "Privacy Policy",
  intro:
    "This Privacy Policy explains how 3SR Project collects, uses, and protects information when you use AiD and related websites or services.",
  sections: [
    {
      heading: "Scope and our role",
      paragraphs: [
        "We process personal information to provide result management services, operate the AiD platform, and improve customer experience. For purposes described here, 3SR Project acts as a data controller for information we collect through our services.",
        "We only collect information that is necessary to provide the service. Any and all information collected is encrypted and stored securely following industry best practices",
        "We DO NOT share information with third parties unless required by the authority of the government. Ads are 100% prohibited on our platform.",
      ],
    },
    {
      heading: "Information we collect",
      bullets: [
        "Administrator details: name, email, phone, and organisation role",
        "School data: institution name, address, and optional configuration such as motto",
        "Student records: names, classes, scores, grades, and published results",
        "Staff records: teacher and administrator activity related to the platform",
        "Technical data: device, browser, IP address, and usage logs",
      ],
    },
    {
      heading: "Why we collect data",
      bullets: [
        "Create and manage user accounts and organisations",
        "Compute, store, and publish academic results",
        "Communicate with administrators, staff, and authorised contacts (for audit purposes)",
        "Improve reliability, security, and user experience",
        "Meet legal, regulatory, and contractual obligations",
      ],
    },
    {
      heading: "How we collect data",
      bullets: [
        "Information you provide during registration or in the product",
        "Data provided to us by authorised school staff on behalf of their institution",
        "Cookies and similar technologies to remember user preferences",
      ],
    },
    {
      heading: "How we use data",
      paragraphs: [
        "We use personal information to deliver and personalise the service, support schools, prevent abuse, and maintain platform security. Student data is used for educational and administrative purposes as defined by the school. ONLY dummy data is used for advertising and customer acquisition purposes.",
      ],
    },
    {
      heading: "Security and retention",
      paragraphs: [
        "We apply industry-standard technical measures to protect data against unauthorised access, alteration, or disclosure. Access is limited to the platform administrator and school administrators only with a legitimate need.",
        "We retain information for as long as needed to provide the service and as required by law or school agreements. Schools may request export or deletion of their data at any time.",
      ],
    },
    {
      heading: "Policy changes and contact",
      paragraphs: [
        "We may update this policy from time to time. Material changes will be communicated via email or a notice on our website.",
        "Questions: privacy@teachersaid.tech (Use 'Privacy Policy' as the subject)",
      ],
    },
  ] satisfies LegalSection[],
};

// // Terms Modal Content
// export const termsModalContent = {
//   title: "Terms of Service",
//   effectiveDate: "October 1, 2026",
//   intro:
//     "By using our services, you agree to these Terms of Service with 3SR Project.",
//   sections: [
//     {
//       heading: "General terms",
//       paragraphs: [
//         "These terms apply to the AiD website, applications, and related services. By using our resources, you confirm that you accept this agreement.",
//         "AiD is not liable for indirect, incidental, or consequential damages arising from use of the platform, to the fullest extent permitted by law. You are responsible for maintaining accurate school data and appropriate internal approvals before publishing results.",
//       ],
//     },
//     {
//       heading: "License",
//       paragraphs: [
//         "We grant you a revocable, non-exclusive, non-transferable, limited license to use the service in accordance with these terms and your subscription plan. We may suspend or terminate access if you breach these terms or misuse the platform.",
//       ],
//     },
//     {
//       heading: "Definitions",
//       bullets: [
//         "Company: AiD Systems Ltd., provider of Teachers Aid",
//         "Service: the Teachers Aid platform and related features",
//         "You: the individual or institution registered to use the service",
//         "Website: our public sites and authenticated application",
//       ],
//     },
//     {
//       heading: "Restrictions",
//       bullets: [
//         "Do not resell, sublicense, or expose the platform to unauthorised third parties",
//         "Do not reverse engineer, scrape, or attempt to bypass security controls",
//         "Do not remove proprietary notices or use the service for unlawful purposes",
//       ],
//     },
//     {
//       heading: "Payment and billing",
//       paragraphs: [
//         "Paid plans are billed according to the fees and billing cycle shown at purchase. You authorise us to charge your chosen payment method for recurring fees until you cancel in accordance with your plan.",
//         "Prices and billing methods may change with notice as described in your order or account settings.",
//       ],
//     },
//     {
//       heading: "Refunds",
//       paragraphs: [
//         "If you are not satisfied with a paid service, contact us to discuss your situation. Refund eligibility depends on your plan, usage, and applicable law.",
//       ],
//     },
//     {
//       heading: "Suggestions and feedback",
//       paragraphs: [
//         "Any suggestions or feedback you provide may be used by AiD without obligation to compensate you, unless otherwise agreed in writing.",
//       ],
//     },
//     {
//       heading: "Third-party services and links",
//       paragraphs: [
//         "The service may link to or integrate with third-party tools. We are not responsible for third-party content, policies, or practices. Your use of those services is at your own risk and subject to their terms.",
//       ],
//     },
//     {
//       heading: "Changes, termination, and availability",
//       paragraphs: [
//         "We may modify, suspend, or discontinue features with or without notice where permitted. You may stop using the service at any time.",
//         "We may terminate or restrict accounts that violate these terms or pose security or legal risk.",
//       ],
//     },
//     {
//       heading: "Disclaimer and limitation of liability",
//       paragraphs: [
//         "The service is provided “as is” and “as available” without warranties of uninterrupted or error-free operation, except where required by law.",
//         "To the maximum extent permitted by law, our total liability for claims relating to the service is limited to the amounts you paid us for the service in the twelve months before the claim.",
//       ],
//     },
//     {
//       heading: "Governing law and contact",
//       paragraphs: [
//         "These terms are governed by the laws of the Federal Republic of Nigeria, unless otherwise required by mandatory local law.",
//         "Legal inquiries: legal@aid-systems.example · AiD Systems Ltd., Lagos, Nigeria (placeholder address)",
//       ],
//     },
//   ] satisfies LegalSection[],
// };
