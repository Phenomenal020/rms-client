/**
 * Types extracted from Drizzle ORM queries via API responses
 * 
 * These types are inferred from the API response structure, which comes from
 * Drizzle relational queries on the backend.
 * 
 * HOW TO USE:
 * 
 * 1. Import types in your components:
 *    import type { Student, Subject, School } from "@/types/drizzle";
 * 
 * 2. Use with useUser hook:
 *    const { students, subjects, school } = useUser();
 *    // All types are automatically inferred!
 * 
 * 3. Type function parameters:
 *    function processStudent(student: Student) { ... }
 * 
 * 4. Type component props:
 *    interface Props { students: Student[]; }
 * 
 * 5. Access nested properties with full type safety:
 *    student.subjects[0].assessments[0].scores
 * 
 * See drizzle-examples.ts for more detailed examples.
 */

import type { UserWithRelations } from "@/fetcher/queries";

// ============================================================================
// Extract the user data from the API response
// ============================================================================
// The API returns { user: UserData | null, error, isLoading }
// UserData contains the full Drizzle relational query result
export type UserData = NonNullable<UserWithRelations['user']>;

// ============================================================================
// Extract nested types from the user data
// ============================================================================

// School type (extracted from Drizzle payload)
export type School = UserData['school'];

// Academic Term with all its relations
export type AcademicTerm = NonNullable<UserData['academicTerm']>;

// Class (nested in academic term)
export type Class = NonNullable<AcademicTerm['class']>;

// Subjects array (from academic term)
export type Subject = AcademicTerm['subjects'][number];

// Assessment Structure array (from academic term)
export type AssessmentStructure = AcademicTerm['assessmentStructure'][number];

// Grading Entry array (from academic term)
export type GradingEntry = AcademicTerm['gradingEntry'][number];

// Students with their nested relations
export type Student = AcademicTerm['students'][number];

// Student Subject (junction table with nested relations)
export type StudentSubject = Student['subjects'][number];

// Assessment (nested in student subject)
export type Assessment = StudentSubject['assessments'][number];

// Assessment Score (nested in assessment)
export type AssessmentScore = Assessment['scores'][number];

// ============================================================================
// Helper types for common use cases
// ============================================================================

// Student with subjects (commonly used structure)
export type StudentWithSubjects = Student;

// Subject with full details (if needed)
export type SubjectWithDetails = StudentSubject['subject'];

// Assessment with scores
export type AssessmentWithScores = Assessment;

// ============================================================================
// Type guards and utilities
// ============================================================================

/**
 * Check if user data is available
 */
export function hasUserData(data: UserWithRelations): data is UserWithRelations & { user: UserData } {
  return data.user !== null && data.user !== undefined;
}

/**
 * Check if academic term is available
 */
export function hasAcademicTerm(data: UserData): data is UserData & { academicTerm: AcademicTerm } {
  return data.academicTerm !== null && data.academicTerm !== undefined;
}
