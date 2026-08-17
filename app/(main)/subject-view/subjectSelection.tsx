import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/shadcn/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Define the type for the subject options
export type SubjectOption = {
  subjectId: string;
  subjectName: string;
};

// Define the props for the SubjectSelection component
interface SubjectSelectionProps {
  goToPreviousSubject: () => void;
  goToNextSubject: () => void;
  currentSubjectIndex: number;
  setCurrentSubjectIndex: (index: number) => void;
  subjects: SubjectOption[];
  setSelectedSubjectId: (subjectId: string | null) => void;
  selectedSubjectId: string | null;
  isGlobalEditing: boolean;
}

// Define the SubjectSelection component
export function SubjectSelection({
  goToPreviousSubject,
  goToNextSubject,
  currentSubjectIndex,
  setCurrentSubjectIndex,
  subjects = [],
  setSelectedSubjectId,
  selectedSubjectId,
  isGlobalEditing,
}: SubjectSelectionProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-2 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 w-[70%] text-sm lg:text-base">
            <Select
              value={selectedSubjectId ?? ""}
              onValueChange={(subjectId) => {
                const index = subjects.findIndex((s) => s.subjectId === subjectId);
                if (index !== -1) {
                  setSelectedSubjectId(subjectId);
                  setCurrentSubjectIndex(index);
                }
              }}
              disabled={isGlobalEditing}
            >
              <SelectTrigger className="w-48 sm:w-64">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>

              <SelectContent>
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No subjects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1 sm:gap-2">
            <Button
              type="button"
              onClick={goToPreviousSubject}
              disabled={
                currentSubjectIndex === 0 ||
                subjects.length === 0 ||
                isGlobalEditing
              }
              variant="outline"
              size="icon-sm"
              className="border-border text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-2 h-2 sm:w-4 sm:h-4" />
            </Button>

            <Button
              type="button"
              onClick={goToNextSubject}
              disabled={
                subjects.length === 0 ||
                currentSubjectIndex === subjects.length - 1 ||
                isGlobalEditing
              }
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
  );
}