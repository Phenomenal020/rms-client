"use client";

import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";

// schema for the email change form: expects only the new email address
export const updateEmailSchema = z.object({
  newEmail: z.email({ message: "Enter a valid email" }),
});

export function EmailForm({ currentEmail }) {

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
  function handleChangeEmailClick(e) {
    e.preventDefault();
    setIsEditing(true);
  }

  // on submit the email change form, send a verification email to the new email address and reset the form
  async function onSubmit({ newEmail }) {

    const { error } = await authClient.changeEmail({
      newEmail: newEmail.trim(),
      callbackURL: "/settings/profile", // redirect to the settings profile page after the email is verified
    });

    if (error) {
      toast.error("Failed to initiate email change");
    } else {
      toast.success("Verification email sent to your new email address. Please check your inbox to confirm the change.");
      // Reset form after successful submission
      form.reset();
      setIsEditing(false);
    }
  }

  // loading state for the email change form: is true when the form is submitting (disables the change email button and shows a loading spinner)
  const loading = form.formState.isSubmitting;

  return (
    <Card className="border shadow-md h-full">

      {/* Card Header > Email Address */}
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          Email Address 
        </CardTitle>
      </CardHeader>

      {/* Card Content > Email Change Form */}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">

              {/* Current Email Section: conditionally renders the 'change email' button or the 'request change' button */}
              <div>
                <FormLabel className="text-gray-700 font-semibold">Current Email</FormLabel>
                <div className="flex gap-3 mt-2">
                  <Input
                    type="email"
                    disabled
                    value={currentEmail}
                    className="flex-1 transition-colors hover:border-gray-400 focus:border-primary bg-gray-50"
                  />
                  {!isEditing ? (
                    <LoadingButton
                      type="button"
                      onClick={handleChangeEmailClick}
                      className="h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap"
                    >
                      Change Email
                    </LoadingButton>
                  ) : (
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      className="h-10 font-medium shadow-sm hover:shadow transition-shadow cursor-pointer whitespace-nowrap"
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">New Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter new email address"
                        disabled={!isEditing}
                        className={`transition-colors hover:border-gray-400 focus:border-primary ${!isEditing ? "bg-gray-50" : ""
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