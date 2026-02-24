"use client";

import { Tabs, TabsContent } from "@/shadcn/ui/tabs";
import { Button } from "@/shadcn/ui/button";
import { SchoolForm } from "./school-form";
import { TermForm } from "./term-form";
import { useUser } from "@/contexts/user-context";
import Loading from "./loading";
import { useState } from "react";

export default function SchoolTabs() {

    // Fetch user data using SWR hook
    const { user, isLoading, error } = useUser();

    const [activeTab, setActiveTab] = useState("school");

    // While the user is loading, don't render forms that depend on the user shape yet.
    // SWR will re-render this component automatically once `user` becomes available.
    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="w-full rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                Failed to load your settings. Please refresh the page.
            </div>
        );
    }

    if (!user) {
        return <Loading />;
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Buttons List */}
            <div className="flex flex-wrap justify-center gap-0 mb-2">
                <Button
                    onClick={() => setActiveTab("school")}
                    variant={activeTab === "school" ? "default" : "outline"}
                    className="h-10 cursor-pointer mb-0 rounded-sm"
                >
                    School
                </Button>

                <Button
                    onClick={() => setActiveTab("term")}
                    variant={activeTab === "term" ? "default" : "outline"}
                    disabled={!user?.schoolId}
                    className="h-10 cursor-pointer mb-0 rounded-sm"
                >
                    Term
                </Button>
            </div>

            {/* Tabs Content */}
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
    );
}