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

export const StudentSelection = ({
    goToPreviousStudent,
    goToNextStudent,
    currentStudentIndex,
    setCurrentStudentIndex,
    students = [],  // default to an empty array
    setSelectedStudent,
    selectedStudent
}) => {

    // Helper function to get the full name of a student
    const getName = (student) => {
        return student?.firstName + student?.middleName ? `${student?.firstName} ${student?.middleName} ${student?.lastName}` : `${student?.firstName} ${student?.lastName}`;
    }

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">

                    {/* Student Selection Dropdown - updates the selected student and the current student index */}
                    <div className="flex items-center gap-4">

                        {/* Student Icon */}
                        <User className="w-5 h-5 text-gray-600" />

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
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select student" />
                            </SelectTrigger>

                            {/* Select Dropdown Content */}
                            <SelectContent>
                                {students && students.length > 0 ? (
                                    students.map((student, index) => (
                                        <SelectItem
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
                    <div className="flex gap-2">
                        {/* Previous Student Button */}
                        <Button
                            onClick={goToPreviousStudent}
                            disabled={currentStudentIndex === 0 || !students || students.length === 0}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        {/* Next Student Button */}
                        <Button
                            onClick={goToNextStudent}
                            disabled={!students || currentStudentIndex === students.length - 1}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}