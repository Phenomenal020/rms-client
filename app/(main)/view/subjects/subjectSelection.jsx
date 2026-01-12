import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";

export const SubjectSelection = ({
    goToPreviousSubject,
    goToNextSubject,
    currentSubjectIndex,
    setCurrentSubjectIndex,
    subjectNames = [],
    setSelectedSubjectName,
    selectedSubjectName,
    isGlobalEditing
}) => {
    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">

                    {/* Subject Selection Dropdown - updates the selected subject and the current subject index */}
                    <div className="flex items-center gap-4">
                        {/* Subject Icon */}
                        <BookOpen className="w-5 h-5 text-gray-600" />
                        {/* Subject Selection Dropdown */}
                        <Select
                            value={selectedSubjectName || ""}
                            onValueChange={(value) => {
                                // if the subject is found, update the selected subject and the current subject index
                                if (value) {
                                    setSelectedSubjectName(value);
                                    setCurrentSubjectIndex(
                                        subjectNames.findIndex((subjectName) => subjectName === value)
                                    );
                                }
                            }}
                            disabled={isGlobalEditing}
                        >
                            {/* Select Dropdown Trigger */}
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select subject" />
                            </SelectTrigger>

                            {/* Select Dropdown Content */}
                            <SelectContent>
                                {subjectNames && subjectNames.length > 0 ? (
                                    subjectNames.map((subjectName) => (
                                        <SelectItem
                                            key={subjectName}
                                            value={subjectName}
                                        >
                                            {/* Render the subject name  */}
                                            {subjectName}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="" disabled>No subjects available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>


                    {/* Previous and Next Subject Buttons - navigate through the subjects */}
                    <div className="flex gap-2">
                        {/* Previous Subject Button */}
                        <Button
                            onClick={goToPreviousSubject}
                            disabled={currentSubjectIndex === 0 || !subjectNames || subjectNames.length === 0 || isGlobalEditing}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        {/* Next Subject Button */}
                        <Button
                            onClick={goToNextSubject}
                            disabled={!subjectNames || currentSubjectIndex === subjectNames.length - 1 || isGlobalEditing}
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

