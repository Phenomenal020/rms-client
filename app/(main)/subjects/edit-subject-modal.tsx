"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { AddSubjectValues } from "./subjects-form";

type EditSubjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<AddSubjectValues>;
  onSubmit: (values: AddSubjectValues) => void;
  loading: boolean;
  departmentOptions: string[];
};

export function EditSubjectModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  loading,
  departmentOptions,
}: EditSubjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <hr className="my-2" />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="subjectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-muted-foreground">Subject Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mathematics" {...field} className="h-12 md:h-14" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-muted-foreground">Department</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || "none"}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-12 md:h-14 w-full">
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

            <hr className="my-4" />

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer h-12 md:h-14"
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading} className="cursor-pointer h-12 md:h-14">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
