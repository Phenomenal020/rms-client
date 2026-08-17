"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import type { EnrollmentStudent } from "./enrollment-form";
import type { subjectAssignment } from "@/types/enrollments";
import { LoadingButton } from "@/shared-components/loading-button";

type EditEnrollmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: EnrollmentStudent | null;
    // All subjects assigned to the selected class
    classAssignments: subjectAssignment[];
    onSave: (studentId: string, subjectIds: string[]) => void;
    readOnly?: boolean;
    isSavingEnrollment: boolean;
};

export function EditEnrollmentModal({
    open,
    onOpenChange,
    student,
    classAssignments,
    onSave,
    readOnly = false,
    isSavingEnrollment,
}: EditEnrollmentModalProps) {

    // create a set of checked subject ids to track enrollment changes.
    // Call checkedIds.has(subjectId) to check if a student is enrolled in a subject.
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const initialIds = student?.enrolledSubjectIds ?? [];
    const isDirty =
        checkedIds.size !== initialIds.length ||
        initialIds.some((id) => !checkedIds.has(id));

    // Pre-populate checkboxes from enrollments that belong to this class
    useEffect(() => {
        if (student) {
            const allowed = new Set(classAssignments.map((a) => a.assignmentId));
            setCheckedIds(new Set(student.enrolledSubjectIds.filter((id) => allowed.has(id))));
        }
    }, [student, open, classAssignments]);

    // Toggle enrollment
    function toggle(id: string) {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    // Call the save enrollment handler and close the modal
    function handleSave() {
        if (!student) return;
        onSave(student.studentId, Array.from(checkedIds));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-left">
                        Edit Enrollment — {student?.name ?? ""}
                    </DialogTitle>
                    <hr className="my-2" />
                </DialogHeader>

                {/* Subject checkboxes */}
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Select the subjects to enroll this student in for this class.
                    </p>

                    {classAssignments.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground">
                            No subjects are assigned to this class yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {classAssignments.map((assignment) => (
                                <div key={assignment.assignmentId} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`enroll-${assignment.assignmentId}`}
                                        checked={checkedIds.has(assignment.assignmentId)}
                                        disabled={readOnly}
                                        onCheckedChange={() => toggle(assignment.assignmentId)}
                                    />
                                    <Label
                                        htmlFor={`enroll-${assignment.assignmentId}`}
                                        className="cursor-pointer text-sm font-normal"
                                    >
                                        {assignment.subjectName}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* <hr className="my-2" /> */}

                {/* Footer */}
                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSavingEnrollment}
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer h-10 md:h-12"
                    >
                        {readOnly ? "Close" : "Cancel"}
                    </Button>
                    {!readOnly && (
                        <LoadingButton
                            loading={isSavingEnrollment}
                            onClick={handleSave}
                            className="cursor-pointer h-10 md:h-12"
                            disabled={isSavingEnrollment || !isDirty}
                        >
                            Save Enrollment
                        </LoadingButton>
                    )}
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
