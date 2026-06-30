"use client";

import type { AcademicTerm } from "@/types/drizzle";

// SubjectInfo — summary block above the results table (parallel role to StudentStats area)
interface SubjectInfoProps {
  selectedSubject?: string | null;
  enrolledStudentsCount?: number;
  academicTerm: AcademicTerm;
  subjectStats?: {
    average: number;
    minimum: number;
    maximum: number;
    classAverage: number;
  } | null;
}

export function SubjectInfo({
  selectedSubject = "",
  enrolledStudentsCount = 0,
  academicTerm,
  subjectStats = null,
}: SubjectInfoProps) {
  const term = academicTerm.term ?? "";
  const academicYear = academicTerm.academicYear ?? "";

  return (
    <div className="mb-6">
      <h4 className="text-base sm:text-lg font-bold text-foreground mb-1 md:mb-2">
        SUBJECT INFORMATION
      </h4>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {/* Subject */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Subject: </span>
          <span className="text-foreground">{selectedSubject || "N/A"}</span>
        </p>

        {/* Students Enrolled */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Students Enrolled: </span>
          <span className="text-foreground">{enrolledStudentsCount}</span>
        </p>

        {/* Maximum Score */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Maximum Score: </span>
          <span className="text-foreground">{subjectStats?.maximum ?? "N/A"}%</span>
        </p>

        {/* Session */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Session: </span>
          <span className="text-foreground">{academicYear || "N/A"}</span>
        </p>

        {/* Average Score */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Average Score: </span>
          <span className="text-foreground">{subjectStats?.average ?? "N/A"}%</span>
        </p>

        {/* Minimum Score */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Minimum Score: </span>
          <span className="text-foreground">{subjectStats?.minimum ?? "N/A"}%</span>
        </p>

        {/* Term */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Term: </span>
          <span className="text-foreground">{term || "N/A"}</span>
        </p>

        {/* Class Average */}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-muted-foreground">Class Average: </span>
          <span className="text-foreground">{subjectStats?.classAverage ?? "N/A"}%</span>
        </p>
      </div>
    </div>
  );
}
