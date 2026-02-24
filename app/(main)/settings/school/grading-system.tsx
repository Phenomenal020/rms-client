"use client";

import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Plus, X, Pencil, Check } from "lucide-react";
import { FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { type UseFormReturn } from "react-hook-form";
import type { TermFormValues } from "./term-form";
import type { GradingEntry } from "@/types/term";

// Type for grading entry state
// Props interface for GradingSystem
interface GradingSystemProps {
    form: UseFormReturn<TermFormValues>;
    currentGradingEntry: GradingEntry;
    setCurrentGradingEntry: (entry: GradingEntry) => void;
    addGradingEntry: () => void;
    editGradingEntry: (index: number) => void;
    removeGradingEntry: (index: number) => void;
    editingIndex: number | null;
    cancelEdit: () => void;
}

export function GradingSystem({ form, currentGradingEntry, setCurrentGradingEntry, addGradingEntry, editGradingEntry, removeGradingEntry, editingIndex, cancelEdit }: GradingSystemProps) {
    const gradingEntry = form.watch("gradingEntry") || [];
    
    return (
        <div className="space-y-4 mt-4 pt-4 border-t border-border">
            {/* Grading System Section */}
            <div className="space-y-4">

                {/* Grading System Section subheading (h3) */}
                <div className="pb-2 border-b border-border">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Grading System <span className="text-destructive text-base">*</span></h3>
                </div>

                <p className="text-xs md:text-sm text-muted-foreground">Add grade ranges (e.g., A: 90-100, B: 80-89. Should equal 100% and no overlap)</p>

                {/* Add/Edit Grading Entry */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    {/* Grade Field */}
                    <div className="col-span-12 sm:col-span-3">
                        <Input
                            type="text"
                            placeholder="Grade (A, B, C...)"
                            value={currentGradingEntry.grade}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentGradingEntry({ ...currentGradingEntry, grade: e.target.value })
                            }
                            className="h-10 md:h-14 text-sm md:text-base"
                        />
                    </div>
                    {/* Min Score Field */}
                    <div className="col-span-12 sm:col-span-3">
                        <Input
                            placeholder="Min Score"
                            type="number"
                            min="0"
                            value={currentGradingEntry.minScore}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentGradingEntry({ ...currentGradingEntry, minScore: e.target.value })
                            }
                            className="h-10 md:h-14 text-sm md:text-base"
                        />
                    </div>
                    {/* Max Score Field */}
                    <div className="col-span-12 sm:col-span-3">
                        <Input
                            placeholder="Max Score"
                            type="number"
                            min="0"
                            max="100"
                            value={currentGradingEntry.maxScore}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentGradingEntry({ ...currentGradingEntry, maxScore: e.target.value })
                            }
                            className="h-10 md:h-14 text-sm md:text-base"
                        />
                    </div>
                    {/* Add/Update and Cancel Buttons */}
                    <div className="col-span-12 sm:col-span-3 flex gap-2">
                        {editingIndex !== null ? (
                            <>
                                <Button size="default" type="button" onClick={addGradingEntry} className="flex-1 h-10 md:h-14 text-sm md:text-base" variant="default">
                                    <Check className="w-5 h-5" />
                                </Button>
                                <Button size="default" type="button" onClick={cancelEdit} className="flex-1 h-10 md:h-14 text-sm md:text-base" variant="outline">
                                    <X className="w-5 h-5" />
                                </Button>
                            </>
                        ) : (
                            <Button size="default" variant="default" type="button" onClick={addGradingEntry} className="w-full h-10 md:h-14 text-sm md:text-base">
                                <Plus className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Display Grading Entries if there are any */}
                {gradingEntry.length > 0 && (
                    <div className="space-y-2">
                        {gradingEntry
                            .map((entry: { grade: string; minScore: number; maxScore: number; }, originalIndex: number) => ({ entry, originalIndex }))
                            .sort((a: { entry: { grade: string; minScore: number; maxScore: number; }; originalIndex: number; }, b: { entry: { grade: string; minScore: number; maxScore: number; }; originalIndex: number; }) => {
                                // Sort by maxScore in descending order
                                const maxA = parseInt(String(a.entry.maxScore));
                                const maxB = parseInt(String(b.entry.maxScore));
                                return maxB - maxA;
                            })
                            .map(({ entry, originalIndex }: { entry: { grade: string; minScore: number; maxScore: number; }; originalIndex: number; }) => (
                                <div
                                    key={originalIndex}
                                    className={`flex items-center justify-between p-3 md:p-4 rounded-md border text-sm md:text-base ${editingIndex === originalIndex
                                        ? "bg-primary/10 border-primary/30"
                                        : "bg-muted border-border"
                                        }`}
                                >
                                    <span className="text-foreground font-medium">
                                        {entry.grade}: {entry.minScore} - {entry.maxScore}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="default"
                                            onClick={() => editGradingEntry(originalIndex)}
                                            className="h-8 md:h-10 text-sm md:text-base text-primary hover:text-primary/80"
                                            disabled={editingIndex !== null && editingIndex !== originalIndex}
                                        >
                                            <Pencil className="w-4 md:w-5 h-4 md:h-5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="default"
                                            onClick={() => removeGradingEntry(originalIndex)}
                                            className="h-8 md:h-10 text-sm md:text-base text-destructive hover:text-destructive/80"
                                            disabled={editingIndex !== null}
                                        >
                                            <X className="w-4 md:w-5 h-4 md:h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

            </div>

            {/* Grading Entry Error */}
            <FormField
                control={form.control}
                name="gradingEntry"
                render={({ field }) => (
                    <FormItem>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}