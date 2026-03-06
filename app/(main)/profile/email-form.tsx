"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { authClient } from "@/src/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// schema for the email change form: expects only the new email address
export const updateEmailSchema = z.object({
  newEmail: z.string().email({ message: "Enter a valid email" }),
});

// Type for form values - infer the type from the schema
type UpdateEmailFormValues = z.infer<typeof updateEmailSchema>;

// Props interface for EmailForm
interface EmailFormProps {
  currentEmail: string
}

export function EmailForm({ currentEmail }: EmailFormProps) {

  // state for the email change form: isEditing is false by default (so the email input is disabled)
  const [isEditing, setIsEditing] = useState(false);

  // useform hook for the email change form: uses the zod resolver and the default values for the new email address
  const form = useForm({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  // on click the change email button, set isEditing to true (so the email input is enabled)
  function handleChangeEmailClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsEditing(true);
  }

  // on submit the email change form, send a verification email to the new email address and reset the form
  async function onSubmit({ newEmail }: UpdateEmailFormValues) {

    const { error } = await authClient.changeEmail({
      newEmail: newEmail.trim(),
      callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL}/settings/profile`, // redirect to the settings profile page after the email is verified
    });

    if (error) {
      toast.error("Failed to initiate email change");
    } else {
      toast.success("Verification email sent to your new email address. Please check your inbox to confirm the change.");
      form.reset();   // Reset form after successful submission
      setIsEditing(false);
    }
  }

  // loading state for the email change form: is true when the form is submitting (disables the change email button and shows a loading spinner)
  const loading = form.formState.isSubmitting;

  return (
    <Card className="border shadow-md">
      {/* Card Content */}
      <CardContent className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Email Address Section */}
            <div className="space-y-4">

              {/* Email Address Section subheading (h3) */}
              <div className="pb-2 border-b border-border">
                <h4 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Email Address</h4>
              </div>

              {/* Current Email Section: conditionally renders the 'change email' button or the 'request change' button */}
              <div>
                <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">Current Email</FormLabel>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <Input
                    type="email"
                    disabled
                    value={currentEmail}
                    className="flex-1 h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary bg-muted p-2"
                  />
                  {!isEditing ? (
                    <LoadingButton
                      type="button"
                      onClick={handleChangeEmailClick}
                      loading={false}
                      disabled={false}
                      className="h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap w-full sm:w-auto"
                    >
                      Change Email
                    </LoadingButton>
                  ) : (
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      disabled={false}
                      className="h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap w-full sm:w-auto"
                    >
                      Request Change
                    </LoadingButton>
                  )}
                </div>
              </div>

              {/* New Email Input Field */}
              <FormField
                control={form.control}
                name="newEmail"
                render={({ field }: { field: ControllerRenderProps<UpdateEmailFormValues, "newEmail"> }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">New Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter new email address"
                        disabled={!isEditing}
                        className={`h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary ${!isEditing ? "bg-muted" : ""
                          }`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}