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
import { useUpsertStudents } from "@/fetcher/mutations";
import Loading from "./loading";


// Student schema - for edit student form
const studentSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().trim().min(1, { message: "First name is required" }),  // required field
  middleName: z.string().trim().optional(),  // optional field
  lastName: z.string().trim().min(1, { message: "Last name is required" }),  // required field
  dateOfBirth: z.string().optional(), // optional field
  gender: z.preprocess(
    (val) => val === "" || val === undefined ? undefined : val,
    z.enum(["NONE", "MALE", "FEMALE"]).optional()
  ), // optional field - transform empty string to undefined
  department: z.preprocess(
    (val) => val === "" || val === undefined ? undefined : val,
    z.enum(["NONE", "SCIENCE", "ARTS", "GENERAL"]).optional()
  ), // Optional per schema - transform empty string to undefined
  daysPresent: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = typeof val === "string" ? Number(val) : (typeof val === "number" ? val : undefined);
      if (num === undefined || isNaN(num) || num < 0) return undefined;
      return num;
    },
    z.number().min(0, { message: "Days present must be a valid number" }).optional()
  ),
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
  const { upsertStudents, isMutating, errorMessage } = useUpsertStudents();

  // Student form - on render (MUST be called before any conditional returns)
  const form = useForm({
    resolver: zodResolver(studentsFormSchema),
    defaultValues: { // default values for the form on render
      students: students?.map((student: Student) => ({
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
        subjects: student.subjects.map((studentSubject: any) => ({
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
  }, [students?.subjects]);

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
    setEditingStudentId(student.id);

    // Populate the form with the selected student data
    setNewStudent({
      id: student.id || undefined,
      firstName: student.firstName || "",
      middleName: student.middleName || "",
      lastName: student.lastName || "",
      dateOfBirth: student.dateOfBirth || "",
      gender: student.gender || "",
      department: student.department || "",
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
    console.log('onSubmit called!', data);
    try {
      // transform students data with proper type conversions
      const studentsData = data.students.map((student) => {
        const studentData: any = {
          id: student.id || undefined,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName || undefined,
          gender: student.gender || undefined,
          department: student.department || undefined,
          daysPresent: student.daysPresent || undefined,
          subjects: [...student.subjects],
        };

        // Convert dateOfBirth from string to Date object if present
        if (student.dateOfBirth) {
          const dateValue = typeof student.dateOfBirth === 'string'
            ? new Date(student.dateOfBirth)
            : student.dateOfBirth;
          // Only include if it's a valid date
          if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            studentData.dateOfBirth = dateValue;
          }
        }

        // daysPresent is already a number from the schema, no conversion needed
        // Ensure it's a valid number if it exists
        if (studentData.daysPresent !== undefined && (isNaN(studentData.daysPresent) || studentData.daysPresent < 0)) {
          studentData.daysPresent = undefined;
        }

        return studentData;
      });

      // Call mutation to update students
      await upsertStudents(studentsData as UpsertStudentsPayload);

      // Success!
      toast.success("Students updated successfully");
      router.refresh(); // Refresh the page to show updated data
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Failed to update students", {
        description: errorMessage || "An unexpected error occurred. Please try again.",
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
              <div className="pb-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-700 uppercase tracking-wide">
                    {editingStudentIndex !== null ? "Edit Student" : "Add New Student"}
                  </h3>
                </div>
              </div>

              {/* New Student Form */}
              <Card className="border-0 shadow-none">
                <CardContent className="space-y-6 p-2">

                  {/* Basic Information: Names */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* First Name */}
                    <div className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold">
                        First Name
                      </FormLabel>
                      <Input
                        placeholder="Enter student's first name"
                        value={newStudent.firstName}
                        onChange={(e) =>
                          setNewStudent((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                      />
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold">
                        Middle Name{" "}
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <Input
                        placeholder="Enter student's middle name"
                        value={newStudent.middleName}
                        onChange={(e) =>
                          setNewStudent((prev) => ({
                            ...prev,
                            middleName: e.target.value,
                          }))
                        }
                        className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold">
                        Last Name
                      </FormLabel>
                      <Input
                        placeholder="Enter student's last name"
                        value={newStudent.lastName}
                        onChange={(e) =>
                          setNewStudent((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                      />
                    </div>

                  </div>

                  {/* DoB, Gender */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    
                    {/* Date of Birth */}
                    <div className="space-y-2 w-full">
                      <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Date of Birth
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <Popover
                        open={dateOfBirthOpen}
                        onOpenChange={setDateOfBirthOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-14 text-base justify-between font-normal cursor-pointer"
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

                    {/* Gender */}
                    <div className="space-y-2 w-full">
                      <FormLabel className="text-gray-700 font-semibold">
                        Gender
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <Select
                        value={newStudent.gender || ""}
                        onValueChange={(value) =>
                          setNewStudent((prev) => ({
                            ...prev,
                            gender: value === "NONE" ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-14 text-base">
                          <SelectValue placeholder="Select gender (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2 w-full">
                      <FormLabel className="text-gray-700 font-semibold">
                        Department
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <Select
                        value={newStudent.department || ""}
                        onValueChange={(value) =>
                          setNewStudent((prev) => ({
                            ...prev,
                            department: value === "NONE" ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-14 text-base">
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

                  {/* Department, Days Present */}
                  <div className="grid grid-cols-1  lg:grid-cols-2 gap-4">


                    {/* Days Present */}
                    <div className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold">
                        Days Present
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </FormLabel>
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
                        className="h-14 text-base transition-colors hover:border-gray-400 focus:border-primary"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Available Subjects Selection */}
                  {availableSubjects.length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">

                      {/* Select Subjects Label */}
                      <FormLabel className="text-sm sm:text-base font-semibold text-gray-700">
                        Select Subjects
                      </FormLabel>

                      {/* Select Subjects List */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
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
                                className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors w-full justify-start cursor-pointer h-14"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-700">
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
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No subjects to assign. Please add subjects in the <Link href="/settings/subjects" className="text-blue-500 hover:text-blue-700">Subjects Settings</Link> first.
                    </div>
                  )}

                  {/* Cancel/Add/Update Student Buttons */}
                  <div className="flex gap-2">
                    {/* Show cancel button based on editing mode */}
                    {editingStudentIndex !== null && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        className="flex-1 cursor-pointer"
                      >
                        Cancel
                      </Button>
                    )}
                    {/* Show Add / Update button based on editing mode */}
                    <Button
                      type="button"
                      onClick={addStudent}
                      className={`${editingStudentIndex !== null ? "flex-1" : "w-full"} h-12 text-base cursor-pointer`}
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
              <div className="space-y-6 mt-8 pt-8 border-t border-gray-200">

                {/* Students List Section Header */}
                <div className="pb-2 border-b border-gray-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-700 uppercase tracking-wide">
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
                        className={`border border-gray-200 rounded-lg ${isBeingEdited ? "ring-2 ring-blue-500" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 p-2">
                          <AccordionTrigger className="flex-1 text-left cursor-pointer h-14">
                            <div className="min-w-0">
                              {/* Student Full Name */}
                              <h4 className="font-semibold text-gray-900 text-base md:text-lg">
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
                              className="text-blue-500 hover:text-blue-700 cursor-pointer"
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
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                              title="Delete"
                              disabled={isBeingEdited}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent>
                          <div className="px-2 pb-2 space-y-2 border-gray-400">
                            <div className="overflow-x-auto ">
                              <Table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                                <TableHeader className="bg-gray-50 font-semibold text-xs border-b border-gray-200">
                                  <TableRow className="divide-x divide-gray-200 text-xs sm:text-base font-semibold">
                                    <TableHead className="px-3 py-2 ">DOB</TableHead>
                                    <TableHead className="px-3 py-2 ">Gender</TableHead>
                                    <TableHead className="px-3 py-2 ">Department</TableHead>
                                    <TableHead className="px-3 py-2 ">Days Present</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="text-gray-800 text-xs text-left divide-x divide-gray-200 border-b border-gray-400 text-xs sm:text-base">
                                    <TableCell className="px-3 py-2">
                                      {student?.dateOfBirth ? format(new Date(student.dateOfBirth), "PPP") : "N/A"}
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                      {student?.gender ? student.gender : "N/A"}
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                      {student?.department ? student.department : "N/A"}
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                      {student?.daysPresent ? `${student.daysPresent} days` : "N/A"}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            {/* Student Subjects */}
                            {student?.subjects && student.subjects.length > 0 && (
                              <div className="px-2">
                                <p className="text-xs sm:text-base text-gray-500">
                                  Subjects:
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {student.subjects.map(
                                    (subject: { id: string; name: string }, index: number) => (
                                      <span
                                        key={subject.id || index}
                                        className="text-xs sm:text-base bg-blue-100 text-blue-800 px-2 py-1 rounded"
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

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-center">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  disabled={editingStudentIndex !== null || !form.formState.isDirty || loading}
                  className="w-full sm:w-auto min-w-[160px] h-12 text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
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