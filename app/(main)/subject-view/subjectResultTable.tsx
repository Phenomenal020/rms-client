'use client';

/**
 * Subject-wide results table (one column per student for each assessment type).
 *
 * ---------------------------------------------------------------------------
 * TODO: Re-enable editing + persistence via useSaveSubjectScores / subject API.
 * Previous flow: react-hook-form, Edit / Save / Cancel, onSubmit → saveSubjectScores.
 * Until then this table is read-only to match the students-view display pattern.
 * ---------------------------------------------------------------------------
 */

import type { Student, AssessmentStructure, Subject, AssessmentScore } from "@/types/drizzle";
import { getScorePercentage } from "../students-view/utils/scoreFns";

// Component props (parallel to students-view ResultTable, without edit/save handlers)
interface SubjectResultTableProps {
  enrolledStudents: Student[];
  selectedSubjectName: string | null;
  getGrade: (percentage: number) => string | null;
  getRemark: (grade: string | null) => string | null;
  assessmentStructure: AssessmentStructure[];
}

export function SubjectResultTable({
  enrolledStudents,
  selectedSubjectName,
  getGrade,
  getRemark,
  assessmentStructure,
}: SubjectResultTableProps) {
  const sortedAssessments = assessmentStructure ?? [];

  return (
    <div className="mb-8">
      <div className="space-y-4">
        {/* Academic performance heading (no edit controls until save flow returns) */}
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <h3 className="text-base sm:text-lg font-bold text-foreground border-border">
            ACADEMIC PERFORMANCE
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            {/* Table header: Assessment type, Total, Grade, Remark */}
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 md:p-3 text-left font-semibold text-foreground text-sm sm:text-base sticky left-0 z-20 bg-muted">
                  Student Name
                </th>
                {sortedAssessments.map((assessment) => (
                  <th
                    key={assessment.id}
                    className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base"
                  >
                    {assessment.type} ({assessment.percentage}%)
                  </th>
                ))}
                <th className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                  Total (100%)
                </th>
                <th className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                  Grade
                </th>
                <th className="border border-border p-2 md:p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                  Remark
                </th>
              </tr>
            </thead>

            {/* Table body: Student name, Assessment scores, Total, Grade, Remark */}
            <tbody>
              {enrolledStudents.length > 0 ? (
                enrolledStudents.map((student, index) => {
                  const studentName = [
                    student.firstName,
                    student.middleName || "",
                    student.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const scores =
                    student.subjects?.find(
                      (s: Subject) => s.subject?.name === selectedSubjectName,
                    )?.assessments?.[0]?.scores || [];

                  const percentage = getScorePercentage(scores);
                  const grade = getGrade(percentage);
                  const remark = getRemark(grade);

                  return (
                    <tr key={student.id || index} className="hover:bg-muted">
                      <td className="border border-border p-3 font-medium text-foreground text-sm sm:text-base whitespace-nowrap sticky left-0 z-10 bg-card">
                        {studentName}
                      </td>

                      {sortedAssessments.map((assessment) => {
                        const scoreValue =
                          scores.find(
                            (s: AssessmentScore) =>
                              s.assessmentStructureId === assessment.id,
                          )?.score ?? 0;

                        return (
                          <td
                            key={assessment.id}
                            className="border border-border p-1.5 md:p-3 text-center text-sm sm:text-base"
                          >
                            <span className="text-foreground">{scoreValue}</span>
                          </td>
                        );
                      })}

                      <td className="border border-border p-3 text-center font-semibold text-foreground text-sm sm:text-base">
                        {percentage}
                      </td>
                      <td className="border border-border p-3 text-center font-bold text-foreground text-sm sm:text-base">
                        {grade}
                      </td>
                      <td className="border border-border p-3 text-center text-foreground text-sm sm:text-base">
                        {remark}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={sortedAssessments.length + 4}
                    className="border border-border p-3 text-center text-muted-foreground text-sm sm:text-base"
                  >
                    No students enrolled in this subject
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/*
 * --- Commented: subject-wide score edit + save (restore when wiring /subject-view save) ---
 *
 * import { useEffect, useTransition } from "react";
 * import { z } from "zod";
 * import { useForm, type Path } from "react-hook-form";
 * import { zodResolver } from "@hookform/resolvers/zod";
 * import { toast } from "sonner";
 * import { Button } from "@/shadcn/ui/button";
 * import { Input } from "@/shadcn/ui/input";
 * import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form";
 * import { Edit3, Loader2, Save, X } from "lucide-react";
 * import { useSaveSubjectScores, getErrorMessage } from "@/fetcher/mutations";
 *
 * // useSaveSubjectScores + form.reset + Save/Cancel toolbar + FormField inputs per cell
 * // See git history before this read-only pass for the full implementation.
 */
