export type Tenant = {
  org: string;
  tabLabel: string;
  initials: string;
  domain: string;
  colour: string;
  meta: [string, string][];
  cols: [string, string, string];
  rows: [string, string, string][];
  sumK: string;
  sumV: string;
  seal: string;
};

export const tenants: Tenant[] = [
  {
    org: "Kestrel Grammar School",
    tabLabel: "Kestrel Grammar",
    initials: "KG",
    domain: "kestrel.tabula.school",
    colour: "#9A3D50",
    meta: [
      ["Student", "Amara Bello · Y11"],
      ["Term", "Summer 2026"],
      ["Position", "4 of 118"],
    ],
    cols: ["Subject", "Mark", "Grade"],
    rows: [
      ["Mathematics", "91", "A*"],
      ["English Literature", "78", "A"],
      ["Physics", "84", "A"],
      ["History", "69", "B"],
      ["French", "72", "B"],
    ],
    sumK: "Average mark",
    sumV: "78.8%",
    seal: "Signed by the head teacher",
  },
  {
    org: "Ashford Polytechnic",
    tabLabel: "Ashford Polytechnic",
    initials: "AP",
    domain: "results.ashfordpoly.ac",
    colour: "oklch(0.6231 0.1880 259.8145)",
    meta: [
      ["Student", "T. Mensah · HND/22/0417"],
      ["Session", "2025/26 · Sem 2"],
      ["Standing", "Good"],
    ],
    cols: ["Course", "Units", "Points"],
    rows: [
      ["Structural Analysis II", "3", "4.00"],
      ["Fluid Mechanics", "3", "3.50"],
      ["Engineering Maths", "2", "4.00"],
      ["Technical Drawing", "2", "3.00"],
      ["Industrial Law", "1", "3.50"],
    ],
    sumK: "Cumulative GPA",
    sumV: "3.68 / 4.00",
    seal: "Released by senate",
  },
  {
    org: "Institute of Chartered Analysts",
    tabLabel: "Chartered Analysts",
    initials: "CA",
    domain: "candidates.icanalysts.org",
    colour: "#6D4AA8",
    meta: [
      ["Candidate", "Reg. 44-92018"],
      ["Sitting", "June 2026 · Level II"],
      ["Attempt", "First"],
    ],
    cols: ["Paper", "Scaled", "Outcome"],
    rows: [
      ["Financial Reporting", "642", "Distinction"],
      ["Quantitative Methods", "588", "Merit"],
      ["Ethics & Standards", "611", "Distinction"],
      ["Portfolio Theory", "502", "Pass"],
    ],
    sumK: "Overall result",
    sumV: "Pass with merit",
    seal: "Verified by the board",
  },
];

export type PipelineStage = {
  title: string;
  body: string;
  pts: string[];
  mockKey: "setup" | "grading" | "enrollment" | "output" | "release";
};
export const pipelineStages: PipelineStage[] = [
  // Setup step
  {
    title: "Admin and Teachers sign up",
    body: "Admin is responsible for onboarding members of staff, including form teachers, and subject teachers.",
    pts: [
      "Admin sets up school, assigns teachers to classes and subjects, and students to classes",
      "Admin also sets up grading system and assessment structure",
      "Form Teacher manages results for their class",
      "Subject teachers manage results for their subjects",
    ],
    mockKey: "setup",
  },
  // Grading step
  {
    title: "Custom Grading and Assessment Structure",
    body: "Admin sets up grading system and assessment structure, including letter grades, weighted CGPA, pass/fail cut-off, and more.",
    pts: [
      "Admin sets up the grading system",
      "Grades are calculated according to the grading system",
      "Assessment structure shapes result entry",
    ],
    mockKey: "grading",
  },
  // Enrollment step
  {
    title: "Enrollment and Result Entry",
    body: "Admin enrolls students into classes, and subject teachers enter results for their subjects. Form Teachers oversee the process and ensure compliance.",
    pts: [
      "Admin enrolls students into classes",
      "Subject teachers enter results for their subjects",
      "Form Teachers oversee the process and ensure compliance",
    ],
    mockKey: "enrollment",
  },
  // Output step
  {
    title: "Custom Templates and Outputs",
    body: "Admin sets up custom templates and master sheet templates. Teachers use a simple interface to enter results and generate outputs. Admin can generate final results using custom templates.",
    pts: [
      "Admin sets up custom templates and master sheet templates",
      "Teachers use a simple interface to enter results and generate outputs",
      "Admin can generate final results using custom templates",
    ],
    mockKey: "output",
  },
  {
    title: "Release and Compliance",
    body: "Students and parents can check results through any means required by the school: Scratch cards, SMS, or in-print. Results are released and saved forever for future reference.",
    pts: [
      "Admin sets up release times per class or cohort",
      "Results are released and saved forever for future reference",
      "Admin can generate final results using custom templates",
    ],
    mockKey: "release",
  },
];


