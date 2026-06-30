"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shadcn/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { AddSubjectValues } from "./subjects-form";
import { LoadingButton } from "@/shared-components/loading-button";

type AddSubjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addForm: UseFormReturn<AddSubjectValues>;
  onSubmit: (values: AddSubjectValues) => Promise<void>;
  loading: boolean;
  readOnly?: boolean;
  departmentOptions: string[];
};

export function AddSubjectModal({
  open,
  onOpenChange,
  addForm,
  onSubmit,
  loading,
  readOnly = false,
  departmentOptions,
}: AddSubjectModalProps) {
  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Dialog Header */}
        <DialogHeader>
          <DialogTitle className="text-left">Add Subject</DialogTitle>
          <hr className="my-2" />
        </DialogHeader>

        {/* Form */}
        <Form {...addForm}>
          <form onSubmit={addForm.handleSubmit(onSubmit)}>
            <div className="space-y-6">

              {/* Subject Name */}
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={addForm.control}
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
                  control={addForm.control}
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

            <DialogFooter className="mt-4">
              <div className="grid grid-cols-2 justify-between gap-2">

                {/* Cancel Button */}
                <Button
                  disabled={loading || !addForm.formState.isDirty}
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer h-10 md:h-12"
                >
                  Cancel
                </Button>

                {/* Add Subject Button */}
                {!readOnly && (
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    disabled={!addForm.formState.isDirty}
                    className="cursor-pointer h-10 md:h-12">
                    Add Subject
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
