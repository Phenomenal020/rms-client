import { Download, Printer } from "lucide-react";
import { Button } from "@/shadcn/ui/button";

// Interface for the PrintExportHeader component props
interface PrintExportHeaderProps {
    handlePrint: () => void;
    handleExport: () => void;
    isGlobalEditing: boolean;
}

export function PrintExportHeader({ handlePrint, handleExport, isGlobalEditing }: PrintExportHeaderProps) {
    return (
        <div className="mb-6">
            {/* Stack on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                {/* Subject Sheet Header Text */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    Subject Sheet
                </h1>

                {/* Print and Export Buttons - side by side, icon-only on very small screens */}
                <div className="flex gap-2">
                    {/* Print Button */}
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none border-border text-foreground hover:bg-muted text-xs sm:text-sm cursor-pointer"
                        disabled={isGlobalEditing}
                    >
                        <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="sr-only min-[400px]:not-sr-only">Print</span>
                    </Button>

                    {/* Export Button */}
                    <Button
                        onClick={handleExport}
                        size="sm"
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm cursor-pointer"
                        disabled={isGlobalEditing}
                    >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="sr-only min-[400px]:not-sr-only">Export PDF</span>
                    </Button>
                </div>

            </div>
        </div>
    );
}
