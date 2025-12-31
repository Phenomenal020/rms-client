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
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";

export const updateEmailSchema = z.object({
  newEmail: z.email({ message: "Enter a valid email" }),
});
// 

export function EmailForm({ currentEmail }) {

  const [isEditing, setIsEditing] = useState(false);
  const newEmailInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  // useEffect(() => {
  //   if (isEditing && newEmailInputRef.current) {
  //     // Use setTimeout to ensure the input is enabled and rendered before focusing
  //     const timer = setTimeout(() => {
  //       newEmailInputRef.current?.focus();
  //     }, 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isEditing]);

  function handleChangeEmailClick(e) {
    e.preventDefault();
    setIsEditing(true);
  }

  async function onSubmit({ newEmail }) {

    const { error } = await authClient.changeEmail({
      newEmail,
      callbackURL: "/settings/profile",
    });

    if (error) {
      toast.error("Failed to initiate email change");
    } else {
      toast.success("Verification email sent to your new email address. Please check your inbox to confirm the change.");
      // Reset form after successful submission
      // form.reset();
      setIsEditing(false);
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <Card className="border shadow-md h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          Email Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {/* Current Email Section */}
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
                        ref={(e) => {
                          field.ref(e);
                          newEmailInputRef.current = e;
                        }}
                        type="email"
                        placeholder="Enter new email address"
                        disabled={!isEditing}
                        className={`transition-colors hover:border-gray-400 focus:border-primary ${
                          !isEditing ? "bg-gray-50" : ""
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