'use client';

import type { Student, AssessmentStructure } from "@/types/drizzle";
import { EmptyNoEntry } from "@/shared-components/empty-noentry";
import { SubjectResultTable as SubjectResultDataTable } from "./subject-result-table";

// Component props (parallel to students-view ResultTable, without edit/save handlers)
interface SubjectResultTableProps {
  enrolledStudents: Student[];
  selectedSubjectId: string | null;
  getGrade: (percentage: number) => string | null;
  getRemark: (grade: string | null) => string | null;
  assessmentStructure: AssessmentStructure[];
  readOnly?: boolean;
}

export function SubjectResultTable({
  enrolledStudents,
  selectedSubjectId,
  getGrade,
  getRemark,
  assessmentStructure,
}: SubjectResultTableProps) {
  return (
    <div className="mb-8">
      <div className="space-y-4">
        {/* Academic performance heading (no edit controls until save flow returns) */}
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <h3 className="text-base sm:text-lg font-bold text-foreground border-border">
            ACADEMIC PERFORMANCE
          </h3>
        </div>

        {enrolledStudents.length === 0 ? (
          // If there are no students enrolled in this subject, show the empty no entry component
          <EmptyNoEntry
            embedded
            title="No students enrolled"
            description="No students are enrolled in this subject yet."
            actionLabel="Manage enrollment"
            actionHref="/enrollment"
          />
        ) : (
          // Finally, if there are enrolled students, show the subject result table
          <SubjectResultDataTable
            enrolledStudents={enrolledStudents}
            selectedSubjectId={selectedSubjectId}
            getGrade={getGrade}
            getRemark={getRemark}
            assessmentStructure={assessmentStructure}
          />
        )}
      </div>
    </div>
  );
}
