"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getUserWithRelations, type UserWithRelations } from "@/fetcher/queries";

const UserContext = createContext<UserWithRelations | undefined>(undefined);

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
