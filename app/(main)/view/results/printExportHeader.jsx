import { Download, Printer } from "lucide-react";
import { Button } from "@/shadcn/ui/button";

export function PrintExportHeader({ handlePrint, handleExport, isGlobalEditing }) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                {/* Student Result Sheet Header Text */}
                <h1 className="text-2xl font-bold text-gray-900">
                    Student Result Sheet
                </h1>
                {/* Print and Export Buttons */}
                <div className="flex gap-2">
                    {/* Print Button */}
                    <Button onClick={handlePrint} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" disabled={isGlobalEditing}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    {/* Export Button */}
                    <Button
                        onClick={handleExport}
                        className="bg-gray-800 hover:bg-gray-900 text-white"
                        disabled={isGlobalEditing}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};