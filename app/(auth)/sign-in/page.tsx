import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your teacher account",
};

export default async function SignIn() {

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}