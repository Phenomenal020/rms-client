import type { Metadata } from "next";
import "./(landing)/landing.css";
import { LandingNav } from "./(landing)/components/landing-nav";
import { Hero } from "./(landing)/components/hero";
import { Features } from "./(landing)/components/features";
import { Institutions } from "./(landing)/components/institutions";
import { Testimonials } from "./(landing)/components/testimonials";
import { Contact } from "./(landing)/components/contact";
import { Footer } from "./(landing)/components/footer";

export const metadata: Metadata = {
  title: "AiD — Multi-tenant Result Management Solution for institutions",
  description:
    "AiD is a multi-tenant Result Management Solution for schools, colleges and exam boards. Each institution maintains its own records, grading scheme, assessment structure, custom templates, and many more.",
};

export default function Home() {
  return (
    <>
      <LandingNav />
      <main id="top" className="scroll-smooth">
        <Hero />
        <Features />
        <Institutions />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
