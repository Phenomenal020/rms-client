// forgot-password/page.tsx
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 flex-col">
      <div className="w-full max-w-md space-y-6">

        {/* Title and Description */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Forgot password?</h1>
          <p className="text-muted-foreground">
            Enter your email and we'll send you a reset code.
          </p>
        </div>

        {/* Forgot Password Form */}
        <ForgotPasswordForm />
      </div>
    </main>
  );
}