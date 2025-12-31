"use client";

import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Plus, X, Pencil, Check } from "lucide-react";
import { FormField, FormItem, FormMessage } from "@/shadcn/ui/form";

export function GradingSystem({ form, currentGradingEntry, setCurrentGradingEntry, addGradingEntry, editGradingEntry, removeGradingEntry, editingIndex, cancelEdit }) {
    const gradingSystem = form.watch("gradingSystem") || [];

    return (
        <div className="space-y-5 mt-8 pt-8 border-t border-gray-200">
            {/* Grading System Section Header */}
            <div className="pb-2 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Grading System</h3>
            </div>

            <p className="text-sm text-gray-700 font-medium">Add grade ranges (e.g., A: 90-100, B: 80-89. Should equal 100% and no overlap)</p>

            {/* Add/Edit Grading Entry */}
            <div className="grid grid-cols-12 gap-2 items-end">
                {/* Grade Field */}
                <div className="col-span-3">
                    <Input
                        placeholder="Grade (A, B, C...)"
                        value={currentGradingEntry.grade}
                        onChange={(e) =>
                            setCurrentGradingEntry({ ...currentGradingEntry, grade: e.target.value })
                        }
                    />
                </div>
                {/* Min Score Field */}
                <div className="col-span-3">
                    <Input
                        placeholder="Min Score"
                        type="number"
                        min="0"
                        value={currentGradingEntry.minScore}
                        onChange={(e) =>
                            setCurrentGradingEntry({ ...currentGradingEntry, minScore: e.target.value })
                        }
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
                        onChange={(e) =>
                            setCurrentGradingEntry({ ...currentGradingEntry, maxScore: e.target.value })
                        }
                    />
                </div>
                {/* Add/Update and Cancel Buttons */}
                <div className="col-span-3 flex gap-2">
                    {editingIndex !== null ? (
                        <>
                            <Button type="button" onClick={addGradingEntry} className="flex-1" variant="default">
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button type="button" onClick={cancelEdit} className="flex-1" variant="outline">
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <Button type="button" onClick={addGradingEntry} className="w-full">
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Display Grading Entries if there are any */}
            {gradingSystem.length > 0 && (
                <div className="space-y-2">
                    {gradingSystem
                        .map((entry, originalIndex) => ({ entry, originalIndex }))
                        .sort((a, b) => {
                            // Sort by maxScore in descending order
                            const maxA = parseInt(a.entry.maxScore);
                            const maxB = parseInt(b.entry.maxScore);
                            return maxB - maxA;
                        })
                        .map(({ entry, originalIndex }) => (
                        <div
                            key={originalIndex}
                            className={`flex items-center justify-between p-3 rounded-md border ${editingIndex === originalIndex
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
                                    size="sm"
                                    onClick={() => editGradingEntry(originalIndex)}
                                    className="text-blue-500 hover:text-blue-700"
                                    disabled={editingIndex !== null && editingIndex !== originalIndex}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGradingEntry(originalIndex)}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={editingIndex !== null}
                                >
                                    <X className="w-4 h-4" />
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
                    <FormItem>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

