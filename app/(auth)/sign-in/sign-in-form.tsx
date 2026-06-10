"use client";

// Use auth client to interact with the auth server
import { authClient } from '@/src/auth-client';
import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from '@/shadcn/ui/input';
import { Checkbox } from "@/shadcn/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, Key } from "lucide-react";

// use zod schema to validate the signin form
const signInSchema = z.object({
    email: z.email({ message: "Please enter a valid email" }),
    password: z.string().min(1, { message: "Password is required" }),
    rememberMe: z.boolean().optional(),
});

export function SignInForm() {
    // loading state
    const [loading, setLoading] = useState(false);

    // error state
    const [error, setError] = useState<string | null>(null);

    // router for redirects
    const router = useRouter();

    // use the useForm hook to create the form state and validation
    const form = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    // when the user submits the form
    async function onSubmit(formData: z.infer<typeof signInSchema>) {
        // on submit, clear the error state
        setError(null);

        // set the loading state to true
        setLoading(true);

        // Extract data from the form
        const { email, password, rememberMe } = formData;

        // use the authClient to sign in the user
        const { data, error } = await authClient.signIn.email(
            { email, password, rememberMe },
            {
                async onSuccess(context) {
                    // If the user has 2FA enabled, redirect to the verification page
                    if (context.data.twoFactorRedirect) {
                        router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
                    } else {
                        // No 2FA required — go straight to dashboard
                        toast.success("Sign in successful");
                        router.push("/dashboard");
                    }
                },
            }
        );

        // set the loading state to false
        setLoading(false);

        // if there is an error, set the error state and show a toast error message
        if (error) {
            const errorMessage = error.message || "Unable to sign in. Please check inputs and try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    }

    const formLoading = form.formState.isSubmitting;

    return (
        <div className="flex h-screen min-h-[640px] w-full max-w-[1280px] overflow-y-auto mx-auto">

            {/* Left Side - Login Form */}
            <div className="w-full max-w-[776px] h-full flex flex-col items-center justify-center p-4 relative mx-auto">
                <div className="w-full max-w-md space-y-8">
                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-left">Sign In</h1>

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field with Icon */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    placeholder="Your email"
                                                    className="h-14 pl-12 pr-4 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-medium text-muted-foreground"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field with Icon */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                                                <PasswordInput
                                                    autoComplete="current-password"
                                                    placeholder="Password"
                                                    className="h-14 pl-12 pr-12 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-medium text-muted-foreground"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center justify-end">
                                <FormField
                                    control={form.control}
                                    name="rememberMe"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2 cursor-pointer">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal cursor-pointer">
                                                Remember me
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>


                            {/* Error Message */}
                            {error && (
                                <div
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {error}
                                </div>
                            )}

                            {/* Login Button and Forgot Password Link */}
                            <div className="flex flex-col gap-2">
                                <LoadingButton
                                    type="submit"
                                    className="w-full h-14 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                                    loading={formLoading || loading}
                                >
                                    Sign In
                                </LoadingButton>
                                <Link
                                    href="/forgot-password"
                                    className="text-base font-semibold text-primary hover:underline text-right cursor-pointer w-fit"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Divider with "or" */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-base">
                                    <span className="bg-background px-4 text-muted-foreground">
                                        or
                                    </span>
                                </div>
                            </div>
                        </form>
                    </Form>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/sign-up"
                            className="text-primary font-semibold hover:underline cursor-pointer"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}