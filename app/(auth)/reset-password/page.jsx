// reset-password/page.tsx
import { ResetPasswordForm } from "./reset-password-form";
import { redirect } from "next/navigation";

export const metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({ searchParams }) {
  const email = searchParams?.email;
  if (!email) redirect("/forgot-password");

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full space-y-6">

        {/* Title and Description */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-muted-foreground">
            Enter your reset code and choose a new password.
          </p>
        </div>

        {/* Reset Password Form */}
        <ResetPasswordForm email={email} />
      </div>
    </main>
  );
}