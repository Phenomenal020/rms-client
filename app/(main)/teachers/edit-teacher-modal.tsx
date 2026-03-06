"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import { Switch } from "@/shadcn/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { TeacherInvitationStatus } from "@/types/teachers";
import type { EditTeacherValues } from "./teachers-form";
import { statusConfig } from "./teachers-form";

// Statuses where revocation is not applicable
const NON_REVOKABLE: TeacherInvitationStatus[] = ["REVOKED", "ACCEPTED", "UNSENT"];

// Edit Teacher Modal Props
type EditTeacherModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditTeacherValues>;
  onSubmit: (values: EditTeacherValues) => void;
  onRevoke: () => void;
  loading: boolean;
  // Read-only fields displayed for context (not part of the editable form)
  teacher: { email: string; status: TeacherInvitationStatus } | null;
};

// Edit Teacher Modal — title and full name are editable; email, status are read-only
export function EditTeacherModal({ open, onOpenChange, form, onSubmit, onRevoke, loading, teacher }: EditTeacherModalProps) {

    // Check if the teacher can be revoked (status is not REVOKED, ACCEPTED, or UNSENT)
  const canRevoke = teacher ? !NON_REVOKABLE.includes(teacher.status) : false;

  // Get the status label and class name for the teacher's status
  const { label: statusLabel, className: statusClassName } = teacher
    ? statusConfig[teacher.status]
    : { label: "", className: "" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>

        {/* Dialog Header */}
        <DialogHeader>
          <DialogTitle className="text-left">Edit Teacher</DialogTitle>
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
                      <Input placeholder="Full name" {...field} className="h-10 md:h-12" required />
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

              {/* Email — read-only */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Email</p>
                <Input
                  value={teacher?.email ?? ""}
                  readOnly
                  disabled
                  className="h-10 md:h-12 cursor-not-allowed opacity-60"
                />
              </div>

              {/* Status — read-only badge */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Status</p>
                <div className="flex h-10 md:h-12 items-center">
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium opacity-80 ${statusClassName}`}
                  >
                    {statusLabel}
                  </Badge>
                </div>
              </div>

              {/* Revoke toggle — only shown when revocation is applicable */}
              {canRevoke && (
                <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 p-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Revoke Invitation</p>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={(checked) => { if (checked) onRevoke(); }}
                    disabled={loading}
                    aria-label="Revoke invitation"
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>
              )}

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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}