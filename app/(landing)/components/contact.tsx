"use client";

import { FormEvent, useState } from "react";
import { faqItems } from "../data/landing-data";
import { BtnPrimary, SectionHead, Shell } from "./landing-ui";
import Link from "next/link";

// const channels = [
//   {
//     label: "Sales",
//     value: "hello@tabula.school",
//     href: "mailto:hello@tabula.school",
//     icon: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
//         <rect x="3" y="5" width="18" height="14" rx="2" />
//         <path d="M3 7l9 6 9-6" />
//       </svg>
//     ),
//   },
//   {
//     label: "Existing institutions",
//     value: "support@tabula.school",
//     href: "mailto:support@tabula.school",
//     icon: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
//         <path d="M12 2a9 9 0 0 0-9 9v4a3 3 0 0 0 3 3h1v-7H5v-.5A7 7 0 0 1 19 11v.5h-2V18h1a3 3 0 0 0 3-3v-4a9 9 0 0 0-9-9z" />
//       </svg>
//     ),
//   },
//   {
//     label: "Phone",
//     value: "+44 20 7946 0410",
//     icon: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
//         <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
//       </svg>
//     ),
//   },
//   {
//     label: "Hours",
//     value: "Mon–Fri, 08:00–18:00 UTC",
//     icon: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
//         <circle cx="12" cy="12" r="9" />
//         <path d="M12 7v5l3 2" />
//       </svg>
//     ),
//   },
// ];

export function Contact() {
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const missing = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]")].find(
      (f) => !f.value.trim()
    );
    if (missing) {
      setStatus({
        text: "Fill in your name, role, institution and work email.",
        ok: false,
      });
      missing.focus();
      return;
    }
    setStatus({
      text: "Demo page — connect this form to your backend to send the request.",
      ok: true,
    });
  };

  return (
    <section id="contact" className="py-[clamp(56px,7vw,104px)]">
      <Shell>
        <SectionHead
          // eyebrow="Contact us"
          title="Frequently Asked Questions or Contact Us..."
          description="We are here to help you with your results. If you have any questions, please feel free to contact us."
        />

        <div className="mt-[38px] grid items-start gap-[clamp(28px,4vw,56px)] lg:grid-cols-2">
          <div className="border-t border-border">
            {/* Frequently Asked Questions */}
            {faqItems.map((item, i) => (
              <details key={item.question} className="group border-b border-border" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3.5 py-[18px] text-base font-semibold marker:content-none hover:text-primary [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="mt-0.5 size-[18px] shrink-0 text-muted-foreground transition-[transform,color] group-open:rotate-45 group-open:text-primary"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="max-w-[56ch] pb-5 text-[0.95rem] text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>

          {/* Contact Us */}
          <div className="rounded-[calc(var(--radius)+10px)] border border-border bg-card p-[clamp(22px,3vw,32px)] shadow-md">
            <h3 className="text-[1.3rem] font-bold tracking-[-0.02em]">Didn't find what you were looking for?</h3>
            <p className="mt-2.5 text-[0.94rem] text-muted-foreground">
              Please feel free to contact us. We will get back to you as soon as possible.
            </p>
            <form onSubmit={handleSubmit} noValidate className="mt-4">
              {/* Name */}
              <div className="grid grid-cols-1 gap-3.5 max-[560px]:grid-cols-1 max-[560px]:gap-0">
                <Field label="Your name" id="name" required autoComplete="name" />
              </div>
              {/* Institution and Work email */}
              <div className="grid grid-cols-1 gap-3.5 max-[560px]:grid-cols-1 max-[560px]:gap-0">
                <Field label="Institution" id="institution" required />
              </div>
              {/* Email or Phone */}
              <div className="grid grid-cols-1 gap-3.5 max-[560px]:grid-cols-1 max-[560px]:gap-0">
                <Field label="Email or Phone" id="emailOrPhone" required autoComplete="emailOrPhone" />
              </div>
              {/* Message */}
              <div className="mt-4">
                <label htmlFor="message" className="mb-1.5 block text-[0.84rem] font-semibold">
                  Anything we should know first
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder=""
                  className="min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-[0.94rem] leading-normal transition-[border-color,box-shadow] focus:border-ring focus:shadow-[0_0_0_3px_var(--accent)] focus:outline-none"
                />
              </div>
              {/* Submit button */}
              <BtnPrimary type="submit" className="mt-[22px] w-full">
                Send request
              </BtnPrimary>
              {/* Disclaimer */}
              {status && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-3.5 text-center text-[0.88rem] font-semibold ${status.ok ? "text-[var(--ok)]" : "text-destructive"}`}
                >
                  {status.text}
                </p>
              )}
            </form>
          </div>
        </div>
        {/* 
        <div className="mt-[38px] grid grid-cols-4 gap-3.5 border-t border-border pt-8 max-[1040px]:grid-cols-2 max-[560px]:grid-cols-1">
          {channels.map((c) => (
            <div key={c.label} className="flex items-start gap-3">
              <span className="grid size-[34px] shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                {c.icon}
              </span>
              <span>
                <span className="block text-[0.8rem] text-muted-foreground">{c.label}</span>
                <span className="mt-px block text-[0.92rem] font-semibold">
                  {c.href ? (
                    <a href={c.href} className="no-underline hover:text-primary">
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </span>
              </span>
            </div>
          ))}
        </div> */}
      </Shell>
    </section>
  );
}

function Field({
  label,
  id,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-1.5 block text-[0.84rem] font-semibold">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-[0.94rem] transition-[border-color,box-shadow] focus:border-ring focus:shadow-[0_0_0_3px_var(--accent)] focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  options,
}: {
  label: string;
  id: string;
  options: string[];
}) {
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-1.5 block text-[0.84rem] font-semibold">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-[0.94rem] transition-[border-color,box-shadow] focus:border-ring focus:shadow-[0_0_0_3px_var(--accent)] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
