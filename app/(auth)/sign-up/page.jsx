import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Sign up",
};

export default function SignUp() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignUpForm />
    </main>
  );
}

