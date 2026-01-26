import type { Prisma } from "@/src/generated/prisma/client";

// Type for school data with all fields
export type SchoolData = Prisma.SchoolGetPayload<{
  select: {
    id: true;
    schoolName: true;
    schoolAddress: true;
    schoolMotto: true;
    schoolTelephone: true;
    schoolEmail: true;
    createdAt: true;
    updatedAt: true;
  };
}> | null;

// Type for academic term data with relations
export type AcademicTermData = Prisma.AcademicTermGetPayload<{
  include: {
    gradingSystem: true;
    class: true;
  };
}> | null;

// Type for grading entry
export type GradingEntry = {
    grade: string;
    minScore: number | string;
    maxScore: number | string;
}