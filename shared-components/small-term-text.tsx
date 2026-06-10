"use client";
import { authClient } from "@/src/auth-client";
import { getTerms } from "@/fetcher/queries";
import { Skeleton } from "@/shadcn/ui/skeleton";

export default function SmallTermText() {

    // Get the active organization
    const { data: activeOrganization, isPending: isActiveOrganizationPending } = authClient.useActiveOrganization()

    // Get the current term
    const { data: terms, isLoading: isCurrentTermLoading, error: currentTermError } = getTerms()
    const currentTerm = terms?.find((term: any) => term.status === "ACTIVE")

    // Loading skeleton
    if (isActiveOrganizationPending || isCurrentTermLoading) {
        return <Skeleton className="w-24 h-4" />
    }

    const renderTermName = (name: string) => {
        console.log("name", name)
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }

    console.log("currentTerm", currentTerm)

    // Return the component
    return activeOrganization && (
        <p className="text-sm text-muted-foreground">
            {(activeOrganization?.name)} · {renderTermName(currentTerm?.term)} term, {" "}{currentTerm?.academicYear}
        </p>
    )
}