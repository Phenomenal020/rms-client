"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { SchoolForm } from "./school-form";
import { TermForm } from "./term-form";
import { useUser } from "@/contexts/user-context";
import Loading from "./loading";

export default function SchoolTabs() {

    // user data comes from context (backed by SWR: '/users/user')
    const { user, isLoading, error } = useUser();

    // While the user is loading, don't render forms that depend on the user shape yet.
    // SWR will re-render this component automatically once `user` becomes available.
    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="w-full rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm text-red-700">
                Failed to load your settings. Please refresh the page.
            </div>
        );
    }

    return (
        <Tabs defaultValue="school" className="w-full">
            {/* Tabs List */}
            <TabsList className="flex justify-center w-full mx-auto bg-white/60 backdrop-blur-sm rounded-lg p-1 gap-1 mb-8 shadow-sm border border-blue-100/50">

                {/* School Tab */}
                <TabsTrigger
                    value="school"
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50"
                >
                    School
                </TabsTrigger>

                {/* Term Tab (disabled if no school yet) */}
                <TabsTrigger
                    value="term"
                    disabled={!user?.schoolId}
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                >
                    Term
                </TabsTrigger>
            </TabsList>

            {/* Tabs Content - School and Term Forms */}
            <div className="w-full">
                {/* School Tab Content - Renders school form */}
                <TabsContent value="school" className="mt-0">
                    <SchoolForm school={user?.school} />
                </TabsContent>

                {/* Term Tab Content - Renders term form */}
                <TabsContent value="term" className="mt-0">
                    <TermForm academicTerm={user?.academicTerm} />
                </TabsContent>
            </div>
        </Tabs>
    )
}