import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { User, ArrowLeft, ArrowRight } from "lucide-react";
import type { Student } from "@/types/drizzle";

// Interface for the StudentSelection component props
interface StudentSelectionProps {
    goToPreviousStudent: () => void;
    goToNextStudent: () => void;
    currentStudentIndex: number;
    setCurrentStudentIndex: (index: number) => void;
    students: Student[];
    setSelectedStudent: (student: Student | null) => void;
    selectedStudent: Student | null;
    isGlobalEditing: boolean;
}

// StudentSelection component
export function StudentSelection({
    goToPreviousStudent,
    goToNextStudent,
    currentStudentIndex,
    setCurrentStudentIndex,
    students = [],  // default to an empty array
    setSelectedStudent,
    selectedStudent,
    isGlobalEditing,
}: StudentSelectionProps) {

    // Helper function to get the full name of a student
    const getName = (student: Student | null): string => {
        if (!student) return "";
        const parts = [
            student.firstName,
            student.middleName ? ` ${student.middleName[0]}. ` : "",
            student.lastName
        ].filter(Boolean);
        return parts.join(" ");
    }

    return (
        <Card className="mb-6">
            <CardContent className="p-2 md:p-4">
                <div className="flex items-center justify-between">

                    {/* Student Selection Dropdown - updates the selected student and the current student index */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4 w-[70%] text-sm md:text-base">

                        {/* Student Icon */}
                        {/* <User className="w-5 h-5 text-muted-foreground" /> */}

                        {/* Student Selection Dropdown - Show student names in a dropdown */}
                        <Select
                            value={getName(selectedStudent)}
                            onValueChange={(value) => {
                                // find the student with the given name
                                const student = students.find(
                                    (s) => getName(s) === value
                                );
                                // if the student is found, update the selected student and the current student index
                                if (student) {
                                    setSelectedStudent(student);
                                    setCurrentStudentIndex(
                                        students.findIndex((s) => getName(s) === value)
                                    );
                                }
                            }}
                        >
                            {/* Select Dropdown Trigger */}
                            <SelectTrigger className="w-48 sm:w-64">
                                <SelectValue placeholder="Select student" />
                            </SelectTrigger>

                            {/* Select Dropdown Content */}
                            <SelectContent>
                                {students && students.length > 0 ? (
                                    students.map((student, index) => (
                                        <SelectItem
                                            disabled={isGlobalEditing}
                                            key={index}
                                            value={getName(student)}
                                        >
                                            {/* Render the student name  */}
                                            {getName(student)}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="" disabled>No students available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>


                    {/* Previous and Next Student Buttons - navigate through the students */}
                    <div className="flex gap-1 sm:gap-2">
                        {/* Previous Student Button */}
                        <Button
                            onClick={goToPreviousStudent}
                            disabled={currentStudentIndex === 0 || !students || students.length === 0 || isGlobalEditing}
                            variant="outline"
                            size="icon-sm"
                            className="border-border text-foreground hover:bg-muted"
                        >
                            <ArrowLeft className="w-2 h-2 sm:w-4 sm:h-4" />
                        </Button>
                        {/* Next Student Button */}
                        <Button
                            onClick={goToNextStudent}
                            disabled={!students || currentStudentIndex === students.length - 1 || isGlobalEditing}
                            variant="outline"
                            size="icon-sm"
                            className="border-border text-foreground hover:bg-muted"
                        >
                            <ArrowRight className="w-2 h-2 sm:w-4 sm:h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}