"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { SchoolForm } from "./school-form";
import { TermForm } from "./term-form";

export default function SchoolTabs({ school, academicTerm, schoolId }) {
    return (
        <Tabs defaultValue="school" className="w-full">
            <TabsList className="flex justify-center w- mx-auto bg-transparent p-0 gap-0 mb-8">

                {/* School Tab */}
                <TabsTrigger 
                    value="school" 
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 w-max"
                >
                    School
                </TabsTrigger>

                {/* Term Tab (disabled if no school yet) */}
                <TabsTrigger 
                    value="term" 
                    disabled={!schoolId}
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed w-max"
                >
                    Term
                </TabsTrigger>
            </TabsList>

            {/* Tabs Content - School and Term Forms */}
            <div className="w-full">
                {/* School Tab Content - Renders school form */}
                <TabsContent value="school" className="mt-0">
                    <SchoolForm school={school} />
                </TabsContent>

                {/* Term Tab Content - Renders term form */}
                <TabsContent value="term" className="mt-0">
                    <TermForm academicTerm={academicTerm} schoolId={schoolId} />
                </TabsContent>
            </div>
        </Tabs>
    )
}

