import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Save, X } from "lucide-react";

export const EditingStudents = ({ 
    isEditingStudent, 
    startEditingStudent, 
    saveStudentChanges, 
    cancelEditingStudent, 
    editingStudentData = {}, 
    setEditingStudentData, 
    selectedStudent = {},
    classData = {}
}) => {
    return (
        <div className="mb-8">

            {/* Edit student information section */}
            <div className="flex items-center justify-between mb-3">
                {/* Title of the editing student information section */}
                <h3 className="text-xl font-bold text-gray-800  border-gray-300 pb-2">
                    STUDENT INFORMATION
                </h3>
                {/* Edit Button - To edit student information (save/edit) */}
                {!isEditingStudent ? (
                    <Button
                        onClick={startEditingStudent}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        {/* Save Button - To save the edited student information */}
                        <Button
                            onClick={saveStudentChanges}
                            size="sm"
                            className="bg-gray-800 hover:bg-gray-900 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        {/* Cancel Button - To cancel the editing of student information */}
                        <Button
                            onClick={cancelEditingStudent}
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

            {/* More Editing options - student information */}
            <div className="grid grid-cols-2 gap-6">

                <div className="space-y-3">
                    {/* Student name (span when not editing, input when editing) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-32">
                            Student Name:
                        </span>
                        {/* Student Name Input - To edit the student name */}
                        {isEditingStudent ? (
                            <Input
                                value={editingStudentData?.name || ""}
                                onChange={(e) =>
                                    setEditingStudentData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="flex-1 h-8 text-sm"
                            />
                        ) : (
                            <span className="text-gray-900">
                                {selectedStudent?.name || ""}
                            </span>
                        )}
                    </div>

                    {/* Student ID (span when not editing, input when editing) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-32">
                            Student ID:
                        </span>
                        {/* Student ID Input - To edit the student id */}
                        {isEditingStudent ? (
                            <Input
                                value={editingStudentData?._id || ""}
                                onChange={(e) =>
                                    setEditingStudentData((prev) => ({
                                        ...prev,
                                        _id: parseInt(e.target.value) || prev._id,
                                    }))
                                }
                                className="flex-1 h-8 text-sm"
                            />
                        ) : (
                            <span className="text-gray-900">
                                {selectedStudent?._id || ""}
                            </span>
                        )}
                    </div>

                    {/* Class - (span when not editing, input when editing) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-32">
                            Class:
                        </span>
                        {isEditingStudent ? (
                            <Input
                                value={editingStudentData?.classId || ""}
                                onChange={(e) =>
                                    setEditingStudentData((prev) => ({
                                        ...prev,
                                        classId: parseInt(e.target.value) || prev.classId,
                                    }))
                                }
                                className="flex-1 h-8 text-sm"
                            />
                        ) : (
                            <span className="text-gray-900">
                                {classData?.name || `Class ${selectedStudent?.classId || ""}`}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Term Input - To edit the term */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-32">
                            Term:
                        </span>
                        {isEditingStudent ? (
                            <Input
                                value={editingStudentData?.term || ""}
                                onChange={(e) =>
                                    setEditingStudentData((prev) => ({
                                        ...prev,
                                        term: e.target.value,
                                    }))
                                }
                                className="flex-1 h-8 text-sm"
                            />
                        ) : (
                            <span className="text-gray-900">
                                {selectedStudent?.term || ""}
                            </span>
                        )}
                    </div>

                    {/* Days Present Input - To edit days present */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-32">
                            Days Present:
                        </span>
                        {isEditingStudent ? (
                            <Input
                                type="number"
                                value={editingStudentData?.daysPresent || ""}
                                onChange={(e) =>
                                    setEditingStudentData((prev) => ({
                                        ...prev,
                                        daysPresent: parseInt(e.target.value) || 0,
                                    }))
                                }
                                className="flex-1 h-8 text-sm"
                            />
                        ) : (
                            <span className="text-gray-900">
                                {selectedStudent?.daysPresent || 0}
                            </span>
                        )}
                    </div>

                    {/* Total Days Input - To edit total days */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-32">
                            Total Days:
                        </span>
                        {isEditingStudent ? (
                            <Input
                                type="number"
                                value={editingStudentData?.totalDays || ""}
                                onChange={(e) =>
                                    setEditingStudentData((prev) => ({
                                        ...prev,
                                        totalDays: parseInt(e.target.value) || 0,
                                    }))
                                }
                                className="flex-1 h-8 text-sm"
                            />
                        ) : (
                            <span className="text-gray-900">
                                {selectedStudent?.totalDays || 0}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}