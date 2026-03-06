"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { AddTermValues } from "./term-setup-card";

type AddTermModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<AddTermValues>;
    onSubmit: (values: AddTermValues) => void;
    loading: boolean;
};

export function AddTermModal({ open, onOpenChange, form, onSubmit, loading }: AddTermModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-left">Add Term</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Term Name */}
                        <FormField
                            control={form.control}
                            name="termName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-muted-foreground">Term Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="First Term" className="h-10 md:h-12" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Academic Year */}
                        <FormField
                            control={form.control}
                            name="academicYear"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-muted-foreground">Academic Year (Session)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="2024/2025" className="h-10 md:h-12" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Start Date and End Date */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                            {/* Start Date */}
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-semibold text-muted-foreground">Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "h-10 md:h-12 w-full justify-between pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground",
                                                        )}
                                                    >
                                                        {field.value
                                                            ? format(field.value, "MMM d, yyyy")
                                                            : <span>Pick a date</span>
                                                        }
                                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* End Date */}
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-semibold text-muted-foreground">End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "h-10 md:h-12 w-full justify-between pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground",
                                                        )}
                                                    >
                                                        {field.value
                                                            ? format(field.value, "MMM d, yyyy")
                                                            : <span>Pick a date</span>
                                                        }
                                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Term Days */}
                        <FormField
                            control={form.control}
                            name="termDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-muted-foreground">Term Days</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="e.g. 70"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                                            }
                                            className="h-10 md:h-12"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <hr className="my-2" />

                        {/* Footer */}
                        <DialogFooter>
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
                                Add Term
                            </Button>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}
