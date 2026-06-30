import { FileDown } from "lucide-react";
import { Button } from "@/shadcn/ui/button";

interface PrintExportHeaderProps {
  handleExport: () => void;
  isGlobalEditing: boolean;
  className: string | null;
  canEdit?: boolean;
}

export function PrintExportHeader({
  handleExport,
  isGlobalEditing,
  className,
  canEdit = false,
}: PrintExportHeaderProps) {
  const title = className ? `${className} Subject Sheet` : "Subject Sheet";

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{title}</h1>

        {canEdit && (
          <Button
            type="button"
            onClick={handleExport}
            size="sm"
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm cursor-pointer"
            disabled={isGlobalEditing}
          >
            <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sr-only min-[400px]:not-sr-only">Export</span>
          </Button>
        )}
      </div>
    </div>
  );
}