export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export const aboutModalContent = {
  title: "About AiD",
  subtitle:
    "Simplify school result management with a trusted platform built for Nigerian institutions.",
  sections: [
    {
      heading: "Our mission",
      paragraphs: [
        "AiD Systems Ltd. builds Teachers Aid — software that helps primary and secondary schools digitise result processing, from setup through release.",
        "We focus on reducing manual work, improving accuracy, and giving administrators, teachers, and families clearer visibility into academic outcomes.",
      ],
    },
    {
      heading: "What we help schools do",
      bullets: [
        "Track performance and class trends from a central dashboard",
        "Automate grade calculations aligned to each school's grading rules",
        "Manage terms, classes, subjects, and staff workflows in one place",
        "Publish results securely with role-based access and audit-friendly records",
      ],
    },
    {
      heading: "Our approach",
      paragraphs: [
        "We transform scattered spreadsheets and paper-heavy processes into a simple, transparent workflow that scales from a single campus to multi-site groups.",
        "Pilot feedback suggests institutions can cut result release time significantly when grading rules and class structure are configured once and reused each term.",
      ],
    },
    {
      heading: "Company",
      paragraphs: [
        "AiD Systems Ltd. · Lagos, Nigeria",
        "Product: Teachers Aid (Results Management System)",
        "Contact: hello@aid-systems.example · +234-800-000-0000 (placeholder)",
      ],
    },
  ] satisfies LegalSection[],
};

export const privacyModalContent = {
  title: "Privacy Policy",
  effectiveDate: "March 1, 2026",
  intro:
    "This Privacy Policy explains how AiD Systems Ltd. (“AiD”, “we”, “us”) collects, uses, and protects information when you use Teachers Aid and related websites or services.",
  sections: [
    {
      heading: "Scope and our role",
      paragraphs: [
        "We process personal information to provide result management services, operate the Teachers Aid platform, and improve our products. For purposes described here, AiD acts as a data controller for information we collect through our services.",
        "We may share information within AiD Systems Ltd. and with processors who help us host, secure, and deliver the platform, under contracts that require appropriate safeguards.",
      ],
    },
    {
      heading: "Information we collect",
      bullets: [
        "Account details: name, email, phone, and organisation role",
        "School and administrative data: institution name, address, configuration",
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
        "Communicate with administrators, staff, and authorised contacts",
        "Improve reliability, security, and product experience",
        "Meet legal, regulatory, and contractual obligations",
      ],
    },
    {
      heading: "How we collect data",
      bullets: [
        "Information you provide during registration or in the product",
        "Data entered by authorised school staff on behalf of their institution",
        "Cookies and similar technologies on our marketing site (where applicable)",
      ],
    },
    {
      heading: "How we use data",
      paragraphs: [
        "We use personal information to deliver and personalise the service, support schools, prevent abuse, and maintain platform security. Student data is used for educational and administrative purposes defined by the school, not for unrelated advertising profiles.",
      ],
    },
    {
      heading: "Security and retention",
      paragraphs: [
        "We apply industry-standard technical and organisational measures to protect data against unauthorised access, alteration, or disclosure. Access is limited to authorised personnel and subprocessors with a legitimate need.",
        "We retain information for as long as needed to provide the service and as required by law or school agreements. Schools may request export or deletion subject to applicable limits.",
      ],
    },
    {
      heading: "Policy changes and contact",
      paragraphs: [
        "We may update this policy from time to time. Material changes will be communicated via email or a notice on our website.",
        "Questions: privacy@aid-systems.example · +234-800-000-0000 (placeholder)",
      ],
    },
  ] satisfies LegalSection[],
};

export const termsModalContent = {
  title: "Terms of Service",
  effectiveDate: "March 1, 2026",
  intro:
    "By accessing or using Teachers Aid, you agree to these Terms of Service with AiD Systems Ltd. If you do not agree, do not use the service.",
  sections: [
    {
      heading: "General terms",
      paragraphs: [
        "These terms apply to the Teachers Aid website, applications, and related services. By using our resources, you confirm that you accept this agreement.",
        "AiD is not liable for indirect, incidental, or consequential damages arising from use of the platform, to the fullest extent permitted by law. You are responsible for maintaining accurate school data and appropriate internal approvals before publishing results.",
      ],
    },
    {
      heading: "License",
      paragraphs: [
        "We grant you a revocable, non-exclusive, non-transferable, limited license to use the service in accordance with these terms and your subscription plan. We may suspend or terminate access if you breach these terms or misuse the platform.",
      ],
    },
    {
      heading: "Definitions",
      bullets: [
        "Company: AiD Systems Ltd., provider of Teachers Aid",
        "Service: the Teachers Aid platform and related features",
        "You: the individual or institution registered to use the service",
        "Website: our public sites and authenticated application",
      ],
    },
    {
      heading: "Restrictions",
      bullets: [
        "Do not resell, sublicense, or expose the platform to unauthorised third parties",
        "Do not reverse engineer, scrape, or attempt to bypass security controls",
        "Do not remove proprietary notices or use the service for unlawful purposes",
      ],
    },
    {
      heading: "Payment and billing",
      paragraphs: [
        "Paid plans are billed according to the fees and billing cycle shown at purchase. You authorise us to charge your chosen payment method for recurring fees until you cancel in accordance with your plan.",
        "Prices and billing methods may change with notice as described in your order or account settings.",
      ],
    },
    {
      heading: "Refunds",
      paragraphs: [
        "If you are not satisfied with a paid service, contact us to discuss your situation. Refund eligibility depends on your plan, usage, and applicable law.",
      ],
    },
    {
      heading: "Suggestions and feedback",
      paragraphs: [
        "Any suggestions or feedback you provide may be used by AiD without obligation to compensate you, unless otherwise agreed in writing.",
      ],
    },
    {
      heading: "Third-party services and links",
      paragraphs: [
        "The service may link to or integrate with third-party tools. We are not responsible for third-party content, policies, or practices. Your use of those services is at your own risk and subject to their terms.",
      ],
    },
    {
      heading: "Changes, termination, and availability",
      paragraphs: [
        "We may modify, suspend, or discontinue features with or without notice where permitted. You may stop using the service at any time.",
        "We may terminate or restrict accounts that violate these terms or pose security or legal risk.",
      ],
    },
    {
      heading: "Disclaimer and limitation of liability",
      paragraphs: [
        "The service is provided “as is” and “as available” without warranties of uninterrupted or error-free operation, except where required by law.",
        "To the maximum extent permitted by law, our total liability for claims relating to the service is limited to the amounts you paid us for the service in the twelve months before the claim.",
      ],
    },
    {
      heading: "Governing law and contact",
      paragraphs: [
        "These terms are governed by the laws of the Federal Republic of Nigeria, unless otherwise required by mandatory local law.",
        "Legal inquiries: legal@aid-systems.example · AiD Systems Ltd., Lagos, Nigeria (placeholder address)",
      ],
    },
  ] satisfies LegalSection[],
};
