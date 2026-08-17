import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";

export type TeacherClassOption = {
  id: string;
  name: string;
};

interface PrintExportHeaderProps {
  isGlobalEditing: boolean;
  className: string | null;
  teacherClasses?: TeacherClassOption[];
  selectedClassId?: string | null;
  onSelectedClassChange?: (classId: string) => void;
}

export function PrintExportHeader({
  isGlobalEditing,
  className,
  teacherClasses,
  selectedClassId,
  onSelectedClassChange,
}: PrintExportHeaderProps) {
  const showClassPicker = !!onSelectedClassChange && (teacherClasses?.length ?? 0) > 0;
  const title = className ? `${className} Subject Sheet` : "Subject Sheet";

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1">
          {showClassPicker && (
            <Select
              value={selectedClassId ?? ""}
              onValueChange={onSelectedClassChange}
              disabled={isGlobalEditing}
            >
              <SelectTrigger className="w-full sm:w-56">
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
          {/* <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
            {title}
          </h1> */}
        </div>
      </div>
    </div>
  );
}
