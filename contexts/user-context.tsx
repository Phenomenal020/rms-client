"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getUserWithRelations, type UserWithRelations } from "@/fetcher/queries";

// The context only carries what the app shell needs:
//   • core user fields (role, name, email, etc.)
//   • school row  — to know whether a school has been created
//   • academicTerms rows — to know whether terms exist and which is active
//
// Page-level data (subjects, classes, students, assessments, scores) is NOT
// included here. Each page fetches its own data on demand via SWR so that
// this global fetch stays small and fast.
export type UserContextType = UserWithRelations;

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userData = getUserWithRelations();

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
