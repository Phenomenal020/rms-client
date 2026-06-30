"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { EditSubjectValues } from "./subjects-form";
import { LoadingButton } from "@/shared-components/loading-button";

type EditSubjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: UseFormReturn<EditSubjectValues>;
  onSubmit: (values: EditSubjectValues) => void;
  loading: boolean;
  readOnly?: boolean;
  departmentOptions: string[];
};

export function EditSubjectModal({
  open,
  onOpenChange,
  editForm,
  onSubmit,
  loading,
  readOnly = false,
  departmentOptions,
}: EditSubjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <hr className="my-2" />
        </DialogHeader>

        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onSubmit)}>
            <div className="space-y-6">

              {/* Subject Name */}
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-muted-foreground">Subject Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mathematics" {...field} className="h-10 md:h-12" disabled={readOnly || loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Department */}
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={editForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-muted-foreground">Department</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || "none"}
                          onValueChange={field.onChange}
                          disabled={readOnly || loading}
                        >
                          <SelectTrigger className="h-10 md:h-12 w-full">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dialog Footer: Save Changes and Cancel Buttons */}
            <DialogFooter className="mt-4">
              <div className="grid grid-cols-2 justify-between gap-2">
                {/* Cancel Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading || !editForm.formState.isDirty}
                  className="cursor-pointer h-10 md:h-12"
                >
                  Cancel
                </Button>

                {/* Save Changes Button */}
                {!readOnly && (
                  <LoadingButton
                    type="submit"
                    disabled={loading || !editForm.formState.isDirty}
                    loading={loading}
                    className="cursor-pointer h-10 md:h-12">
                    Save Changes
                  </LoadingButton>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
