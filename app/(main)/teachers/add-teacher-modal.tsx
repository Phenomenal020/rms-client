"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { AddTeacherValues } from "./teachers-form";
import { LoadingButton } from "@/shared-components/loading-button";

type TeacherModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<AddTeacherValues>;
    addMember: (values: AddTeacherValues) => Promise<void>;
    loading: boolean;
    readOnly?: boolean;
};

export function TeacherModal({
    open,
    onOpenChange,
    form,
    addMember,
    loading,
    readOnly = false,
}: TeacherModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-left">Add Teacher</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(addMember)}>
                        <div className="space-y-4">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="staff@school.edu"
                                                {...field}
                                                className="h-10 md:h-12"
                                                required
                                                disabled={readOnly || loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Cancel/Add Teacher Buttons */}
                        <DialogFooter className="pt-4">
                            {/* Cancel Button */}
                            <LoadingButton
                                loading={false}
                                disabled={loading || form.formState.isSubmitting}
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="cursor-pointer h-10 md:h-12"
                            >
                                Cancel
                            </LoadingButton>

                            {/* Add Teacher Button */}
                            {!readOnly && (
                                <LoadingButton
                                    loading={loading || form.formState.isSubmitting}
                                    type="submit"
                                    className="cursor-pointer h-10 md:h-12"
                                >
                                    Add Teacher
                                </LoadingButton>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
