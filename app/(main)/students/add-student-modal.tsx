"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { BookOpen } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { AddStudentValues, ClassOption } from "./students-form";
import { LoadingButton } from "@/shared-components/loading-button";

type AddStudentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    addForm: UseFormReturn<AddStudentValues>;
    onSubmit: (values: AddStudentValues) => Promise<void>;
    loading: boolean;
    readOnly?: boolean;
    classOptions: ClassOption[];
};

export function AddStudentModal({
    open,
    onOpenChange,
    addForm,
    onSubmit,
    loading,
    readOnly = false,
    classOptions,
}: AddStudentModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-left">Add Student</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(onSubmit)}>
                        <div className="space-y-4">

                            {/* First name + Middle name */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 space-y-4 md:space-y-0">
                                <FormField
                                    control={addForm.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} disabled={readOnly} className="h-10 md:h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="middleName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">Middle Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Michael (optional)" {...field} disabled={readOnly} className="h-10 md:h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Last name + Gender */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 space-y-4 md:space-y-0">
                                <FormField
                                    control={addForm.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} disabled={readOnly} className="h-10 md:h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">Gender</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-10 md:h-12 w-full cursor-pointer">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Male">Male</SelectItem>
                                                        <SelectItem value="Female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Class assignment */}
                            <FormField
                                control={addForm.control}
                                name="classId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Class on Enrollment (optional)</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value ?? "none"}
                                                onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                                                disabled={readOnly}
                                            >
                                                <SelectTrigger className="h-10 md:h-12 w-full cursor-pointer">
                                                    <SelectValue placeholder="Assign to a class..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No class</SelectItem>
                                                    {classOptions.map((cls) => (
                                                        <SelectItem key={cls.id} value={cls.id}>
                                                            {cls.name}
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

                        <DialogFooter className="mt-4">
                            <div className={`grid ${readOnly ? "grid-cols-1" : "grid-cols-2"} justify-between gap-2`}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading || (!readOnly && !addForm.formState.isDirty)}
                                    onClick={() => onOpenChange(false)}
                                    className="cursor-pointer h-10 md:h-12"
                                >
                                    {readOnly ? "Close" : "Cancel"}
                                </Button>
                                {!readOnly && (
                                    <LoadingButton
                                        type="submit"
                                        disabled={loading || !addForm.formState.isDirty}
                                        className="cursor-pointer h-10 md:h-12"
                                        loading={loading}
                                    >
                                        <BookOpen className="h-3 w-3" />
                                        Add Student
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
