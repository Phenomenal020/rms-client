"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { PasswordInput } from "@/shared-components/password-input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Input } from "@/shadcn/ui/input";
import { authClient } from "@/src/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { passwordSchema } from "@/src/passwordSchema";
import { Mail, Key, User } from "lucide-react";

// use zod schema to validate the signup form
const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    email: z.email({ message: "Please enter a valid email" }),
    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .trim()
      .min(1, { message: "Please confirm password" }),
    signUpRole: z.enum(["SCHOOL_ADMIN", "TEACHER"]).default("TEACHER")
  })
  // use.refine for cross-field validation (password and password confirmation)
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
  type SignUpFormData = z.infer<typeof signUpSchema>;

// sign up form component
export function SignUpForm() {
  // useRouter hook for navigation
  const router = useRouter();

  // use the useForm hook to create the form state and validation
  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema), // specify a resolver
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      signUpRole: "TEACHER",
    },  // set default values for the form
  });

  // when the user submits the form
  async function onSubmit(formData: SignUpFormData) {
    // Extract data from the form
    const { email, password, firstName, lastName, signUpRole } = formData;

    // use the authClient to sign up the user
    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      signUpRole: signUpRole as "SCHOOL_ADMIN" | "TEACHER"
    });

    if (signUpError) {
      // Intentionally vague — do not reveal whether the email is already registered
      toast.error("Something went wrong. Please check your details and try again.");
      return;
    } else {
      // Intentionally vague — same message regardless of account state
      toast.success("Check your email for a verification code to complete the sign up.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  }

  // Track form loading state
  const formLoading = signUpForm.formState.isSubmitting;

  return (
    <div className="flex h-screen min-h-[800px] w-full max-w-[1280px] overflow-y-auto mx-auto">

      {/* Sign Up Form */}
      <div className="w-full max-w-[776px] h-full flex flex-col items-center justify-center p-4 relative mx-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-left">Sign Up</h1>

          {/* Form */}
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name Field with Icon */}
              <FormField
                control={signUpForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="First name"
                          className="h-14 pl-12 pr-4 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name Field with Icon */}
              <FormField
                control={signUpForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Last name"
                          className="h-14 pl-12 pr-4 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field with Icon */}
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Your email"
                          className="h-14 pl-12 pr-4 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
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
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <PasswordInput
                          autoComplete="new-password"
                          placeholder="Password"
                          className="h-14 pl-12 pr-12 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field with Icon */}
              <FormField
                control={signUpForm.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <PasswordInput
                          autoComplete="new-password"
                          placeholder="Confirm password"
                          className="h-14 pl-12 pr-12 rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Field with Icon */}
              <FormField
                control={signUpForm.control}
                name="signUpRole"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} >
                        <SelectTrigger className="h-14 w-full rounded-sm border-border focus:border-primary focus:ring-primary text-base font-[600] text-muted-foreground">
                          <SelectValue placeholder="Sign up as" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SCHOOL_ADMIN" className="text-base font-[600] text-muted-foreground">Admin</SelectItem>
                          <SelectItem value="TEACHER" className="text-base font-[600] text-muted-foreground">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sign Up Button */}
              <div className="flex flex-col gap-2">
                <LoadingButton
                  type="submit"
                  className="w-full h-12 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                  loading={formLoading}
                >
                  Create Account
                </LoadingButton>
              </div>
            </form>
          </Form>

          {/* Sign In Link */}
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}