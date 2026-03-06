"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Switch } from "@/shadcn/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { AddTeacherValues } from "./teachers-form";

// Teacher Modal Props
type TeacherModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<AddTeacherValues>;
  onSubmit: (values: AddTeacherValues) => Promise<void>;
  loading: boolean;
};

// Teacher Modal Component
export function TeacherModal({ open, onOpenChange, form, onSubmit, loading }: TeacherModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>

        {/* Dialog Header */}
        <DialogHeader>
          <DialogTitle className="text-left">Add Teacher</DialogTitle>
          <hr className="my-2" />
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-muted-foreground">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} className="h-10 md:h-12" required/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-muted-foreground">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Mr, Mrs, Miss, Dr, etc." {...field} className="h-10 md:h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="staff@school.edu" {...field} className="h-10 md:h-12" required/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Send Registration Email Toggle */}
              <FormField
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-3 gap-4">
                    <div className="space-y-1.5">
                      <FormLabel className="font-semibold text-muted-foreground cursor-pointer">
                        Send registration email
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

            </div>

            {/* Divider */}
            <hr className="my-4" />

            {/* Dialog Footer */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer h-10 md:h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer h-10 md:h-12"
              >
                Add Teacher
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}