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

// Interface for the SubjectSelection component props
interface SubjectSelectionProps {
    goToPreviousSubject: () => void;
    goToNextSubject: () => void;
    currentSubjectIndex: number;
    setCurrentSubjectIndex: (index: number) => void;
    subjectNames: string[];
    setSelectedSubjectName: (name: string | null) => void;
    selectedSubjectName: string | null;
    isGlobalEditing: boolean;
}

export const SubjectSelection = ({
    goToPreviousSubject,
    goToNextSubject,
    currentSubjectIndex,
    setCurrentSubjectIndex,
    subjectNames = [],
    setSelectedSubjectName,
    selectedSubjectName,
    isGlobalEditing
}: SubjectSelectionProps) => {
    return (
        <Card className="mb-6">
            <CardContent className="p-2 md:p-4">
                <div className="flex items-center justify-between">

                    {/* Subject Selection Dropdown - updates the selected subject and the current subject index */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4 w-[70%] text-sm md:text-base">
                        {/* Subject Icon */}
                        {/* <BookOpen className="w-5 h-5 text-muted-foreground" /> */}
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
                            <SelectTrigger className="w-48 sm:w-64">
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
                    <div className="flex gap-1 sm:gap-2">
                        {/* Previous Subject Button */}
                        <Button
                            onClick={goToPreviousSubject}
                            disabled={currentSubjectIndex === 0 || !subjectNames || subjectNames.length === 0 || isGlobalEditing}
                            variant="outline"
                            size="icon-sm"
                            className="border-border text-foreground hover:bg-muted"
                        >
                            <ArrowLeft className="w-2 h-2 sm:w-4 sm:h-4" />
                        </Button>
                        {/* Next Subject Button */}
                        <Button
                            onClick={goToNextSubject}
                            disabled={!subjectNames || currentSubjectIndex === subjectNames.length - 1 || isGlobalEditing}
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
