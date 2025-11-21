import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";

export const SubjectSelection = ({ 
    goToPreviousSubject, 
    goToNextSubject, 
    currentSubjectIndex, 
    setCurrentSubjectIndex, 
    subjects = [], 
    setSelectedSubject, 
    selectedSubject 
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
                            value={selectedSubject || ""}
                            onValueChange={(value) => {
                                // if the subject is found, update the selected subject and the current subject index
                                if (value) {
                                    setSelectedSubject(value);
                                    setCurrentSubjectIndex(
                                        subjects.findIndex((s) => s === value)
                                    );
                                }
                            }}
                        >
                            {/* Select Dropdown Trigger */}
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            {/* Select Dropdown Content */}
                            <SelectContent>
                                {subjects && subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                        <SelectItem
                                            key={subject}
                                            value={subject}
                                        >
                                            {/* Render the subject name  */}
                                            {subject}
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
                            disabled={currentSubjectIndex === 0 || !subjects || subjects.length === 0}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        {/* Next Subject Button */}
                        <Button
                            onClick={goToNextSubject}
                            disabled={!subjects || currentSubjectIndex === subjects.length - 1}
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

