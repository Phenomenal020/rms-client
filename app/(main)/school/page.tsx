"use client";

// imports: school settings form
import { useUser } from "@/contexts/user-context";
import Loading from "./loading";
import { SchoolForm } from "./school-form";
import SmallTermText from "@/shared-components/small-term-text";

// page component (Server Component - no data fetching here)
export default function SchoolSettingsPage() {

  // Fetch user data using SWR hook
  // const { school, isLoading, error } = useUser();

  // // Loading Skeleton
  // if (isLoading) {
  //   return <Loading />;
  // }

  // Error Message (Todo: Fix this later)
  // if (error) {
  //   return (
  //     <div className="w-full rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
  //       Failed to load your settings. Please refresh the page.
  //     </div>
  //   );
  // }

  // return the main layout
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">

      <div className="mx-auto w-full max-w-5xl space-y-10">

        {/* school prop drives create vs update routing inside SchoolForm */}
        <SchoolForm />
        {/* <SchoolForm school={school} /> */}

      </div>
    </main>
  );
}