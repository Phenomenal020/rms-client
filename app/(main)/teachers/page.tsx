"use client";

import { TeachersForm } from "./teachers-form";

export default function TeachersPage() {
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">

      <div className="mx-auto w-full max-w-5xl space-y-10">

        <TeachersForm />

      </div>
    </main>
  );
}
