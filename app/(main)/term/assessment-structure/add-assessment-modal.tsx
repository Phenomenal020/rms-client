"use client";

import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { AssessmentStructureValues } from "./assessment-structure-card";
import { LoadingButton } from "@/shared-components/loading-button";


type AddAssessmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<AssessmentStructureValues>;
    onSubmit: (values: AssessmentStructureValues) => void;
    loading: boolean;
    remainingPercentage: number;
};
export function AddAssessmentModal({ open, onOpenChange, form, onSubmit, loading, remainingPercentage }: AddAssessmentModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-left">Add Assessment</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                {/* Remaining percentage hint */}
                <p className="text-xs text-muted-foreground -mt-1">
                    Remaining: <span className="font-semibold text-foreground">{remainingPercentage}%</span>
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                            {/* Type */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Type</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Eg, CA" className="h-10 md:h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Percentage */}
                            <FormField
                                control={form.control}
                                name="percentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Percentage</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                className="h-10 md:h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Order */}
                            <FormField
                                control={form.control}
                                name="displayOrder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
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

                        {/* <hr className="my-2" /> */}

                        {/* Footer */}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="cursor-pointer h-10 md:h-12 mt-2"
                            >
                                Cancel
                            </Button>
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                disabled={loading || !form.formState.isDirty}
                                className="cursor-pointer h-10 md:h-12">
                                Add Assessment
                            </LoadingButton>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}
