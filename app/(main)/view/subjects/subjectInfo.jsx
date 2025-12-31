import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Edit3, Save, X } from "lucide-react";

export const SubjectInfo = ({ 
    isEditingSubject, 
    startEditingSubject, 
    saveSubjectChanges, 
    cancelEditingSubject, 
    editingSubjectData = {}, 
    setEditingSubjectData, 
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
                {/* Edit Button - To edit subject information (save/edit) */}
                {!isEditingSubject ? (
                    <Button
                        onClick={startEditingSubject}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        {/* Save Button - To save the edited subject information */}
                        <Button
                            onClick={saveSubjectChanges}
                            size="sm"
                            className="bg-gray-800 hover:bg-gray-900 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        {/* Cancel Button - To cancel the editing of subject information */}
                        <Button
                            onClick={cancelEditingSubject}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* More Editing options - subject information */}
            <div className="grid grid-cols-2 gap-6">

                <div className="space-y-3">
                    {/* Subject name (span when not editing, input when editing) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40">
                            Subject Name:
                        </span>
                        {/* Subject Name Input - To edit the subject name */}
                        {isEditingSubject ? (
                            <Input
                                value={editingSubjectData?.name || ""}
                                onChange={(e) =>
                                    setEditingSubjectData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="flex-1 h-8 text-sm"
                            />
                        ) : (
                            <span className="text-gray-900">
                                {selectedSubject || ""}
                            </span>
                        )}
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

