"use client";

// Imports
import Link from "next/link";
import { LoadingButton } from "@/shared-components/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shadcn/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shadcn/ui/table";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronDown,
  Trash2,
  CheckSquare,
  Square,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUser } from "@/contexts/user-context";
import { Student, UpsertStudentsPayload } from "@/types/students";
import { StudentSubject } from "@/types/drizzle";
import { useUpsertStudents, getErrorMessage } from "@/fetcher/mutations";
import Loading from "./loading";


// Student schema - for edit student form
const studentSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().trim().min(1, { message: "First name is required" }),  // required field
  middleName: z.string().trim().optional(),  // optional field
  lastName: z.string().trim().min(1, { message: "Last name is required" }),  // required field
  dateOfBirth: z.string().optional(), // optional field
  gender: z.enum(["", "NONE", "MALE", "FEMALE"]).optional()
    .transform((val) => val === "" || val === undefined ? undefined : val),
  department: z.enum(["", "NONE", "SCIENCE", "ARTS", "GENERAL"]).optional()
    .transform((val) => val === "" || val === undefined ? undefined : val),
  daysPresent: z.union([z.number(), z.string(), z.undefined()]).optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = typeof val === "string" ? Number(val) : (typeof val === "number" ? val : undefined);
      if (num === undefined || isNaN(num) || num < 0) return undefined;
      return num;
    }).pipe(z.number().min(0, { message: "Days present must be a valid number" }).optional()),
  subjects: z
    .array(z.object({ id: z.string(), name: z.string() }))  // array of objects with id and name fields
    .min(1, { message: "At least one subject is required" })  // at least one subject is required
});

// Schema for the students list
const studentsFormSchema = z.object({
  students: z.array(studentSchema).min(1, { message: "At least one student is required" }),  // at least one student is required
});