export const clientInstitutions: [string, string][] = [
  ["St Michael The Arch Angel Academy", "#9A3D50"],
  ["Brightstar Academy", "#6D4AA8"],
  // ["Institute of Chartered Analysts", "#6D4AA8"],
  // ["Northgate Academy Trust", "var(--chart-3)"],
  // ["Marisol International College", "#0F7C6C"],
  // ["Whitby Hall Sixth Form", "var(--chart-4)"],
  // ["Cedar Ridge University", "#B4762A"],
  // ["St. Alban's Collegiate", "var(--chart-2)"],
  // ["Riverstone Technical Institute", "#4A6FA5"],
  // ["The Linden Schools Group", "var(--chart-5)"],
];

export type Testimonial = {
  metric: string;
  metricLabel: string;
  quote: string;
  initials: string;
  colour: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    metric: "14 → 4",
    metricLabel: "days from last paper to signed broadsheet",
    quote:
      "We used to lose the first fortnight of every term to collating marks. This year the broadsheet was signed off four days after the last paper, and I spent the rest of the week on timetabling instead.",
    initials: "KG",
    colour: "#9a3d50",
    name: "Adaeze Nwosu",
    role: "Exam officer, Kestrel Grammar School",
  },
  {
    metric: "6",
    metricLabel: "grading exceptions configured in one afternoon",
    quote:
      "Our CGPA rules have six exceptions and every vendor before this one told us to change them. Tabula let us configure the exceptions in an afternoon, and the numbers came out matching our old manual sheets exactly.",
    initials: "AP",
    colour: "var(--primary)",
    name: "Dr Martin Oyelaran",
    role: "Registrar, Ashford Polytechnic",
  },
  {
    metric: "61k",
    metricLabel: "candidates in the first hour, no queue",
    quote:
      "Sixty thousand candidates hit the portal in the first hour and nothing wobbled. What sold the board, though, was the audit log — every mark change has a name and a timestamp against it.",
    initials: "CA",
    colour: "#6d4aa8",
    name: "Priya Raghavan",
    role: "Head of technology, Institute of Chartered Analysts",
  },
  {
    metric: "9 years",
    metricLabel: "of historic results migrated before go-live",
    quote:
      "Nine years of results sat in spreadsheets across four shared drives. They imported all of it, reconciled it against our printed transcripts and showed us the twelve rows that did not match.",
    initials: "NA",
    colour: "var(--chart-3)",
    name: "Helen Marsh",
    role: "Data lead, Northgate Academy Trust",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "How long does setup take?",
    answer:
      "Two to three weeks for a single institution. Week one is your grading rules, transcript layout and user roles. Week two is importing students and historic results. Most tenants run a parallel term alongside their old process before switching fully.",
  },
  {
    question: "Can we keep our own grading rules?",
    answer:
      "Yes, including the awkward ones. Weighted coursework splits, capped resits, best-of-two attempts, credit-weighted CGPA and pass/merit/distinction bands are all configurable per tenant. If a rule cannot be expressed in the builder we add it as a formula, and it runs the same way every term after that.",
  },
  {
    question: "What happens to our historic results?",
    answer:
      "We import from spreadsheets or a database dump, recompute every grade using your rules, and show you a reconciliation report of any row that does not match your existing transcripts. You sign off on that report before the tenant goes live.",
  },
  {
    question: "Where is our data stored?",
    answer:
      "In the region you pick at signup, in a database used only by your institution, encrypted with keys not shared with any other tenant. Daily backups stay in the same region. You can export everything as CSV or PDF at any time, including on the day you leave.",
  },
  {
    question: "Can students see results on a phone?",
    answer:
      "The portal is built for phones first, since that is where results day actually happens. Students and parents sign in to see current and past results, and release is scheduled per class so nothing appears an hour early by accident.",
  },
  {
    question: "What does it cost?",
    answer:
      "Priced per enrolled student per year, billed to the institution, with migration included rather than charged as a separate project. Groups and academy trusts pay once across all their sites. We quote on the walkthrough call, once we know your numbers.",
  },
  {
    question: "Will it hold up on results day?",
    answer:
      "Release traffic is the one load we design for. Result pages are pre-rendered before the release time and served from cache, so a hundred thousand students arriving at 09:00 read static files rather than hitting your database.",
  },
];

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#institutions", label: "Institutions" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];
