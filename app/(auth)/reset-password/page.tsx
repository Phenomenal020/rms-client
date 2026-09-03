// reset-password/page.tsx
import { ResetPasswordForm } from "./reset-password-form";
import { redirect } from "next/navigation";

// seo metadata for the reset password page
export const metadata = {
  title: "Reset Password",
  description: "Enter your reset code and choose a new password.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  // if there is no email query param, redirect to the forgot password page
  const { email } = await searchParams;
  if (!email) redirect("/forgot-password");

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      {/* Reset Password Form */}
      <ResetPasswordForm email={email} />
    </main>
  );
}
