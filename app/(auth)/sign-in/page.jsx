import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}

