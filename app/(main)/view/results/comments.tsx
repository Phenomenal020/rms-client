// TODO: This file is not being used


import { Button } from "@/shadcn/ui/button";
import { Textarea } from "@/shadcn/ui/textarea";
import { Edit3, Save, X } from "lucide-react";

// Type definitions
interface Student {
  id?: string;
  comments?: string | null;
  [key: string]: unknown;
}

interface CommentsProps {
  isEditingComments: boolean;
  startEditingComments: () => void;
  saveCommentsChanges: () => void;
  cancelEditingComments: () => void;
  selectedStudent?: Student;
  editingComment?: string;
  setEditingComment: (comment: string) => void;
}

export const Comments = ({
  isEditingComments,
  startEditingComments,
  saveCommentsChanges,
  cancelEditingComments,
  selectedStudent = {},
  editingComment = "",
  setEditingComment
}: CommentsProps) => {
  return (
    <div className="mb-8">

      {/* Teacher's Comments Title and Edit Comments Button */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base md:text-lg font-bold text-gray-800 border-gray-300 pb-2">
          TEACHER'S COMMENTS
        </h4>
        {/* Edit Button */}
        {!isEditingComments ? (
          <Button
            onClick={startEditingComments}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Comments
          </Button>
        ) : (
          <div className="flex gap-2">
            {/* Save Button */}
            <Button
              onClick={saveCommentsChanges}
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            {/* Cancel Button */}
            <Button
              onClick={cancelEditingComments}
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


      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        {isEditingComments ? (
          <Textarea
            value={editingComment}
            onChange={(e) => setEditingComment(e.target.value)}
            className="text-gray-700 leading-relaxed min-h-[120px] resize-y"
            placeholder="Enter teacher's comments..."
          />
        ) : (
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {selectedStudent.comments || ""}
          </p>
        )}
      </div>
    </div>
  );
};
