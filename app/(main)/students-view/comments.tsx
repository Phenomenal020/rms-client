// // TODO: This file is not being used


// import { Button } from "@/shadcn/ui/button";
// import { Textarea } from "@/shadcn/ui/textarea";
// import { Edit3, Save, X } from "lucide-react";

// // Type definitions
// interface Student {
//   id?: string;
//   comments?: string | null;
//   [key: string]: unknown;
// }

// interface CommentsProps {
//   isEditingComments: boolean;
//   startEditingComments: () => void;
//   saveCommentsChanges: () => void;
//   cancelEditingComments: () => void;
//   selectedStudent?: Student;
//   editingComment?: string;
//   setEditingComment: (comment: string) => void;
// }

// export const Comments = ({
//   isEditingComments,
//   startEditingComments,
//   saveCommentsChanges,
//   cancelEditingComments,
//   selectedStudent = {},
//   editingComment = "",
//   setEditingComment
// }: CommentsProps) => {
//   return (
//     <div className="mb-8">

//       {/* Teacher's Comments Title and Edit Comments Button */}
//       <div className="flex items-center justify-between mb-4">
//         <h4 className="text-base md:text-lg font-bold text-foreground border-border pb-2">
//           TEACHER'S COMMENTS
//         </h4>
//         {/* Edit Button */}
//         {!isEditingComments ? (
//           <Button
//             onClick={startEditingComments}
//             variant="outline"
//             size="sm"
//             className="border-border text-foreground hover:bg-muted"
//           >
//             <Edit3 className="w-4 h-4 mr-2" />
//             Edit Comments
//           </Button>
//         ) : (
//           <div className="flex gap-2">
//             {/* Save Button */}
//             <Button
//               onClick={saveCommentsChanges}
//               size="sm"
//               className="bg-primary hover:bg-primary/90 text-primary-foreground"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               Save
//             </Button>
//             {/* Cancel Button */}
//             <Button
//               onClick={cancelEditingComments}
//               variant="outline"
//               size="sm"
//               className="border-border text-foreground hover:bg-muted"
//             >
//               <X className="w-4 h-4 mr-2" />
//               Cancel
//             </Button>
//           </div>
//         )}
//       </div>


//       <div className="bg-muted p-4 rounded-lg border border-border">
//         {isEditingComments ? (
//           <Textarea
//             value={editingComment}
//             onChange={(e) => setEditingComment(e.target.value)}
//             className="text-foreground leading-relaxed min-h-[120px] resize-y"
//             placeholder="Enter teacher's comments..."
//           />
//         ) : (
//           <p className="text-foreground leading-relaxed whitespace-pre-wrap">
//             {selectedStudent.comments || ""}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };
