import { SignUpForm } from "./sign-up-form";

// metadata for the sign up page
export const metadata = {
  title: "Sign up",
  description: "Sign up to join the RMS platform as an administrator or a teacher",
};

// sign up page component
export default async function SignUp() {

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <SignUpForm />
      {/* <AuthBlock /> */}
    </main>
  );
}