import { redirect } from "next/navigation";
import { Verify2FAForm } from "./verify-2fa-form";

// metadata for the page
export const metadata = {
    title: "Two-Factor Verification",
    description: "Enter your verification code to complete sign-in",
};

// verify 2fa page
export default async function Verify2FAPage({
    searchParams,
}: {
    searchParams: Promise<{ email?: string }>;
}) {
    // get the email from the search params
    let { email } = await searchParams;

    // if no email is provided, redirect to the sign in page
    if (!email) {
        redirect("/sign-in");
        // email = "alphask37@example.com";
    }

    // Otherwise, return the verify 2fa form
    return (
        <main className="flex min-h-svh items-center justify-center px-4">
            <Verify2FAForm email={email} />
        </main>
    );
}
