import { FileDown } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";

export type TeacherClassOption = {
    id: string;
    name: string;
};

interface PrintExportHeaderProps {
    handleExport: () => void | Promise<void>;
    isGlobalEditing: boolean;
    /** True while the export / save-record mutation is in flight. */
    isExporting?: boolean;
    className: string | null;
    canEdit?: boolean;
    teacherClasses?: TeacherClassOption[];
    selectedClassId?: string | null;
    onSelectedClassChange?: (classId: string) => void;
}

export function PrintExportHeader({
    handleExport,
    isGlobalEditing,
    isExporting = false,
    className,
    canEdit = true,
    teacherClasses,
    selectedClassId,
    onSelectedClassChange,
}: PrintExportHeaderProps) {
    const showClassPicker = !!onSelectedClassChange && (teacherClasses?.length ?? 0) > 0;
    // const title = className ? `${className} Result Sheet` : "Result Sheet";

    return (
        <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1">
                    {/* Classes dropdown for the teacher to select the class to export the results for */}
                    {showClassPicker && (
                        <Select
                            value={selectedClassId ?? ""}
                            onValueChange={onSelectedClassChange}
                            disabled={isGlobalEditing || isExporting}
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

                </div>

                {canEdit && (
                    <Button
                        type="button"
                        onClick={handleExport}
                        size="sm"
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm cursor-pointer"
                        disabled={isGlobalEditing || isExporting || (showClassPicker && !selectedClassId)}
                    >
                        <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="sr-only min-[400px]:not-sr-only">Export</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
