"use client";

import { useEffect, useMemo, useState } from "react";

import { SecuritySetupModal } from "@/shared-components/security-setup-modal";
import { LoadingButton } from "@/shared-components/loading-button";
import SmallTermText from "@/shared-components/small-term-text";

import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Badge } from "@/shadcn/ui/badge";

import { ArrowUpRight, Check, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import {
    getMockStudentsByClass,
    MOCK_CLASSES,
    type MockStudent,
} from "./mock-data";
import { PromotionsLoadingTable } from "./promotions-loading-table";

// Format a student's display name with optional middle initial
function getDisplayName(student: Pick<MockStudent, "firstName" | "middleName" | "lastName">) {
    const mid = student.middleName?.trim();
    const initial = mid ? ` ${mid.charAt(0).toUpperCase()}.` : "";
    return `${student.firstName.trim()}${initial} ${student.lastName.trim()}`;
}

// Promotions form component
export function PromotionsForm() {
    // Org admin gate — disable management features for non-orgadmin users
    const { user } = useUser();
    const canManage = user?.role === "orgadmin";

    // Class selector state
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [classPickerOpen, setClassPickerOpen] = useState(false);
    const [classSearchQuery, setClassSearchQuery] = useState("");

    // Students for the selected class (mock fetch)
    const [classStudents, setClassStudents] = useState<MockStudent[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    // Students marked for promotion
    const [promotedStudentIds, setPromotedStudentIds] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedClass = MOCK_CLASSES.find((cls) => cls.id === selectedClassId) ?? null;

    // Filter classes for the dropdown search
    const filteredClasses = useMemo(() => {
        const query = classSearchQuery.trim().toLowerCase();
        if (!query) return MOCK_CLASSES;
        return MOCK_CLASSES.filter((cls) => cls.name.toLowerCase().includes(query));
    }, [classSearchQuery]);

    // Mock fetch students when class changes
    useEffect(() => {
        if (!selectedClassId) {
            setClassStudents([]);
            setPromotedStudentIds(new Set());
            return;
        }

        setIsLoadingStudents(true);
        setPromotedStudentIds(new Set());

        // Simulate a short network delay
        const timer = window.setTimeout(() => {
            setClassStudents(getMockStudentsByClass(selectedClassId));
            setIsLoadingStudents(false);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [selectedClassId]);

    // Toggle a student in/out of the promotion list
    function togglePromoteStudent(studentId: string) {
        if (!canManage) return;

        setPromotedStudentIds((prev) => {
            const next = new Set(prev);
            if (next.has(studentId)) {
                next.delete(studentId);
            } else {
                next.add(studentId);
            }
            return next;
        });
    }

    // Promote all visible students
    function promoteAllStudents() {
        if (!canManage || classStudents.length === 0) return;
        setPromotedStudentIds(new Set(classStudents.map((student) => student.id)));
    }

    // Clear promotion selection
    function clearPromotionSelection() {
        setPromotedStudentIds(new Set());
    }

    // Handle promotion submit — no backend yet, log to console
    async function handlePromoteStudents() {
        if (!canManage || !selectedClass) return;

        if (promotedStudentIds.size === 0) {
            toast.error("Select at least one student to promote.");
            return;
        }

        if (!selectedClass.nextClassId) {
            toast.error("This class has no next level configured for promotion.");
            return;
        }

        setIsSubmitting(true);

        const promotedStudents = classStudents
            .filter((student) => promotedStudentIds.has(student.id))
            .map((student) => ({
                id: student.id,
                fullName: getDisplayName(student),
                gender: student.gender,
                fromClassId: selectedClass.id,
                toClassId: selectedClass.nextClassId,
            }));

        const payload = {
            fromClass: {
                id: selectedClass.id,
                name: selectedClass.name,
            },
            toClass: {
                id: selectedClass.nextClassId,
                name: selectedClass.nextClassName,
            },
            students: promotedStudents,
            promotedAt: new Date().toISOString(),
            promotedBy: user?.id ?? null,
        };

        // Simulate submit delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // No backend yet — inspect collected data in the console
        console.log("[promotions] promote students:", payload);

        setIsSubmitting(false);
        toast.success(`${promotedStudents.length} student(s) marked for promotion.`, {
            description: "Payload logged to the console (mock data).",
        });
        clearPromotionSelection();
    }

    return (
        <>
            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Promotions
                    </h1>
                    <SmallTermText />
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Select a class, mark students for promotion, then confirm to move them to the next level.
                    </p>
                </div>
            </section>

            {/* Security setup modal — shown once if 2FA is not yet enabled */}
            <SecuritySetupModal />

            {/* Main Card */}
            <Card className="border shadow-md">
                <CardContent className="space-y-6">
                    <section className="overflow-hidden rounded-sm bg-card">

                        {/* Header: class selector + promotion target hint */}
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-1">
                                <h4 className="text-base md:text-lg font-semibold text-foreground">
                                    Class
                                </h4>
                                {selectedClass?.nextClassName ? (
                                    <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5">
                                        <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                                        Promotions move students to <span className="font-medium text-foreground">{selectedClass.nextClassName}</span>
                                    </p>
                                ) : selectedClass ? (
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        Final class — no further promotion level configured.
                                    </p>
                                ) : null}
                            </div>

                            {/* Class selector — Popover + search (matches enrollment page) */}
                            <div className="w-full sm:max-w-xs">
                                <Popover open={classPickerOpen} onOpenChange={setClassPickerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={classPickerOpen}
                                            className="h-10 md:h-12 w-full justify-between font-normal"
                                        >
                                            <span className="truncate">
                                                {MOCK_CLASSES.find((cls) => cls.id === selectedClassId)?.name ??
                                                    "Select a class..."}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        align="start"
                                        className="w-[--radix-popover-trigger-width] p-0"
                                    >
                                        <div className="border-b p-2">
                                            <Input
                                                placeholder="Search classes..."
                                                value={classSearchQuery}
                                                onChange={(e) => setClassSearchQuery(e.target.value)}
                                                className="h-8 border-0 shadow-none focus-visible:ring-0"
                                            />
                                        </div>

                                        <div className="max-h-52 overflow-y-auto p-1">
                                            {filteredClasses.length === 0 ? (
                                                <p className="py-4 text-center text-sm text-muted-foreground">
                                                    No classes found
                                                </p>
                                            ) : (
                                                filteredClasses.map((cls) => (
                                                    <button
                                                        key={cls.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedClassId(cls.id);
                                                            setClassPickerOpen(false);
                                                            setClassSearchQuery("");
                                                        }}
                                                        className={cn(
                                                            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                            selectedClassId === cls.id && "font-medium",
                                                        )}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "h-4 w-4 shrink-0",
                                                                selectedClassId === cls.id ? "opacity-100" : "opacity-0",
                                                            )}
                                                        />
                                                        {cls.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Body */}
                        {!selectedClassId ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    Select a class to view students eligible for promotion.
                                </p>
                            </div>
                        ) : isLoadingStudents ? (
                            <PromotionsLoadingTable />
                        ) : classStudents.length === 0 ? (
                            <div className="w-full rounded-md border-2 border-dashed border-border/80 py-16 text-center">
                                <p className="text-base font-medium text-muted-foreground">
                                    No students found in this class.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Selection summary */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
                                    <p className="text-sm text-muted-foreground">
                                        {classStudents.length} student{classStudents.length === 1 ? "" : "s"} in {selectedClass?.name}
                                        {promotedStudentIds.size > 0 && (
                                            <span className="ml-2 text-foreground font-medium">
                                                · {promotedStudentIds.size} selected
                                            </span>
                                        )}
                                    </p>
                                    {canManage && (
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={promoteAllStudents}
                                                className="cursor-pointer h-9"
                                            >
                                                Select all
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearPromotionSelection}
                                                disabled={promotedStudentIds.size === 0}
                                                className="cursor-pointer h-9"
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Students table */}
                                <div className="overflow-x-auto py-3">
                                    <table className="min-w-[560px] w-full table-fixed border-collapse text-sm md:text-base text-left">
                                        <colgroup>
                                            <col className="w-[8%]" />
                                            <col className="w-[52%]" />
                                            <col className="w-[20%]" />
                                            <col className="w-[20%]" />
                                        </colgroup>
                                        <thead>
                                            <tr className="bg-muted/50 border-b border-border">
                                                <th className="p-2 text-left font-semibold text-muted-foreground">S/N</th>
                                                <th className="p-2 text-left font-semibold text-muted-foreground">Student</th>
                                                <th className="p-2 text-left font-semibold text-muted-foreground">Gender</th>
                                                <th className="p-2 text-right font-semibold text-muted-foreground">Promote</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classStudents.map((student, index) => {
                                                const isPromoted = promotedStudentIds.has(student.id);

                                                return (
                                                    <tr
                                                        key={student.id}
                                                        className={cn(
                                                            "border-b border-border last:border-b-0 transition-colors",
                                                            isPromoted
                                                                ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                                                                : "hover:bg-primary/5",
                                                        )}
                                                    >
                                                        <td className="p-2 text-muted-foreground">{index + 1}</td>
                                                        <td className="p-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-foreground">
                                                                    {getDisplayName(student)}
                                                                </span>
                                                                {isPromoted && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] uppercase tracking-wide"
                                                                    >
                                                                        Promote
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-muted-foreground capitalize">
                                                            {student.gender.toLowerCase()}
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex justify-end">
                                                                {canManage && (
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant={isPromoted ? "default" : "outline"}
                                                                        onClick={() => togglePromoteStudent(student.id)}
                                                                        title={isPromoted ? "Remove from promotion list" : "Promote this student"}
                                                                        aria-label={isPromoted ? "Remove from promotion list" : "Promote this student"}
                                                                        className={cn(
                                                                            "h-9 w-9 rounded-full cursor-pointer transition-all",
                                                                            isPromoted
                                                                                ? "bg-emerald-600 hover:bg-emerald-600/90 text-white"
                                                                                : "border-primary/30 text-primary hover:bg-primary/10",
                                                                        )}
                                                                    >
                                                                        {isPromoted ? (
                                                                            <Check className="h-4 w-4" />
                                                                        ) : (
                                                                            <Plus className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Submit */}
                                {canManage && (
                                    <div className="flex justify-end pt-4 border-t border-border mt-4">
                                        <LoadingButton
                                            type="button"
                                            loading={isSubmitting}
                                            disabled={
                                                promotedStudentIds.size === 0 ||
                                                !selectedClass?.nextClassId
                                            }
                                            onClick={() => void handlePromoteStudents()}
                                            className="h-10 md:h-12 text-sm md:text-base font-medium shadow-sm hover:shadow transition-shadow cursor-pointer"
                                        >
                                            Promote selected ({promotedStudentIds.size})
                                        </LoadingButton>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </CardContent>
            </Card>
        </>
    );
}
