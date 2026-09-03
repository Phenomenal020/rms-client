// forgot-password/page.tsx
import { ForgotPasswordForm } from "./forgot-password-form";

// seo metadata for the forgot password page
export const metadata = {
  title: "Forgot Password",
  description: "Forgot your password? Enter your email and we'll send you a reset code.",
};

// forgot password page
export default function ForgotPasswordPage() {

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      {/* Forgot Password Form */}
      <ForgotPasswordForm />
    </main>
  );
}
