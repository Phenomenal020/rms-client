// Pipeline Stages
export type PipelineStage = {
  pts: string[];
  mockKey: "setup" | "grading" | "enrollment" | "output" | "compliance";
};
export const pipelineStages: PipelineStage[] = [
  // Setup step
  {
    pts: [
      "Admin sets up your school and assigns teachers to classes",
      "Form Teachers manage results for their classes",
      "Subject teachers manage results for their subjects",
    ],
    mockKey: "setup",
  },
  // Grading step
  {
    pts: [
      "Admin sets up the grading system",
      "Grades are calculated according to the grading system",
      "Assessment structure shapes result entry",
    ],
    mockKey: "grading",
  },
  // Enrollment step
  {
    pts: [
      "Admin enrolls students into classes",
      "Subject teachers enter results for their subjects",
      "Form Teachers oversee the process and ensure compliance",
    ],
    mockKey: "enrollment",
  },
  // Output step
  {
    pts: [
      "Admin sets up custom templates and master sheet templates",
      "Teachers use a simple interface to enter results and generate outputs",
      "Admin can generate final results using custom templates",
    ],
    mockKey: "output",
  },
  {
    pts: [
      "Results are sent to the approved channels for release",
      "Everything is logged and audited to ensure compliance",
      "Backups are available for future reference",
    ],
    mockKey: "compliance",
  },
];


// Our numbers
export type Numbers = {
  teachers: number,
  institutions: number,
  availability_sla: number,
  sustainable_commitment: number,
}
export const ourNumbers: Numbers = {
  teachers: 20,
  institutions: 2,
  availability_sla: 99.9,
  sustainable_commitment: 250000,
}


// Testimonials
export type Testimonial = {
  quote: string;
  initials: string;
  colour: string;
  name: string;
  role: string;
};
export const testimonials: Testimonial[] = [
  {
    quote:
      "I have great confidence in SMAA. My son started reading and writing in Nursery 2. I can recommend the School to whoever wants qualitative and excellent Education for their children any day.",
    initials: "AE",
    colour: "#9a3d50",
    name: "Amarachi Ezenwaka",
    role: "Administrator",
  },
  {
    quote:
      "I am super proud to be a staff of this great school. The curriculum is second to none and each child is treated with care. The management team is awesome, they make sure that the staff are given good training for the job by organising workshops and training sessions.",
    initials: "TJ",
    colour: "var(--primary)",
    name: "Terwase Ngufan Jessica",
    role: "Teacher",
  },
  {
    quote:
      "SMAAM offers you so many opportunities for growth. Workshops/Seminars by Certified teachers are organised at the beginning of every Session. Incentives are given to both staff and students at intervals as a form of encouragement. Overall, it is a fun place to work in",
    initials: "MJ",
    colour: "#6d4aa8",
    name: "Mrs. Mokwe Jeraldine",
    role: "Teacher",
  },
  {
    quote:
      "I celebrate you great TEACHERS of ST MICHAEL THE ARCHANGEL. Your impactful knowledge is highly recognized and appreciated. Remain blessed.",
    initials: "SE",
    colour: "var(--chart-3)",
    name: "Stella Ezenwaka",
    role: "Proprietress",
  },
];


// Pricing Plans
export type PricingPlan = {
  id: "regular" | "sustainable" | "custom";
  name: string;
  tagline: string;
  priceLabel: string;
  priceDetail?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
};
export const pricingPlans: PricingPlan[] = [
  {
    id: "regular",
    name: "Regular",
    tagline: "Everything you need to automate your results process.",
    priceLabel: "N100,000 per 500 students",
    priceDetail: "Billed annually. Negotiable for small schools.",
    features: [
      "Full pipeline: setup, grading, enrollment, and release",
      "Custom templates and master sheets",
      "Audit log and compliance exports",
      "On-demand and backup copies for up to 10 years",
      "Lightning fast email support",
    ],
    cta: "Get started",
  },
  {
    id: "sustainable",
    name: "Sustainable",
    tagline: "Promote sustainability and get our support.",
    priceLabel: "50% cashback on Regular",
    priceDetail: "Applied by default for qualifying schools.",
    features: [
      "Full pipeline: setup, grading, enrollment, and release",
      "Custom templates and master sheets",
      "Audit log and compliance exports",
      "On-demand and backup copies for up to 10 years",
      "Lightning fast email support",
      "50% cashback to support sustainable initiatives",
      "Free sustainabilty training and support"
    ],
    cta: "Get started",
    highlighted: true,
    badge: "50% cashback",
  },
  {
    id: "custom",
    name: "Custom",
    tagline: "For institiutions with unique needs or scale.",
    priceLabel: "Pricing based on your needs",
    priceDetail: "Contact us to discuss your needs.",
    features: [
      "Dedicated infrastructure and data isolation",
      "Custom pipeline according to your unique needs",
      "Custom templates and master sheets",
      "Audit log and compliance exports",
      "On-demand and backup copies for up to 10 years",
      "Lightning fast email support",
    ],
    cta: "Contact us",
  },
];


