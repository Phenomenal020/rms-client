"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────
type StudentEnrolModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Display name of the student being enrolled */
    studentName: string;
    subjectOptions: string[];
    /** Currently enrolled subjects — used to seed the checkboxes on open */
    initialSubjects?: string[];
    onSave: (subjects: string[]) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────
export function StudentEnrolModal({
    open,
    onOpenChange,
    studentName,
    subjectOptions,
    initialSubjects = [],
    onSave,
}: StudentEnrolModalProps) {
    const [checked, setChecked] = useState<string[]>([]);

    // Sync checkbox state whenever the modal opens
    useEffect(() => {
        if (open) setChecked([...initialSubjects]);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const allSelected = checked.length === subjectOptions.length;

    function toggle(subject: string) {
        setChecked((prev) =>
            prev.includes(subject)
                ? prev.filter((s) => s !== subject)
                : [...prev, subject]
        );
    }

    function handleSave() {
        onSave(checked);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Subject Enrolment</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {studentName} — select subjects to enrol in
                    </p>
                    <hr className="my-2" />
                </DialogHeader>

                {/* Select-all toggle + count */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">
                        {checked.length} of {subjectOptions.length} selected
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setChecked(allSelected ? [] : [...subjectOptions])}
                        className="h-8 text-xs cursor-pointer"
                    >
                        {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                </div>

                {/* 2-column checkbox grid */}
                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 rounded-md border border-border p-2 max-h-60 overflow-y-auto">
                    {subjectOptions.map((subject) => (
                        <label
                            key={subject}
                            htmlFor={`enrol-${subject}`}
                            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer select-none"
                        >
                            <Checkbox
                                id={`enrol-${subject}`}
                                checked={checked.includes(subject)}
                                onCheckedChange={() => toggle(subject)}
                            />
                            <span className="text-sm text-foreground">{subject}</span>
                        </label>
                    ))}
                </div>

                <hr className="my-2" />

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 md:h-12 cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="h-10 md:h-12 cursor-pointer"
                    >
                        <BookOpen className="h-3 w-3" />
                        Save Enrolment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
