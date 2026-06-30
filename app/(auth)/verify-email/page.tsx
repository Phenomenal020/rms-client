import { redirect } from "next/navigation";
import { VerifyEmailForm } from "./verify-email-form";

// Metadata for the verify email page
export const metadata = {
  title: "Verify Email",
  description: "Verify your email address to continue",
};

// Verify email page
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/sign-up");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <VerifyEmailForm email={email} />
    </main>
  );
}