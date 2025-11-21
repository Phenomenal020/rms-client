import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, ArrowLeft, ArrowRight } from "lucide-react";

export const StudentSelection = ({ 
    goToPreviousStudent, 
    goToNextStudent, 
    currentStudentIndex, 
    setCurrentStudentIndex, 
    students = [], 
    setSelectedStudent, 
    selectedStudent 
}) => {
    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">

                    {/* Student Selection Dropdown - updates the selected student and the current student index */}
                    <div className="flex items-center gap-4">
                        {/* Student Icon */}
                        <User className="w-5 h-5 text-gray-600" />
                        {/* Student Selection Dropdown */}
                        <Select
                        // convert the selected student _id to a string or ""
                            value={selectedStudent?._id?.toString() || ""}
                            onValueChange={(value) => {
                                // find the student with the given _id
                                const student = students.find(
                                    (s) => s._id.toString() === value 
                                );
                                // if the student is found, update the selected student and the current student index
                                if (student) {
                                    setSelectedStudent(student);
                                    setCurrentStudentIndex(
                                        students.findIndex((s) => s._id === student._id)
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
                                    students.map((student) => (
                                        <SelectItem
                                            key={student._id}
                                            value={student._id.toString()}
                                        >
                                            {/* Render the student name  */}
                                            {student.name}
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