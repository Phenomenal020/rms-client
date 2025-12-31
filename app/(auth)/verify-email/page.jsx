import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";
import { ResendVerificationButton } from "./resend-verification-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/ui/card";
import { MailIcon } from "lucide-react";

export const metadata = {
  title: "Verify Email",
  description: "Verify your email address to save changes",
};

export default async function VerifyEmailPage() {
  const session = await getServerSession();
  const user = session?.user;

  // if the user tries to access this page without being logged in, redirect to sign in
  if (!user) redirect("/sign-in");

  // if the user is already verified, redirect to the settings profile page
  if (user.emailVerified) redirect("/settings/profile");

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-md">
        {/* Card Header */}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <MailIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-lg md:text-xl">Verify your email</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            A verification email was sent to <span className="font-medium">{user.email}</span>. 
            Please check your inbox and click the verification link.
          </CardDescription>
        </CardHeader>

        {/* Resend Verification Button */}
        <CardContent>
          <ResendVerificationButton email={user.email} />
        </CardContent>
      </Card>
    </main>
  );
}