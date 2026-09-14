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
import type { ClassRecordStudentRow } from "@/fetcher/queries";

export type TeacherClassOption = {
  id: string;
  name: string;
};

interface StudentSelectionProps {
  goToPreviousStudent: () => void;
  goToNextStudent: () => void;
  currentStudentIndex: number;
  setCurrentStudentIndex: (index: number) => void;
  students: ClassRecordStudentRow[];
  setSelectedStudent: (student: ClassRecordStudentRow | null) => void;
  selectedStudent: ClassRecordStudentRow | null;
  teacherClasses: TeacherClassOption[];
  selectedClassId: string | null;
  onSelectedClassChange: (classId: string) => void;
}

function getStudentDisplayName(student: ClassRecordStudentRow | null): string {
  if (!student) return "";
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");
}

export function StudentSelection({
  goToPreviousStudent,
  goToNextStudent,
  currentStudentIndex,
  setCurrentStudentIndex,
  students = [],
  setSelectedStudent,
  selectedStudent,
  selectedClassId,
  onSelectedClassChange,
  teacherClasses,
}: StudentSelectionProps) {
  if (teacherClasses.length === 0) return null;
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between">
        {/* Class Selection */}
        <CardContent className="p-2 md:p-4">
          <Select
            value={selectedClassId ?? ""}
            onValueChange={onSelectedClassChange}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {teacherClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>

        <CardContent className="p-2 md:p-4 flex items-center justify-between">
          {/* Student Selection */}
          <div className="flex items-center gap-1 sm:gap-2 text-sm">
            <Select
              value={selectedStudent?.id ?? ""}
              onValueChange={(studentId) => {
                const index = students.findIndex((s) => s.id === studentId);
                const student = students[index];
                if (student) {
                  setSelectedStudent(student);
                  setCurrentStudentIndex(index);
                }
              }}
            >
              <SelectTrigger className="w-48 sm:w-64">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.length > 0 ? (
                  students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {getStudentDisplayName(student)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No students available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-0.5 sm:gap-2">
            {/* Previous Student Button */}
            <Button
              onClick={goToPreviousStudent}
              disabled={currentStudentIndex === 0 || students.length === 0}
              variant="outline"
              size="icon-sm"
              className="border-border text-foreground hover:bg-muted cursor-pointer"
            >
              <ArrowLeft className="w-2 h-2 sm:w-4 sm:h-4" />
            </Button>
            {/* Next Student Button */}
            <Button
              onClick={goToNextStudent}
              disabled={students.length === 0 || currentStudentIndex === students.length - 1}
              variant="outline"
              size="icon-sm"
              className="border-border text-foreground hover:bg-muted cursor-pointer"
            >
              <ArrowRight className="w-2 h-2 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
