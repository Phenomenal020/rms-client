import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Edit3, Save, X } from "lucide-react";

export const SubjectInfo = ({
    selectedSubject = "",
    enrolledStudentsCount = 0,
    term = "",
    academicYear = ""
}) => {
    return (
        <div className="mb-8">

            {/* Edit subject information section */}
            <div className="flex items-center justify-between mb-3">

                {/* Title of the editing subject information section */}
                <h3 className="text-xl font-bold text-gray-800  border-gray-300 pb-2">
                    SUBJECT INFORMATION
                </h3>

            </div>

            {/* More Editing options - subject information */}
            <div className="grid grid-cols-2 gap-6">

                <div className="space-y-3">
                    {/* Subject name (span when not editing, input when editing) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40">
                            Subject Name:
                        </span>

                        <span className="text-gray-900">
                            {selectedSubject || ""}
                        </span>
                    </div>

                    {/* Number of students enrolled (read-only) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40">
                            Students Enrolled:
                        </span>
                        <span className="text-gray-900">
                            {enrolledStudentsCount}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Term (read-only, from school data) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40">
                            Term:
                        </span>
                        <span className="text-gray-900">
                            {term || "N/A"}
                        </span>
                    </div>

                    {/* Academic Year (read-only, from school data) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40">
                            Academic Year:
                        </span>
                        <span className="text-gray-900">
                            {academicYear || "N/A"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}