"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { TeacherModal } from "./teacher-modal";
import { EditTeacherModal } from "./edit-teacher-modal";
import SmallTermText from "@/shared-components/small-term-text";
import type { TeacherInvitationStatus } from "@/types/teachers";

// Add Teacher Schema (sendEmail is modal-only, not persisted)
const addTeacherSchema = z.object({
    title: z.string().trim(),
    fullName: z.string().trim().min(1, { message: "Full name is required" }),
    email: z.email({ message: "Valid email is required" }),
    sendEmail: z.boolean(),
});

// Edit Teacher Schema — only title and full name can be changed
const editTeacherSchema = z.object({
    title: z.string().trim(),
    fullName: z.string().trim().min(1, { message: "Full name is required" }),
});

// Add Teacher Values (form shape)
export type AddTeacherValues = z.infer<typeof addTeacherSchema>;

// Edit Teacher Values (form shape)
export type EditTeacherValues = z.infer<typeof editTeacherSchema>;

// Teacher record stored in state (sendEmail is dropped, status is added)
type Teacher = {
    title: string;
    fullName: string;
    email: string;
    status: TeacherInvitationStatus;
};

// Styling based on status badge
export const statusConfig: Record<TeacherInvitationStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "border-amber-500/30   bg-amber-500/10   text-amber-700   dark:text-amber-300" },
    CLICKED: { label: "Clicked", className: "border-blue-500/30    bg-blue-500/10    text-blue-700    dark:text-blue-300" },
    ACCEPTED: { label: "Accepted", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
    EXPIRED: { label: "Expired", className: "border-orange-500/30  bg-orange-500/10  text-orange-700  dark:text-orange-300" },
    REVOKED: { label: "Revoked", className: "border-red-500/30     bg-red-500/10     text-red-700     dark:text-red-300" },
    UNSENT: { label: "Unsent", className: "border-gray-500/30     bg-gray-500/10     text-gray-700     dark:text-gray-300" },
};

// Status Badge Component
function StatusBadge({ status }: { status: TeacherInvitationStatus }) {
    const { label, className } = statusConfig[status];
    return (
        <Badge variant="outline" className={`text-xs md:text-sm font-medium ${className} rounded-xl`}>
            {label}
        </Badge>
    );
}

// Placeholder data
const placeholderTeachers: Teacher[] = [
    { title: "Mr", fullName: "David Nkrumah", email: "david.nkrumah@school.edu", status: "ACCEPTED" },
    { title: "Ms", fullName: "Grace Asante", email: "grace.asante@school.edu", status: "PENDING" },
    { title: "Dr", fullName: "Sarah Kimani", email: "sarah.kimani@school.edu", status: "CLICKED" },
];

