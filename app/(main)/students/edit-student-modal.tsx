"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { BookOpen } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { EditStudentValues, ClassOption } from "./students-form";
import { LoadingButton } from "@/shared-components/loading-button";

type EditStudentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editForm: UseFormReturn<EditStudentValues>;
    onSubmit: (values: EditStudentValues) => Promise<void>;
    loading: boolean;
    readOnly?: boolean;
    classOptions: ClassOption[];
};

export function EditStudentModal({
    open,
    onOpenChange,
    editForm,
    onSubmit,
    loading,
    readOnly = false,
    classOptions,
}: EditStudentModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-left">Edit Student</DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(onSubmit)}>
                        <div className="space-y-4">

                            {/* First name + Middle name */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 space-y-4 md:space-y-0">
                                <FormField
                                    control={editForm.control}
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
                                    control={editForm.control}
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
                                    control={editForm.control}
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
                                    control={editForm.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">Gender</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
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

                            {/* Status + Class */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 space-y-4 md:space-y-0">
                                <FormField
                                    control={editForm.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">Status</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                                                    <SelectTrigger className="h-10 md:h-12 w-full cursor-pointer">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="classId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-muted-foreground">Class</FormLabel>
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
                        </div>

                        <DialogFooter className="mt-4">
                            <div className={`grid ${readOnly ? "grid-cols-1" : "grid-cols-2"} justify-between gap-2`}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading || (!readOnly && !editForm.formState.isDirty)}
                                    onClick={() => onOpenChange(false)}
                                    className="cursor-pointer h-10 md:h-12"
                                >
                                    {readOnly ? "Close" : "Cancel"}
                                </Button>
                                {!readOnly && (
                                    <LoadingButton
                                        type="submit"
                                        disabled={loading || !editForm.formState.isDirty}
                                        loading={loading}
                                        className="cursor-pointer h-10 md:h-12"
                                    >
                                        <BookOpen className="h-3 w-3" />
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
