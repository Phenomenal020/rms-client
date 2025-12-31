import { SignUpForm } from "./sign-up-form";
import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";

// metadata for the sign up page
export const metadata = {
  title: "Sign up",
  description: "Sign up for a teacher account",
};

// sign up page component
export default async function SignUp() {
  const session = await getServerSession();
  const user = session?.user;

  if (user) {
    if (user.emailVerified) redirect("/settings/profile");
    else redirect("/verify-email");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignUpForm />
    </main>
  );
}