// Teachers Form Component
export function TeachersForm() {
    // States: teachers list, open/close add teacher dialog, search query, and status filter
    const [teachers, setTeachers] = useState<Teacher[]>(placeholderTeachers);
    const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TeacherInvitationStatus | "ALL">("ALL");

    // Edit teacher state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTeacherEmail, setEditingTeacherEmail] = useState<string | null>(null);

    // Edit teacher form
    const editForm = useForm<EditTeacherValues>({
        resolver: zodResolver(editTeacherSchema),
        defaultValues: { title: "", fullName: "" },
    });

    // Add teacher form with resolver and default values
    const addForm = useForm<AddTeacherValues>({
        resolver: zodResolver(addTeacherSchema),
        defaultValues: {
            title: "",
            fullName: "",
            email: "",
            sendEmail: true,
        },
    });

    // Filtered Teachers — applies both text search and status filter
    const filteredTeachers = useMemo(() => {
        // Trim and lowercase search query
        const query = searchQuery.trim().toLowerCase();
        // Filter teachers based on status and query
        return teachers.filter((t) => {
            // Check if status matches filter or is all
            const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
            const matchesQuery = !query || (
                t.fullName.toLowerCase().includes(query) ||
                t.email.toLowerCase().includes(query) ||
                t.title.toLowerCase().includes(query)
            );  // return only elements that where the filter status and query match
            return matchesStatus && matchesQuery;
        });
    }, [teachers, searchQuery, statusFilter]);

    // Open Add Teacher Dialog
    const openAddTeacherDialog = () => {
        addForm.reset({ title: "", fullName: "", email: "", sendEmail: true }); // reset form to default values
        setIsTeacherDialogOpen(true);
    };

    // Open Edit Teacher Dialog — pre-fill with the selected teacher's current values
    function openEditTeacherDialog(teacher: Teacher) {
        setEditingTeacherEmail(teacher.email);
        editForm.reset({ title: teacher.title === "N/A" ? "" : teacher.title, fullName: teacher.fullName });
        setIsEditDialogOpen(true);
    }

    // Add Teacher
    async function addTeacher(values: AddTeacherValues) {
        // Normalize email (for case-insensitive comparison)
        const normalizedEmail = values.email.trim().toLowerCase();
        // Check if email already exists
        const duplicate = teachers.some((t) => t.email.toLowerCase() === normalizedEmail);
        // Filter out duplicate emails
        if (duplicate) {
            addForm.setError("email", { message: "A teacher with this email already exists" });
            return;
        }
        // Create new teacher record
        const newTeacher: Teacher = {
            title: values.title.trim() || "N/A", // default to "N/A" if title is empty
            fullName: values.fullName.trim(),
            email: normalizedEmail,
            status: "PENDING",
        };

        // Update local state and close dialog
        setTeachers((prev) => [...prev, newTeacher]);
        setIsTeacherDialogOpen(false);
        addForm.reset();

        if (values.sendEmail) {
            toast.success(`Invitation email sent to ${newTeacher.email}`);
        } else {
            toast.success(`Teacher "${newTeacher.fullName}" added without sending an invitation email`);
        }
    }

    // Revoke invitation
    function revokeTeacher(email: string) {
        // Update local state by changing the status to REVOKED
        setTeachers((prev) =>
            prev.map((t) => t.email === email ? { ...t, status: "REVOKED" as TeacherInvitationStatus } : t)
        );
        // TODO: Make api call to revoke invitation
        toast.success("Invitation revoked");
    }

    // Save edited teacher (title and fullName only)
    function updateTeacher(values: EditTeacherValues) {
        if (!editingTeacherEmail) return;
        setTeachers((prev) =>
            prev.map((t) =>
                t.email === editingTeacherEmail
                    ? { ...t, title: values.title.trim() || "N/A", fullName: values.fullName.trim() }
                    : t
            )
        );
        setIsEditDialogOpen(false);
        setEditingTeacherEmail(null);
        // TODO: Make api call to update teacher
        toast.success("Teacher details updated");
    }

    const loading = addForm.formState.isSubmitting // TODO: Make api call to revoke invitation

    return (
        <>
            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Teachers</h1>
                    <SmallTermText />
                </div>
                <Button type="button" className="w-fit cursor-pointer h-10 md:h-12 sm:self-center" onClick={openAddTeacherDialog}>
                    <Plus className="h-3 w-3" />
                    Add Teacher
                </Button>
            </section>

            {/* Add Teacher Modal */}
            <TeacherModal
                open={isTeacherDialogOpen}
                onOpenChange={setIsTeacherDialogOpen}
                form={addForm}
                onSubmit={addTeacher}
                loading={loading}
            />

            {/* Edit Teacher Modal */}
            <EditTeacherModal
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                form={editForm}
                onSubmit={updateTeacher}
                onRevoke={() => {
                    if (!editingTeacherEmail) return;
                    revokeTeacher(editingTeacherEmail);
                    // setIsEditDialogOpen(false);
                    // setEditingTeacherEmail(null);
                }}
                loading={editForm.formState.isSubmitting}
                teacher={teachers.find((t) => t.email === editingTeacherEmail) ?? null}
            />

            {/* Teacher Table Card */}
            <Card className="border shadow-md">
                <CardContent>
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Table Header */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="text-base font-semibold text-foreground md:text-lg">
                                All Teachers ({teachers.length})
                            </h4>
                            <div className="flex items-center gap-2">
                                {/* Text search */}
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="h-10 md:h-12 w-1/2 sm:max-w-xs"
                                    disabled={loading || teachers.length === 0}
                                />
                                {/* Status filter */}
                                <div className="flex-1">
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(v) => setStatusFilter(v as TeacherInvitationStatus | "ALL")}
                                        disabled={teachers.length === 0}
                                    >
                                        <SelectTrigger className="h-10 md:h-12 w-36">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All</SelectItem>
                                            {(Object.keys(statusConfig) as TeacherInvitationStatus[]).map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {statusConfig[s].label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Empty / Filtered-empty / Table */}
                        {teachers.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">No teachers yet</p>
                            </div>
                        ) : filteredTeachers.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                No teachers match your search.
                            </div>
                        ) : (
                            <div className="overflow-x-auto py-3">
                                <table className="min-w-[480px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                    <colgroup>
                                        <col className="w-[10%]" />
                                        <col className="w-[30%]" />
                                        <col className="w-[32%]" />
                                        <col className="w-[18%]" />
                                        <col className="w-[10%]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Title</th>
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Name</th>
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Email</th>
                                            <th className="p-2 text-left font-semibold text-muted-foreground">Status</th>
                                            <th className="p-2 text-right font-semibold text-muted-foreground "></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers.map((teacher) => (
                                            <tr key={teacher.email} className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5">
                                                {/* Title */}
                                                <td className="p-2 whitespace-nowrap">
                                                    <span className="inline-flex py-1">{teacher.title}</span>
                                                </td>
                                                {/* Name */}
                                                <td className="p-2">
                                                    <span className="block truncate font-medium text-foreground">{teacher.fullName}</span>
                                                </td>
                                                {/* Email */}
                                                <td className="p-2">
                                                    <span className="block truncate text-muted-foreground">{teacher.email}</span>
                                                </td>
                                                {/* Status */}
                                                <td className="p-2 text-xs md:text-sm">
                                                    <StatusBadge status={teacher.status} />
                                                </td>
                                                {/* Actions */}
                                                <td className="p-2">
                                                    <div className="flex items-center justify-start gap-1">
                                                        {/* Edit Button */}
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => openEditTeacherDialog(teacher)}
                                                            className="cursor-pointer border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300 text-sm"
                                                            aria-label="Edit teacher"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </Button>
                                                    </div>
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