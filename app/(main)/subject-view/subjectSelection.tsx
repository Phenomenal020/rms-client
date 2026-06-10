import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";

// SubjectSelection — parallel to students-view StudentSelection (dropdown + prev/next)
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

export function SubjectSelection({
  goToPreviousSubject,
  goToNextSubject,
  currentSubjectIndex,
  setCurrentSubjectIndex,
  subjectNames = [],
  setSelectedSubjectName,
  selectedSubjectName,
  isGlobalEditing,
}: SubjectSelectionProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-2 md:p-4">
        <div className="flex items-center justify-between">
          {/* Subject dropdown — updates selected subject and index */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 w-[70%] text-sm md:text-base">
            {/* Subject dropdown */}
            <Select
              value={selectedSubjectName || ""}
              onValueChange={(value) => {
                if (value) {
                  setSelectedSubjectName(value);
                  setCurrentSubjectIndex(
                    subjectNames.findIndex((subjectName) => subjectName === value),
                  );
                }
              }}
              disabled={isGlobalEditing}
            >
              <SelectTrigger className="w-48 sm:w-64">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>

              <SelectContent>
                {subjectNames && subjectNames.length > 0 ? (
                  subjectNames.map((subjectName) => (
                    <SelectItem key={subjectName} value={subjectName}>
                      {subjectName}
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

          {/* Prev / next subject */}
          <div className="flex gap-1 sm:gap-2">
            {/* Previous subject button */}
            <Button
              type="button"
              onClick={goToPreviousSubject}
              disabled={
                currentSubjectIndex === 0 ||
                !subjectNames ||
                subjectNames.length === 0 ||
                isGlobalEditing
              }
              variant="outline"
              size="icon-sm"
              className="border-border text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-2 h-2 sm:w-4 sm:h-4" />
            </Button>

            {/* Next subject button */}
            <Button
              type="button"
              onClick={goToNextSubject}
              disabled={
                !subjectNames ||
                currentSubjectIndex === subjectNames.length - 1 ||
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
