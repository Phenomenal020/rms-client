"use client";

import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Plus, X, Pencil, Check } from "lucide-react";
import { FormField, FormItem, FormMessage } from "@/shadcn/ui/form";
import { type UseFormReturn } from "react-hook-form";
import type { TermFormValues } from "./term-form";
import type { GradingEntry } from "./types";

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
    const gradingSystem = form.watch("gradingSystem") || [];

    return (
        <div className="space-y-5 mt-8 pt-8 border-t border-gray-200">
            {/* Grading System Section Header */}
            <div className="pb-2 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-700 uppercase tracking-wide">Grading System</h3>
            </div>

            <p className="text-base text-gray-700 font-medium">Add grade ranges (e.g., A: 90-100, B: 80-89. Should equal 100% and no overlap)</p>

            {/* Add/Edit Grading Entry */}
            <div className="grid grid-cols-12 gap-2 items-end">
                {/* Grade Field */}
                <div className="col-span-3">
                    <Input
                        type="text"
                        placeholder="Grade (A, B, C...)"
                        value={currentGradingEntry.grade}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCurrentGradingEntry({ ...currentGradingEntry, grade: e.target.value })
                        }
                        className="h-14 text-base"
                    />
                </div>
                {/* Min Score Field */}
                <div className="col-span-3">
                    <Input
                        placeholder="Min Score"
                        type="number"
                        min="0"
                        value={currentGradingEntry.minScore}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCurrentGradingEntry({ ...currentGradingEntry, minScore: e.target.value })
                        }
                        className="h-14 text-base"
                    />
                </div>
                {/* Max Score Field */}
                <div className="col-span-3">
                    <Input
                        placeholder="Max Score"
                        type="number"
                        min="0"
                        max="100"
                        value={currentGradingEntry.maxScore}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCurrentGradingEntry({ ...currentGradingEntry, maxScore: e.target.value })
                        }
                        className="h-14 text-base"
                    />
                </div>
                {/* Add/Update and Cancel Buttons */}
                <div className="col-span-3 flex gap-2">
                    {editingIndex !== null ? (
                        <>
                            <Button size="default" type="button" onClick={addGradingEntry} className="flex-1 h-14 text-base" variant="default">
                                <Check className="w-5 h-5" />
                            </Button>
                            <Button size="default" type="button" onClick={cancelEdit} className="flex-1 h-14 text-base" variant="outline">
                                <X className="w-5 h-5" />
                            </Button>
                        </>
                    ) : (
                        <Button size="default" variant="default" type="button" onClick={addGradingEntry} className="w-full h-14 text-base">
                            <Plus className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Display Grading Entries if there are any */}
            {gradingSystem.length > 0 && (
                <div className="space-y-2">
                    {gradingSystem
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
                            className={`flex items-center justify-between p-4 rounded-md border text-base ${editingIndex === originalIndex
                                    ? "bg-blue-50 border-blue-300"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                        >
                            <span className="text-gray-700 font-medium">
                                {entry.grade}: {entry.minScore}-{entry.maxScore}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="default"
                                    onClick={() => editGradingEntry(originalIndex)}
                                    className="h-10 text-base text-blue-500 hover:text-blue-700"
                                    disabled={editingIndex !== null && editingIndex !== originalIndex}
                                >
                                    <Pencil className="w-5 h-5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="default"
                                    onClick={() => removeGradingEntry(originalIndex)}
                                    className="h-10 text-base text-red-500 hover:text-red-700"
                                    disabled={editingIndex !== null}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grading System Error */}
            <FormField
                control={form.control}
                name="gradingSystem"
                render={() => (
                    <FormItem className="">
                        <FormMessage className="" />
                    </FormItem>
                )}
            />
        </div>
    );
}
