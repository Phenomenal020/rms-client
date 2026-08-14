"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@/src/auth-client";

// context type for the mutation gate
type MutationGateContextValue = {
  enforce: boolean;
};
// context for the mutation gate. If enforce is true, then require 2FA.
const MutationGateContext = createContext<MutationGateContextValue>({
  enforce: false,
});
// provider for the mutation gate. If enforce is true, then require 2FA.
export function MutationGateProvider({ children }: { children: ReactNode }) {
  return (
    <MutationGateContext.Provider value={{ enforce: true }}>
      {children}
    </MutationGateContext.Provider>
  );
}


 // Better Auth session is the client source of truth for `twoFactorEnabled`
 // (useUser / GET user does not currently return this field).
export function useCanMutate() {
  const { data: session, isPending } = authClient.useSession();
  const twoFactorEnabled = session?.user?.twoFactorEnabled === true;

  return {
    // safe to enable write actions
    canMutate: !isPending && twoFactorEnabled, // if not pending and 2FA is enabled, then allow the mutation
    twoFactorEnabled, // return the 2FA status
    isPending, // return the loading state
  };
}

/** Combine provider enforce flag with session 2FA status. */
export function useMutationGate() {
  const { enforce } = useContext(MutationGateContext); // get the enforce flag from the context
  const { canMutate, twoFactorEnabled, isPending } = useCanMutate(); // get the canMutate, twoFactorEnabled, and isPending from the useCanMutate hook

  if (!enforce) {
    return { blocked: false, canMutate: true, twoFactorEnabled, isPending, enforce: false }; // if enforce is false, then allow the mutation
  }

  return {
    blocked: isPending || !twoFactorEnabled,
    canMutate,
    twoFactorEnabled,
    isPending,
    enforce: true,
  };
}
