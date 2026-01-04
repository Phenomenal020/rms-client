import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Edit3, Save, X } from "lucide-react";

export const SchoolHeader = ({
  isEditingSchool,
  startEditingSchool,
  saveSchoolChanges,
  cancelEditingSchool,
  editingSchoolData = {},
  setEditingSchoolData,
  school = {}
}) => {
  // If editing, use the editing school data, otherwise use the school data
  const displayData = isEditingSchool ? editingSchoolData : school;

  return (
    <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">

      {/* Edit Button */}
      <div className="flex justify-end mb-4">
        {/* Edit School Info Button - Show when not editing */}
        {!isEditingSchool ? (
          <Button
            onClick={startEditingSchool}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit School Info
          </Button>
        ) : (
          <div className="flex gap-2">
            {/* Save Button - Show when editing */}
            <Button
              onClick={saveSchoolChanges}
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            {/* Cancel Button - Show when editing */}
            <Button
              onClick={cancelEditingSchool}
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

      {/* School Name - show input in edit mode or show the school name in view mode */}
      {isEditingSchool ? (
        <Input
          value={displayData?.name}
          placeholder="School Name"
          onChange={(e) =>
            setEditingSchoolData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          className="text-3xl font-bold text-center mb-2 p-3"
        />
      ) : (
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {displayData?.name}
        </h1>
      )}

      {/* Motto - show input in edit mode or show the motto in view mode */}
      {isEditingSchool ? (
        <Input
          value={displayData?.motto || ""}
          placeholder="School Motto"
          onChange={(e) =>
            setEditingSchoolData((prev) => ({
              ...prev,
              motto: e.target.value,
            }))
          }
          className="text-2xl text-center mb-2 p-3"
        />
      ) : (
        <p className="text-2xl text-gray-700 mb-1">
          {displayData?.motto || ""}
        </p>
      )}

      {/* Address - show input in edit mode or show the address in view mode */}
      {isEditingSchool ? (
        <Input
          value={displayData?.address || ""}
          placeholder="School Address"
          onChange={(e) =>
            setEditingSchoolData((prev) => ({
              ...prev,
              address: e.target.value,
            }))
          }
          className="text-lg text-center mb-2 p-3"
        />
      ) : (
        <p className="text-lg text-gray-600 mb-1">
          {displayData?.address || ""}
        </p>
      )}

      {/* Phone and Email - show input in edit mode or show the phone and email in view mode */}
      <div className="flex flex-col items-center gap-1">
        {/* Phone and Email - show input in edit mode or show the phone and email in view mode */}
        {isEditingSchool ? (
          <>
            <Input
              value={displayData?.tel || ""}
              placeholder="School Phone"
              onChange={(e) =>
                setEditingSchoolData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              className="text-sm text-center w-full p-3 mb-2"
            />
            <Input
              value={displayData?.email || ""}
              onChange={(e) =>
                setEditingSchoolData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="Email"
              className="text-sm text-center w-full p-3 mb-2"
            />
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Tel: {displayData?.tel || ""} | Email: {displayData?.email || ""}
          </p>
        )}
      </div>

      {/* Academic Report Card Title - static text */}
      <h2 className="text-2xl font-bold text-gray-800 mt-4">
        ACADEMIC REPORT CARD
      </h2>

      {/* Academic Year and Term - show input in edit mode, show the academic year and term in view mode */}
      <div className="flex flex-col items-center gap-1 mt-2">
        {isEditingSchool ? (
          <>
          {/* Academic Year: */}
            <Input
              value={displayData?.academicYear || ""}
              onChange={(e) =>
                setEditingSchoolData((prev) => ({
                  ...prev,
                  academicYear: e.target.value,
                }))
              }
              placeholder="Academic Year"
              className="text-sm text-center w-full p-3 mb-2"
            />
            {/* Term: */}
            <Input
              value={displayData?.term || ""}
              onChange={(e) =>
                setEditingSchoolData((prev) => ({
                  ...prev,
                  term: e.target.value,
                }))
              }
              placeholder="Term"
              className="text-sm text-center w-full p-3 mb-2"
            />
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Academic Year: {displayData?.academicYear || ""} | Term: {displayData?.term || ""}
          </p>
        )}
      </div>
    </div>
  );
};