// Frequently Asked Questions
export type FaqItem = {
  question: string;
  answer: string;
};
export const faqItems: FaqItem[] = [
  {
    question: "What is this product?",
    answer:
      "Teachers Aid is a results management system for primary and secondary schools. Institutions who use this product can automate their results process, from setup to release. Pilot tests suggests that this can reduce the time taken to release results by up to 80%, making results available in hours instead of days.  It can also completely remove the need for paper.",
  },
  {
    question: "What is multi-tenancy?",
    answer:
      "Multi-tenancy means multiple institutions use the same product. For instance, School A and School B can use the same product while keeping their data separate. Multi-tenancy is key to making the product much more affordable and scalable. We also offer a dedicated plan for institutions that have unique requirements.",
  },
  {
    question: "Is it safe to use this product?",
    answer:
      "Short answer? yes. We built the software with security best practices - Principle of Least Privilege, Separation of Duties, Auditing and Logging, Multi-Factor Authentication, etc. However, we understand that security incidents can occur. Therefore, we regularly test and monitor our system for vulnerabilities and potential security breaches to fix them before they can be exploited. In the event of a security incident, we have a structured response plan (see our terms of service)"
  },
  {
    question: "How is my data stored?",
    answer:
      "Your data is stored following best practices. We encrypt data at rest and in transit, maintain multiple backups, and regularly audit our system for data access and integrity. We also provide secure channels for institutions who wish to migrate their data to their own infrastructure."
  },
  {
    question: "How does this product scale?",
    answer:
      "The product is built for scale. Built on top of very mature cloud infrastructure, we have robust autoscaling policies and monitoring in place to scale with demand, ensuring that the product can handle any traffic spike without compromising on performance.",
  },
  {
    question: "What does this have to do with sustainability?",
    answer:
      'As "space nerds", we are passionate about sustainability. In our universe of billions upon billions of galaxies and many more planets, this "rock" is the only one we can live on (at least for now). With depleting resources and increasing population, the need for sustainable solutions is more important than ever. Therefore, we are committed to making our products very efficient and as sustainable as possible.',
  },
  {
    question: 'What counts as "sustainable commitment"?',
    answer:
      'We offer a sustainable plan for our clients to incentivise sustainable practices. We will give you 50% cashback on your subscription if you commit to sustainable practices. This can be investing in technologies that improve employee well-being, reducing paper usage, and sustainability training and awareness programmes.',
  },
  {
    question: 'How do I protect my result sheets from tampering?',
    answer:
      'We understand that result sheets are a valuable asset to our clients and in the wrong hands can compromise the integrity of their processes. Therefore, we offer a simple interface for result imputation. Clients who want to use custom templates must register a verified email address to which custom result sheets are sent when results are released. We also provide rollback mechanisms and comprehensive audit logging to revert to the previous version of the result sheet if tampering is detected.',
  },
  {
    question: 'Do you offer scratch cards or share links?',
    answer:
      'At the moment, we do not. However, based on our customer needs, this could be available in the future. In the meantime, our custom plan can incorporate this feature if you need it.',
  },
  // {
  //   question: 'Do you offer AI assistance?',
  //   answer:
  //     'After careful consideration, we decided not to offer AI assistance in the regular and sustainable plans. This is in line with our mission to make the product very affordable, and AI only makes this moe expensive. However, we are constantly listening to our customers and will consider adding this feature in the future if it is requested by a significant number of users.',
  // },
  {
    question: 'Describe your pricing models',
    answer:
      'Our pricing models are based on flexibility. We understand that each institution has unique needs and requirements. Therefore, we offer a range of plans to choose from. We also offer a custom plan for institutions that have very unique requirements or need dedicated infrastructure.',
  },
];


// Navigation Links
export const navLinks = [
  { href: "#pipeline", label: "About" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];
