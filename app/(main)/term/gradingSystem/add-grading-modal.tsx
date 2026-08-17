"use client";

import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { GradingEntryValues } from "./grading-system-card";
import { LoadingButton } from "@/shared-components/loading-button";

type AddGradingModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<GradingEntryValues>;
    onSubmit: (values: GradingEntryValues) => void;
    loading: boolean;
};

export function AddGradingModal({ open, onOpenChange, form, onSubmit, loading }: AddGradingModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-left">Add Grading</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 space-y-4">

                            {/* Grade */}
                            <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Grade</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="A" className="h-10 md:h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Min Score */}
                            <FormField
                                control={form.control}
                                name="minScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Min Score</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                className="h-10 md:h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Max Score */}
                            <FormField
                                control={form.control}
                                name="maxScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Max Score</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                className="h-10 md:h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Footer */}
                        <DialogFooter>
                            {/* Cancel Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="cursor-pointer h-10 md:h-12"
                            >
                                Cancel
                            </Button>
                            {/* Add Grading Button */}
                            <LoadingButton
                                type="submit"
                                disabled={loading || !form.formState.isDirty}
                                loading={loading}
                                className="cursor-pointer h-10 md:h-12">
                                Add Grading
                            </LoadingButton>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}
