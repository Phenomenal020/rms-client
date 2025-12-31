import { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/shadcn/ui/dialog";
import { Calendar as CalendarIcon, ChevronDown, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const AddStudentDialog = ({ open, onOpenChange, onSave, availableSubjects = [] }) => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);
  const [gender, setGender] = useState("");
  const [department, setDepartment] = useState("");
  const [daysPresent, setDaysPresent] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const handleSave = () => {
    // Validate required fields
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (selectedSubjects.length === 0) {
      toast.error("At least one subject should be assigned to the student");
      return;
    }

    const studentData = {
      studentId: String(Date.now() + Math.random()),
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      name: `${firstName.trim()}${middleName ? ` ${middleName.trim()}` : ""} ${lastName.trim()}`.trim(),
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      department: department || undefined,
      daysPresent: daysPresent ? parseInt(daysPresent) : undefined,
      subjects: selectedSubjects.map((subj) => ({
        name: subj.name,
        scores: [],
      })),
    };

    onSave(studentData);
    handleCancel();
  };

  const handleCancel = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setDateOfBirth("");
    setGender("");
    setDepartment("");
    setDaysPresent("");
    setSelectedSubjects([]);
    setDateOfBirthOpen(false);
    onOpenChange(false);
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.some((s) => s.name === subject.name)
        ? prev.filter((s) => s.name !== subject.name)
        : [...prev, subject]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogClose onClose={handleCancel} />
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">
                Middle Name <span className="text-gray-500">(optional)</span>
              </Label>
              <Input
                id="middleName"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Enter middle name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label>
                Date of Birth <span className="text-gray-500">(optional)</span>
              </Label>
              <Popover open={dateOfBirthOpen} onOpenChange={setDateOfBirthOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {dateOfBirth
                      ? format(new Date(dateOfBirth), "PPP")
                      : "Select date"}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setDateOfBirth(date.toISOString().split("T")[0]);
                        setDateOfBirthOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-gray-500">(optional)</span>
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="NONE">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-gray-500">(optional)</span>
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCIENCE">Science</SelectItem>
                  <SelectItem value="ARTS">Arts</SelectItem>
                  <SelectItem value="COMMERCE">Commerce</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="NONE">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Days Present */}
            <div className="space-y-2">
              <Label htmlFor="daysPresent">
                Days Present <span className="text-gray-500">(optional)</span>
              </Label>
              <Input
                id="daysPresent"
                type="number"
                min="0"
                value={daysPresent}
                onChange={(e) => setDaysPresent(e.target.value)}
                placeholder="Enter days present"
              />
            </div>
          </div>

          {/* Subjects Selection */}
          <div className="space-y-2">
            <Label>
              Subjects * <span className="text-gray-500">(select at least one)</span>
            </Label>
            <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
              {availableSubjects.length === 0 ? (
                <p className="text-sm text-gray-500">No subjects available. Please add subjects first.</p>
              ) : (
                <div className="space-y-2">
                  {availableSubjects.map((subject) => {
                    const isSelected = selectedSubjects.some((s) => s.name === subject.name);
                    return (
                      <div
                        key={subject.id || subject.name}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => toggleSubject(subject)}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm">{subject.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
