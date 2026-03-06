"use client";

import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { GradingEntryValues } from "./grading-system-card";

type EditGradingModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<GradingEntryValues>;
    onSubmit: (values: GradingEntryValues) => void;
    loading: boolean;
};

export function EditGradingModal({ open, onOpenChange, form, onSubmit, loading }: EditGradingModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-left">Edit Grading</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

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
                                                // min={0}
                                                // max={100}
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
                                                // min={0}
                                                // max={100}
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

                        <hr className="my-2" />

                        {/* Footer */}
                        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="cursor-pointer h-10 md:h-12"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="cursor-pointer h-10 md:h-12">
                                Save Changes
                            </Button>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}
