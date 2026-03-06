"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, Pencil, Plus } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import SmallTermText from "@/shared-components/small-term-text";
import { StudentModal } from "./student-modal";

// ─── Zod schema ───────────────────────────────────────────────────────────────
const addStudentSchema = z.object({
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    middleName: z.string().trim().optional(),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    gender: z.enum(["male", "female"], { message: "Gender is required" }),
    className: z.string().trim().min(1, { message: "Class is required" }),
});
export type AddStudentValues = z.infer<typeof addStudentSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────
type StudentEntry = AddStudentValues & {
    id: string;
    status: "active" | "inactive";
    enrolledSubjects: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CLASS_OPTIONS = ["JSS 1A", "JSS 2A", "JSS 3A", "SS 1A", "SS 2A", "SS 3A"];

const SUBJECT_OPTIONS = [
    "Mathematics",
    "English Language",
    "Basic Science",
    "Social Studies",
    "Civic Education",
    "Agricultural Science",
    "French",
    "Computer Science",
    "Basic Technology",
    "Business Studies",
    "Physical Education",
    "Fine Art",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDisplayName(student: Pick<StudentEntry, "firstName" | "middleName" | "lastName">) {
    const mid = student.middleName?.trim();
    const initial = mid ? ` ${mid.charAt(0).toUpperCase()}.` : "";
    return `${student.firstName.trim()}${initial} ${student.lastName.trim()}`;
}

// ─── Placeholder data ─────────────────────────────────────────────────────────
const placeholderStudents: StudentEntry[] = [
    {
        id: "stu-1",
        firstName: "David",
        middleName: "Kwame",
        lastName: "Nkrumah",
        gender: "male",
        className: "SS 1A",
        status: "active",
        enrolledSubjects: [],
    },
    {
        id: "stu-2",
        firstName: "Grace",
        middleName: "Ama",
        lastName: "Asante",
        gender: "female",
        className: "JSS 3A",
        status: "inactive",
        enrolledSubjects: [],
    },
    {
        id: "stu-3",
        firstName: "Sarah",
        middleName: "",
        lastName: "Kimani",
        gender: "female",
        className: "JSS 2A",
        status: "active",
        enrolledSubjects: [],
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function StudentsForm() {
    const [students, setStudents] = useState<StudentEntry[]>(placeholderStudents);
    const [searchQuery, setSearchQuery] = useState("");

    // ── Add dialog ──────────────────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const addForm = useForm<AddStudentValues>({
        resolver: zodResolver(addStudentSchema),
        defaultValues: { firstName: "", middleName: "", lastName: "", gender: "male", className: "" },
    });

    // ── Edit dialog ─────────────────────────────────────────────────────────
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<StudentEntry | null>(null);
    const editForm = useForm<AddStudentValues>({
        resolver: zodResolver(addStudentSchema),
        defaultValues: { firstName: "", middleName: "", lastName: "", gender: "male", className: "" },
    });

    // ─── Derived ────────────────────────────────────────────────────────────
    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return students;
        return students.filter((s) => {
            const fullName = getDisplayName(s).toLowerCase();
            return (
                fullName.includes(query) ||
                s.className.toLowerCase().includes(query)
            );
        });
    }, [students, searchQuery]);

    const addLoading = addForm.formState.isSubmitting;
    const editLoading = editForm.formState.isSubmitting;

    // ─── Handlers ───────────────────────────────────────────────────────────
    function openAddDialog() {
        addForm.reset({ firstName: "", middleName: "", lastName: "", gender: "male", className: "" });
        setIsAddOpen(true);
    }

    async function addStudent(values: AddStudentValues, subjects: string[]) {
        const firstName = values.firstName.trim();
        const middleName = values.middleName?.trim() || "";
        const lastName = values.lastName.trim();
        const exists = students.some(
            (s) =>
                s.firstName.toLowerCase() === firstName.toLowerCase() &&
                (s.middleName || "").toLowerCase() === middleName.toLowerCase() &&
                s.lastName.toLowerCase() === lastName.toLowerCase()
        );
        if (exists) {
            addForm.setError("firstName", { message: "A student with this full name already exists" });
            return;
        }
        const newStudent: StudentEntry = {
            id: `stu-${Date.now()}`,
            firstName,
            middleName,
            lastName,
            gender: values.gender,
            className: values.className.trim(),
            status: "active",
            enrolledSubjects: subjects,
        };
        setStudents((prev) => [...prev, newStudent]);
        setIsAddOpen(false);
        addForm.reset();
        toast.success(`Student "${getDisplayName(newStudent)}" added successfully`);
    }

    function openEditDialog(student: StudentEntry) {
        setEditTarget(student);
        editForm.reset({
            firstName: student.firstName,
            middleName: student.middleName || "",
            lastName: student.lastName,
            gender: student.gender,
            className: student.className,
        });
        setIsEditOpen(true);
    }

    async function saveEdit(values: AddStudentValues, subjects: string[]) {
        if (!editTarget) return;
        const firstName = values.firstName.trim();
        const middleName = values.middleName?.trim() || "";
        const lastName = values.lastName.trim();
        const exists = students.some(
            (s) =>
                s.id !== editTarget.id &&
                s.firstName.toLowerCase() === firstName.toLowerCase() &&
                (s.middleName || "").toLowerCase() === middleName.toLowerCase() &&
                s.lastName.toLowerCase() === lastName.toLowerCase()
        );
        if (exists) {
            editForm.setError("firstName", { message: "A student with this full name already exists" });
            return;
        }
        setStudents((prev) =>
            prev.map((s) =>
                s.id !== editTarget.id
                    ? s
                    : {
                          ...s,
                          firstName,
                          middleName,
                          lastName,
                          gender: values.gender,
                          className: values.className.trim(),
                          enrolledSubjects: subjects,
                      }
            )
        );
        setIsEditOpen(false);
        setEditTarget(null);
        toast.success("Student updated successfully");
    }

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <>
            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Add Student Modal */}
            <StudentModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                form={addForm}
                onSubmit={addStudent}
                loading={addLoading}
                classOptions={CLASS_OPTIONS}
                subjectOptions={SUBJECT_OPTIONS}
                mode="add"
            />

            {/* Edit Student Modal */}
            <StudentModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                form={editForm}
                onSubmit={saveEdit}
                loading={editLoading}
                classOptions={CLASS_OPTIONS}
                subjectOptions={SUBJECT_OPTIONS}
                initialSubjects={editTarget?.enrolledSubjects ?? []}
                mode="edit"
            />

            {/* Main Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Header: count + search + add */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">
                                All Students ({students.length})
                            </h4>
                            <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="h-10 md:h-12 w-full sm:max-w-xs"
                                    disabled={addLoading || students.length === 0}
                                />
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="cursor-pointer whitespace-nowrap h-10 md:h-12"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Student
                                </Button>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Empty / no-match states */}
                        {students.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">No Student yet</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                No students match your search.
                            </div>
                        ) : (
                            /* Table */
                            <div className="overflow-x-auto py-2">
                                <table className="min-w-[480px] w-full border-collapse text-sm md:text-base text-left">
                                    <colgroup>
                                        {/* S/N | Student | Class | Subjects | Actions */}
                                        <col className="w-[7%]" />
                                        <col className="w-[33%]" />
                                        <col className="w-[18%]" />
                                        <col className="w-[22%]" />
                                        <col className="w-[20%]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Student</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Class</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Subjects</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student, index) => (
                                            <tr
                                                key={student.id}
                                                className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors"
                                            >
                                                {/* S/N */}
                                                <td className="p-2 font-medium text-foreground">{index + 1}</td>

                                                {/* Student name */}
                                                <td className="p-2 font-medium text-foreground">
                                                    <span className="block truncate">{getDisplayName(student)}</span>
                                                </td>

                                                {/* Class */}
                                                <td className="p-2">
                                                    <span className="block truncate text-muted-foreground">
                                                        {student.className}
                                                    </span>
                                                </td>

                                                {/* Enrolled subjects badge */}
                                                <td className="p-2">
                                                    {student.enrolledSubjects.length === 0 ? (
                                                        <span className="italic text-xs text-muted-foreground">
                                                            Not enrolled
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                            <BookOpen className="h-3 w-3" />
                                                            {student.enrolledSubjects.length} subject
                                                            {student.enrolledSubjects.length !== 1 ? "s" : ""}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions: Edit only */}
                                                <td className="p-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(student)}
                                                        className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
                                                        aria-label="Edit student"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </CardContent>
            </Card>
        </>
    );
}
