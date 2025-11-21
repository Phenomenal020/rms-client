import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export const AddSubjectDialog = ({ open, onOpenChange, onSave }) => {
  const [subjectName, setSubjectName] = useState("");
  const [caDefault, setCaDefault] = useState("");
  const [examDefault, setExamDefault] = useState("");

  const handleSave = () => {
    if (subjectName.trim()) {
      onSave({
        name: subjectName.trim(),
        caDefault: caDefault ? parseInt(caDefault) || 0 : 0,
        examDefault: examDefault ? parseInt(examDefault) || 0 : 0,
      });
      setSubjectName("");
      setCaDefault("");
      setExamDefault("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSubjectName("");
    setCaDefault("");
    setExamDefault("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogClose onClose={handleCancel} />
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Enter subject name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ca-default">CA Default Score (Optional)</Label>
            <Input
              id="ca-default"
              type="number"
              min="0"
              max="100"
              value={caDefault}
              onChange={(e) => setCaDefault(e.target.value)}
              placeholder="Enter default CA score"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-default">Exam Default Score (Optional)</Label>
            <Input
              id="exam-default"
              type="number"
              min="0"
              max="100"
              value={examDefault}
              onChange={(e) => setExamDefault(e.target.value)}
              placeholder="Enter default exam score"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!subjectName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