// students form component
export function StudentsForm() {

  // Date of birth open state
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);

  // Editing student: index and id state
  const [editingStudentIndex, setEditingStudentIndex] = useState<number | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Router
  const router = useRouter();

  // Form section reference: for scrolling to the form on edit
  const formSectionRef = useRef<HTMLDivElement>(null);

  // New student form state: temporarilly hold add/edit values
  const [newStudent, setNewStudent] = useState<Student>({
    id: undefined,
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    department: "",
    daysPresent: "",
    subjects: [],
  });

  // Get the students and academic term from the user context
  const { students, subjects } = useUser();

  // Mutation hook for upserting students
  const { upsertStudents, isMutating } = useUpsertStudents();

  // Student form - on render (MUST be called before any conditional returns)
  const form = useForm({
    resolver: zodResolver(studentsFormSchema),
    defaultValues: { // default values for the form on render
      students: students?.map((student) => ({
        id: student.id || undefined,
        firstName: student.firstName,
        middleName: student.middleName || "",
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth
          ? new Date(student.dateOfBirth).toISOString().split("T")[0] // convert to ISO String
          : "",  // render ISO String of date of birth
        gender: student.gender || "",  // optional
        department: student.department || "",  // optional
        daysPresent: student.daysPresent ?? undefined,  // optional - keep as number or undefined
        subjects: student.subjects.map((studentSubject: StudentSubject) => ({
          id: studentSubject.subject?.id,
          name: studentSubject.subject?.name,
        })),  // subjects list with id and name
      })) || [],
    },
  });

  // useFieldArray: to manage the array of students from react-hook-form (MUST be called before any conditional returns)
  const { fields: studentFields, append: appendStudent, remove: removeStudent, update: updateStudent } = useFieldArray({
    control: form.control,
    name: "students",
  });

  useEffect(() => {
    // console.log('students changed:', students);
  }, [students]);

  // Conditional return AFTER all hooks
  if (students === undefined || students === null) {
    return <Loading />
  }

  // Available subjects from academic term (with id and name)
  const availableSubjects = subjects?.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })) || [];


  // Toggle student subject selection
  const toggleStudentSubject = (subjectToToggle: { id: string; name: string }) => {
    // check if the subject to toggle is already in the subjects list. If it is, remove it, otherwise add it.
    setNewStudent((prev) => ({
      ...prev,
      subjects: prev.subjects.some(subject => subject.id === subjectToToggle.id)
        ? prev.subjects.filter(subject => subject.id !== subjectToToggle.id)
        : [...prev.subjects, subjectToToggle],
    }));
  };

  // Start editing a student - populate the form
  const startEditingStudent = (studentIndex: number) => {
    // Get the student from the form
    const student = form.getValues(`students.${studentIndex}`);
    if (!student) return;

    // Set the editing student index and id
    setEditingStudentIndex(studentIndex);
    setEditingStudentId(student.id ?? null);

    // Populate the form with the selected student data
    setNewStudent({
      id: student.id || undefined,
      firstName: student.firstName || "",
      middleName: student.middleName || "",
      lastName: student.lastName || "",
      dateOfBirth: student.dateOfBirth || "",
      gender: (student.gender as string) || "",
      department: (student.department as string) || "",
      daysPresent: student.daysPresent ? String(student.daysPresent) : "",
      subjects: student.subjects || [],
    });

    // Scroll to the form (after layout updates) into view
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  // Cancel editing: Reset editing student index and id, and reset the new student form
  const cancelEditing = () => {
    setEditingStudentIndex(null);
    setEditingStudentId(null);
    setNewStudent({
      id: undefined,
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      department: "",
      daysPresent: "",
      subjects: [],
    });
    setDateOfBirthOpen(false);
  };

  // Add or update student
  const addStudent = () => {
    // first name is required
    if (!newStudent.firstName.trim() || newStudent.firstName.trim() === "") {
      toast.error("First name is required");
      return;
    }
    // last name is required
    if (!newStudent.lastName.trim() || newStudent.lastName.trim() === "") {
      toast.error("Last name is required");
      return;
    }
    // at least one subject is required
    if (newStudent.subjects.length === 0) {
      toast.error("At least one subject should be assigned to the student");
      return;
    }

    // construct the new student data from the form
    const studentData = {
      id: editingStudentIndex !== null ? newStudent.id : undefined,
      firstName: newStudent.firstName.trim(),
      middleName: newStudent.middleName?.trim() || undefined,
      lastName: newStudent.lastName.trim(),
      dateOfBirth: newStudent.dateOfBirth || undefined,
      gender: (newStudent.gender && (newStudent.gender === "NONE" || newStudent.gender === "MALE" || newStudent.gender === "FEMALE"))
        ? newStudent.gender as "NONE" | "MALE" | "FEMALE"
        : undefined,
      department: (newStudent.department && (newStudent.department === "NONE" || newStudent.department === "SCIENCE" || newStudent.department === "ARTS" || newStudent.department === "GENERAL"))
        ? newStudent.department as "NONE" | "SCIENCE" | "ARTS" | "GENERAL"
        : undefined,
      daysPresent: newStudent.daysPresent || undefined,
      // Create a new array reference to ensure React Hook Form detects the change
      subjects: newStudent.subjects.map(s => ({ ...s })),
    };

    // ---------------------------------------------------------------------------
    if (editingStudentIndex !== null) {
      // Editing mode: Update the student data in the form
      // Use updateStudent from useFieldArray to properly track nested array changes (like subjects)
      updateStudent(editingStudentIndex, studentData as z.infer<typeof studentSchema>);
      toast.success(
        `Student "${newStudent.firstName.trim()} ${newStudent.lastName.trim()}" updated successfully!`
      );
      // Cancel editing: reset the editing student index and id, and reset the new student form
      cancelEditing();
    } else {
      // Check for duplicate student (same firstName + lastName, case-insensitive)
      const firstNameLower = newStudent.firstName.trim().toLowerCase();
      const lastNameLower = newStudent.lastName.trim().toLowerCase();
      const middleNameLower = newStudent.middleName?.trim().toLowerCase() || undefined;

      const isDuplicate = studentFields.some((field, index) => {
        const existingStudent = form.getValues(`students.${index}`);
        if (!existingStudent) return false;

        const existingFirstName = (existingStudent.firstName || "").toLowerCase();
        const existingLastName = (existingStudent.lastName || "").toLowerCase();
        const existingMiddleName = (existingStudent.middleName || "").toLowerCase();

        // Check if firstName and lastName match
        if (existingFirstName === firstNameLower && existingLastName === lastNameLower) {
          // If both have middle names, they must match too
          if (middleNameLower && existingMiddleName) {
            return middleNameLower === existingMiddleName;
          }
          // If one has middle name and the other doesn't, they're different
          if (middleNameLower || existingMiddleName) {
            return false;
          }
          // Both don't have middle names, so they match
          return true;
        }
        return false;
      });

      if (isDuplicate) {
        toast.error("A student with the same name already exists in the list");
        return;
      }

      // Add new student: append the student data to the form
      appendStudent(studentData as z.infer<typeof studentSchema>);
      toast.success(
        `Student "${newStudent.firstName.trim()}${newStudent.middleName ? " " + newStudent.middleName.trim() : ""
        } ${newStudent.lastName.trim()}" added successfully!`
      );
      // Reset form (keep termDays and className)
      setNewStudent((prev) => ({
        ...prev,
        id: undefined,
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        department: "",
        daysPresent: "",
        subjects: [],
        // Keep termDays and className unchanged
      }));
      setDateOfBirthOpen(false);
    }
  };

  // on submit function - update students + set status
  async function onSubmit(data: z.infer<typeof studentsFormSchema>) {
    try {
      // transform students data with proper type conversions
      const studentsData = data.students.map((student) => {
        // Convert dateOfBirth from string to Date object if present
        let dateOfBirth: Date | undefined = undefined;
        if (student.dateOfBirth) {
          const dateValue = typeof student.dateOfBirth === 'string'
            ? new Date(student.dateOfBirth)
            : student.dateOfBirth;
          if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            dateOfBirth = dateValue;
          }
        }

        // daysPresent: ensure it's a valid number
        let daysPresent: number | undefined = student.daysPresent || undefined;
        if (daysPresent !== undefined && (isNaN(daysPresent) || daysPresent < 0)) {
          daysPresent = undefined;
        }

        return {
          id: student.id || undefined,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName || undefined,
          gender: student.gender || undefined,
          department: student.department || undefined,
          daysPresent,
          subjects: [...student.subjects],
          dateOfBirth,
        };
      });

      // Call mutation to update students
      await upsertStudents(studentsData as UpsertStudentsPayload);

      // Success!
      toast.success("Students updated successfully");
      router.refresh(); // Refresh the page to show updated data
    } catch (err) {
      toast.error("Failed to update students", {
        description: getErrorMessage(err),
      });
    }
  }

  const loading = form.formState.isSubmitting || isMutating;

  return (
    <Card className="border shadow-md" ref={formSectionRef}>
      <CardContent className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Add Student Section */}
            <div id="student-form-section" className="space-y-6">

              {/* Add/Edit Student Section Header */}
              <div className="pb-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">
                    {editingStudentIndex !== null ? "Edit Student" : "Add New Student"}
                  </h3>
                </div>
              </div>

              {/* New Student Form */}
              <Card className="border-0 shadow-none">
                <CardContent className="space-y-4 p-2">

                  {/* Basic Information: Names */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                    {/* First Name */}
                    <div className="space-y-2 mb-4">
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                        First Name<span className="text-destructive text-base">*</span>
                      </FormLabel>
                      <div>
                        <Input
                          placeholder="Enter student's first name"
                          value={newStudent.firstName}
                          onChange={(e) =>
                            setNewStudent((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary w-full"
                        />
                      </div>
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-2 mb-4">
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                        Middle Name
                      </FormLabel>
                      <div>
                        <Input
                          placeholder="Enter student's middle name"
                          value={newStudent.middleName}
                          onChange={(e) =>
                            setNewStudent((prev) => ({
                              ...prev,
                              middleName: e.target.value,
                            }))
                          }
                          className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary w-full"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2 mb-4">
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                        Last Name<span className="text-destructive text-base">*</span>
                      </FormLabel>
                      <div>
                        <Input
                          placeholder="Enter student's last name"
                          value={newStudent.lastName}
                          onChange={(e) =>
                            setNewStudent((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary w-full"
                        />
                      </div>
                    </div>

                  </div>

                  {/* DoB, Gender, Department, Days Present */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    
                    {/* Date of Birth */}
                    <div className="space-y-2 mb-4">
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        DOB
                      </FormLabel>
                      <div>
                        <Popover
                          open={dateOfBirthOpen}
                          onOpenChange={setDateOfBirthOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-10 md:h-14 text-sm md:text-base justify-between font-normal cursor-pointer"
                            >
                              {newStudent.dateOfBirth
                                ? format(new Date(newStudent.dateOfBirth), "PPP")
                                : "Select date"}
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                newStudent.dateOfBirth
                                  ? new Date(newStudent.dateOfBirth)
                                  : undefined
                              }
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                if (date) {
                                  const dateString =
                                    date.toISOString().split("T")[0];
                                  setNewStudent((prev) => ({
                                    ...prev,
                                    dateOfBirth: dateString,
                                  }));
                                  setDateOfBirthOpen(false);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-2 mb-4">
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                        Gender
                      </FormLabel>
                      <div className="w-full">
                        <Select
                          value={newStudent.gender || ""}
                          onValueChange={(value) =>
                            setNewStudent((prev) => ({
                              ...prev,
                              gender: value === "NONE" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full h-10 md:h-14 text-sm md:text-base">
                            <SelectValue placeholder="Select gender (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-2 mb-4">
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                        Department
                      </FormLabel>
                      <div className="w-full">
                        <Select
                          value={newStudent.department || ""}
                          onValueChange={(value) =>
                            setNewStudent((prev) => ({
                              ...prev,
                              department: value === "NONE" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full h-10 md:h-14 text-sm md:text-base">
                            <SelectValue placeholder="Select department (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="SCIENCE">Science</SelectItem>
                            <SelectItem value="ARTS">Arts</SelectItem>
                            <SelectItem value="GENERAL">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Days Present */}
                    <div className="space-y-2">
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                        Days Present
                      </FormLabel>
                      <div>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newStudent.daysPresent}
                          onChange={(e) =>
                            setNewStudent((prev) => ({
                              ...prev,
                              daysPresent: e.target.value,
                            }))
                          }
                          className="h-10 md:h-14 text-sm md:text-base transition-colors hover:border-input focus:border-primary"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Available Subjects Selection */}
                  {availableSubjects.length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-border">

                      {/* Select Subjects Label */}
                      <FormLabel className="text-sm md:text-base text-muted-foreground font-semibold">
                        Assign Subjects to Student<span className="text-destructive text-base">*</span>
                      </FormLabel>

                      {/* Select Subjects List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-1">
                        {availableSubjects.map((subject: { id: string; name: string }, index: number) => {
                          // for each if the subject is already selected
                          const isSelected = newStudent.subjects.some(
                            (s) => s.id === subject.id
                          );

                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() =>
                                  toggleStudentSubject(subject)
                                }
                                className="flex items-center hover:bg-muted p-2 rounded-md transition-colors w-full justify-start cursor-pointer h-10 md:h-14"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-primary" />
                                ) : (
                                  <Square className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-sm md:text-base text-foreground">
                                  {subject.name}
                                </span>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No subjects available message */}
                  {availableSubjects.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm md:text-base">
                      No subjects to assign. Please add subjects in the <Link href="/settings/subjects" className="text-primary hover:text-primary/80">Subjects Settings</Link> first.
                    </div>
                  )}

                  {/* Cancel/Add/Update Student Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Show cancel button based on editing mode */}
                    {editingStudentIndex !== null && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        className="w-full sm:w-auto flex-1 h-10 md:h-14 text-sm md:text-base cursor-pointer"
                      >
                        Cancel
                      </Button>
                    )}
                    {/* Show Add / Update button based on editing mode */}
                    <Button
                      type="button"
                      onClick={addStudent}
                      className={`${editingStudentIndex !== null ? "w-full sm:w-auto flex-1" : "w-full"} h-10 md:h-14 text-sm md:text-base cursor-pointer`}
                      disabled={loading}
                    >
                      {/* Show add/edit based on editing mode */}
                      {editingStudentIndex !== null ? (
                        <>
                          <Pencil className="w-4 h-4 mr-2" />
                          Update Student
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Student
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students List Section */}
            {studentFields.length > 0 && (
              <div className="space-y-6 mt-8 pt-8 border-t border-border">

                {/* Students List Section Header */}
                <div className="pb-2 border-b border-border">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">
                    Added Students ({studentFields.length})
                  </h3>
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                  {studentFields.map((studentField, studentIndex) => {
                    // get the student data from the form
                    const student = form.getValues(`students.${studentIndex}`);

                    // flag: True if the student is being edited
                    const isBeingEdited = editingStudentIndex === studentIndex;

                    // construct the full name of the student
                    const fullName = student
                      ? `${student.firstName}${student.middleName ? " " + student.middleName : ""
                      } ${student.lastName}`
                      : "";

                    return (
                      <AccordionItem
                        key={studentField.id}
                        value={`student-${studentField.id}`}
                        className={`border border-border rounded-lg ${isBeingEdited ? "ring-2 ring-primary" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 p-2">
                          <AccordionTrigger className="flex-1 text-left cursor-pointer h-14">
                            <div className="min-w-0">
                              {/* Student Full Name */}
                              <h4 className="font-semibold text-foreground text-sm text-base md:text-lg">
                                {fullName}
                              </h4>
                            </div>
                          </AccordionTrigger>
                          <div className="flex items-start">
                            {/* Edit Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingStudent(studentIndex)}
                              className="text-primary hover:text-primary/80 cursor-pointer"
                              title="Edit"
                              disabled={isBeingEdited}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {/* Delete Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStudent(studentIndex)}
                              className="text-destructive hover:text-destructive/80 cursor-pointer"
                              title="Delete"
                              disabled={isBeingEdited}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent>
                          <div className="px-2 pb-2 space-y-2 border-border">
                            <div className="overflow-x-auto ">
                              <Table className="w-full text-sm border border-border rounded-md overflow-hidden">
                                <TableHeader className="bg-muted font-semibold text-sm border-b border-border">
                                  <TableRow className="divide-x divide-border text-sm md:text-base font-semibold">
                                    <TableHead className="px-2 py-2 ">DOB</TableHead>
                                    <TableHead className="px-2 py-2 ">Gender</TableHead>
                                    <TableHead className="px-2 py-2 ">Department</TableHead>
                                    <TableHead className="px-2 py-2 ">Days Present</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="text-foreground text-sm md:text-base text-left divide-x divide-border border-b border-border text-sm md:text-base">
                                    <TableCell className="px-2 py-2">
                                      {student?.dateOfBirth ? format(new Date(student.dateOfBirth), "PPP") : "N/A"}
                                    </TableCell>
                                    <TableCell className="px-2 py-2">
                                      {student?.gender ? String(student.gender) : "N/A"}
                                    </TableCell>
                                      <TableCell className="px-2 py-2">
                                      {student?.department ? String(student.department) : "N/A"}
                                    </TableCell>
                                    <TableCell className="px-2 py-2">
                                      {student?.daysPresent ? `${student.daysPresent} days` : "N/A"}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            {/* Student Subjects */}
                            {student?.subjects && student.subjects.length > 0 && (
                              <div className="px-2">
                                <p className="text-sm md:text-base text-muted-foreground">
                                  Subjects:
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {student.subjects.map(
                                    (subject: { id: string; name: string }, index: number) => (
                                      <span
                                        key={subject.id || index}
                                        className="text-sm md:text-base bg-primary/15 text-primary px-2 py-1 rounded"
                                      >
                                        {subject.name}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            )}

            {/* Form-level validation */}
            <FormField
              control={form.control}
              name="students"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit / Discard Buttons */}
            <div className="pt-4 md:pt-6 border-t border-border mt-4 md:mt-6">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!form.formState.isDirty || loading}
                  onClick={() => { form.reset(); cancelEditing(); }}
                  className="w-max h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  Discard Changes
                </Button>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={editingStudentIndex !== null || !form.formState.isDirty || loading}
                  className="w-max h-10 md:h-14 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </LoadingButton>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}