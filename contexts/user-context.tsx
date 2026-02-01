"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getUserWithRelations, type UserWithRelations } from "@/fetcher/queries";
import type {
  UserData,
  Subject,
  AssessmentStructure,
  Student,
  AcademicTerm,
  GradingEntry,
  School,
} from "@/types/drizzle";

// Define the context type based on the return type of getUserWithRelations
// Extract nested types from the Drizzle query result
export type UserContextType = UserWithRelations & {
  subjects: Subject[] | undefined;
  assessmentStructure: AssessmentStructure[] | undefined;
  students: Student[] | undefined;
  academicTerm: AcademicTerm | undefined;
  gradingEntry: GradingEntry[] | undefined;
  school: School | undefined;
};

// Create the context with undefined as default (will be provided by UserProvider)
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component that fetches user data and provides it to children
export function UserProvider({ children }: { children: ReactNode }) {
  const userData = getUserWithRelations();
  const subjects = userData?.user?.academicTerm?.subjects;
  const assessmentStructure = userData?.user?.academicTerm?.assessmentStructure;
  const students = userData?.user?.academicTerm?.students;
  const academicTerm = userData?.user?.academicTerm;
  const gradingEntry = userData?.user?.academicTerm?.gradingEntry;
  const school = userData?.user?.school;

  return (
    <UserContext.Provider value={{ ...userData, subjects, assessmentStructure, students, academicTerm, gradingEntry, school }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}