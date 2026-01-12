import { Button } from "@/shadcn/ui/button";
import { Printer, Download } from "lucide-react";

export function PrintExportHeader({ handlePrint, handleExport, isGlobalEditing }) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">

                {/* Subject Sheet Header Text */}
                <h1 className="text-2xl font-bold text-gray-900">
                    Subject Sheet
                </h1>

                {/* Print and Export Buttons */}
                <div className="flex gap-2">

                    {/* Print Button */}
                    <Button
                        disabled={isGlobalEditing}
                        onClick={handlePrint}
                        variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    
                    {/* Export Button */}
                    <Button
                        disabled={isGlobalEditing}
                        onClick={handleExport}
                        variant="outline"
                        className="bg-gray-800 hover:bg-gray-900 text-white cursor-pointer">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};
