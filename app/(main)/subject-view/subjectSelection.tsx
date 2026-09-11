import { Card, CardContent } from "@/shadcn/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";

export type SubjectOption = {
  subjectId: string;
  subjectName: string;
};
export type TeacherClassOption = {
  id: string;
  name: string;
};

interface SubjectSelectionProps {
  setCurrentSubjectIndex: (index: number) => void;
  subjects: SubjectOption[];
  setSelectedSubjectId: (subjectId: string | null) => void;
  selectedSubjectId: string | null;
  isGlobalEditing: boolean;
  teacherClasses?: TeacherClassOption[];
  selectedClassId?: string | null;
  onSelectedClassChange?: (classId: string) => void;
}

export function SubjectSelection({
  setCurrentSubjectIndex,
  subjects = [],
  setSelectedSubjectId,
  selectedSubjectId,
  isGlobalEditing,
  teacherClasses,
  selectedClassId,
  onSelectedClassChange,
}: SubjectSelectionProps) {
  const showClassPicker = !!onSelectedClassChange && (teacherClasses?.length ?? 0) > 0;

  return (
    <Card className="mb-6">
      <CardContent className="p-2 md:p-4">
        <div className="flex items-center justify-between gap-2">
          {/* Class picker */}
          {showClassPicker && (
            <Select
              value={selectedClassId ?? ""}
              onValueChange={onSelectedClassChange}
              disabled={isGlobalEditing}
            >
              <SelectTrigger className="min-w-0 w-36 sm:w-56">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {teacherClasses!.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Subject picker */}
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
            <SelectTrigger className="min-w-0 w-36 sm:w-64">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
