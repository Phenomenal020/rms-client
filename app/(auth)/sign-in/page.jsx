import { SignInForm } from "./sign-in-form";
import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your teacher account",
};

export default async function SignIn() {
  const session = await getServerSession();
  const user = session?.user;

  if (user) {
    if (user.emailVerified) redirect("/settings/profile");
    else redirect("/verify-email");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}

