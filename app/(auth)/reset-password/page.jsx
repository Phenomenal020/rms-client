import { ResetPasswordForm } from "./reset-password-form";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage({ searchParams }) {

  // get the token from the search params
  const token = searchParams?.token;
  if (!token) redirect("/forgot-password?error=missing_token");

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-muted-foreground">Enter your new password below.</p>
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
}



