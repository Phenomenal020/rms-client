"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { ClassModal } from "./class-modal";
import SmallTermText from "@/shared-components/small-term-text";

// ─── Zod schema ──────────────────────────────────────────────────────────────
const classSchema = z.object({
    className: z.string().trim().min(1, { message: "Class name is required" }),
    teacher: z.string().trim().optional(),
});
export type AddClassValues = z.infer<typeof classSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────
export type SubjectEntry = {
    subject: string;
    /** Teacher assigned to this subject in this class */
    teacher: string;
};

export type ClassEntry = {
    id: string;
    className: string;
    /** Class / form teacher */
    teacher: string;
    subjects: SubjectEntry[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const TEACHER_OPTIONS = [
    "Mr. David Nkrumah",
    "Ms. Grace Asante",
    "Dr. Sarah Kimani",
    "Mrs. Ngozi Okafor",
];

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

const placeholderClasses: ClassEntry[] = [
    { id: "cls-1", className: "JSS 1A", teacher: "Mr. David Nkrumah", subjects: [] },
    { id: "cls-2", className: "JSS 2A", teacher: "", subjects: [] },
    { id: "cls-3", className: "SS 1A", teacher: "Ms. Grace Asante", subjects: [] },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function ClassesForm() {
    const [classes, setClasses] = useState<ClassEntry[]>(placeholderClasses);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // ── Add dialog ──────────────────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const addForm = useForm<AddClassValues>({
        resolver: zodResolver(classSchema),
        defaultValues: { className: "", teacher: "" },
    });

    // ── Edit dialog ─────────────────────────────────────────────────────────
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ClassEntry | null>(null);
    const editForm = useForm<AddClassValues>({
        resolver: zodResolver(classSchema),
        defaultValues: { className: "", teacher: "" },
    });

    // ─── Derived ────────────────────────────────────────────────────────────
    const filteredClasses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return classes;
        return classes.filter((e) => {
            const teacher = (e.teacher || "Not assigned").toLowerCase();
            return e.className.toLowerCase().includes(query) || teacher.includes(query);
        });
    }, [classes, searchQuery]);

    const addLoading = addForm.formState.isSubmitting;
    const editLoading = editForm.formState.isSubmitting;

    // ─── Handlers ───────────────────────────────────────────────────────────
    function toggleRowExpand(id: string) {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function openAddDialog() {
        addForm.reset({ className: "", teacher: "" });
        setIsAddOpen(true);
    }

    async function addClass(values: AddClassValues, subjects: string[]) {
        const className = values.className.trim();
        const teacher = values.teacher?.trim() || "";
        if (classes.some((e) => e.className.toLowerCase() === className.toLowerCase())) {
            addForm.setError("className", { message: `Class "${className}" already exists` });
            return;
        }
        setClasses((prev) => [
            ...prev,
            {
                id: `cls-${Date.now()}`,
                className,
                teacher,
                subjects: subjects.map((s) => ({ subject: s, teacher: "" })),
            },
        ]);
        setIsAddOpen(false);
        addForm.reset();
        toast.success(`Class "${className}" added successfully`);
    }

    function openEditDialog(entry: ClassEntry) {
        setEditTarget(entry);
        editForm.reset({ className: entry.className, teacher: entry.teacher || "" });
        setIsEditOpen(true);
    }

    async function saveEdit(values: AddClassValues, subjects: string[]) {
        if (!editTarget) return;
        const className = values.className.trim();
        const teacher = values.teacher?.trim() || "";
        if (
            classes.some(
                (e) => e.className.toLowerCase() === className.toLowerCase() && e.id !== editTarget.id
            )
        ) {
            editForm.setError("className", { message: `Class "${className}" already exists` });
            return;
        }
        setClasses((prev) =>
            prev.map((e) => {
                if (e.id !== editTarget.id) return e;
                const existingTeachers = new Map(e.subjects.map((s) => [s.subject, s.teacher]));
                return {
                    ...e,
                    className,
                    teacher,
                    subjects: subjects.map((s) => ({
                        subject: s,
                        teacher: existingTeachers.get(s) ?? "",
                    })),
                };
            })
        );
        setIsEditOpen(false);
        setEditTarget(null);
        toast.success("Class updated successfully");
    }

    function updateSubjectTeacher(classId: string, subject: string, teacher: string) {
        setClasses((prev) =>
            prev.map((e) =>
                e.id !== classId
                    ? e
                    : { ...e, subjects: e.subjects.map((s) => s.subject === subject ? { ...s, teacher } : s) }
            )
        );
    }

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <>
            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Classes</h1>
                    <SmallTermText />
                </div>
            </section>

            {/* Add Class Modal */}
            <ClassModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                form={addForm}
                onSubmit={addClass}
                loading={addLoading}
                teacherOptions={TEACHER_OPTIONS}
                subjectOptions={SUBJECT_OPTIONS}
                mode="add"
            />

            {/* Edit Class Modal */}
            <ClassModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                form={editForm}
                onSubmit={saveEdit}
                loading={editLoading}
                teacherOptions={TEACHER_OPTIONS}
                subjectOptions={SUBJECT_OPTIONS}
                initialSubjects={editTarget?.subjects.map((s) => s.subject) ?? []}
                mode="edit"
            />

            {/* Main Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-4">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Header: count + search + add */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="text-base md:text-lg font-semibold text-foreground">
                                All Classes ({classes.length})
                            </h4>
                            <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="h-10 md:h-12 w-full sm:max-w-xs"
                                    disabled={addLoading || classes.length === 0}
                                />
                                <Button
                                    type="button"
                                    onClick={openAddDialog}
                                    className="cursor-pointer whitespace-nowrap h-10 md:h-12"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Class
                                </Button>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Empty / no-match states */}
                        {classes.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">No Class yet</p>
                            </div>
                        ) : filteredClasses.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                No classes match your search.
                            </div>
                        ) : (
                            /* Table */
                            <div className="overflow-x-auto py-2">
                                <table className="min-w-[580px] w-full border-collapse text-sm md:text-base text-left">
                                    <colgroup>
                                        <col className="w-[7%]" />
                                        <col className="w-[23%]" />
                                        <col className="w-[38%]" />
                                        <col className="w-[24%]" />
                                        <col className="w-[18%]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-2 font-semibold text-muted-foreground">S/N</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Class</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Class Teacher</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Subjects</th>
                                            <th className="p-2 font-semibold text-muted-foreground">Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClasses.map((entry, index) => {
                                            const isExpanded = expandedRows.has(entry.id);
                                            return (
                                                <React.Fragment key={entry.id}>
                                                    {/* Summary row */}
                                                    <tr className={`border-b border-border hover:bg-muted/40 transition-colors ${isExpanded ? "bg-muted/20" : ""}`}>

                                                        {/* S/N */}
                                                        <td className="p-2 font-medium text-foreground">{index + 1}</td>

                                                        {/* Class name */}
                                                        <td className="p-2 font-medium text-foreground">
                                                            <span className="block truncate">{entry.className}</span>
                                                        </td>

                                                        {/* Class teacher */}
                                                        <td className="p-2">
                                                            <span className="block truncate text-muted-foreground">
                                                                {entry.teacher || <span className="italic">Not assigned</span>}
                                                            </span>
                                                        </td>

                                                        {/* Subjects badge */}
                                                        <td className="p-2">
                                                            {entry.subjects.length === 0 ? (
                                                                <span className="italic text-xs text-muted-foreground">None assigned</span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    {entry.subjects.length} subject{entry.subjects.length !== 1 ? "s" : ""}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Edit button */}
                                                        <td className="p-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(entry)}
                                                                className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300"
                                                                aria-label="Edit class"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                                Edit
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        })}
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