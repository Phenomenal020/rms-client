import { SignInForm } from "./sign-in-form";
import { authClient } from "@/src/auth-client";
// import { getServerSession } from "@/src/lib/get-session";
// import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your teacher account",
};

export default async function SignIn() {
  // const { data: session } = authClient.useSession();
  // const user = session?.user;

  // // TODO: Change this to use a middleware instead
  // if (user) {
  //   if (user.emailVerified) redirect("/settings/profile");
  //   else redirect("/verify-email");
  // }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}