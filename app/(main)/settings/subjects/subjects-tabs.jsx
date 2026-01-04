"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { SubjectsForm } from "./subjects-form";
import { AssessmentStructureForm } from "./assessment-structure-form";

export default function SubjectsTabs({ subjects, assessmentStructure }) {

    // Check if there are any subjects (to disable assessment structure tab if no subjects)
    const hasSubjects = subjects.length > 0;

    return (
        <Tabs defaultValue="subjects" className="w-full">
            {/* Tabs List */}
            <TabsList className="flex justify-center w- mx-auto bg-transparent p-0 gap-0 mb-8">
                {/* Subjects Tab */}
                <TabsTrigger 
                    value="subjects" 
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 w-max"
                >
                    Subjects
                </TabsTrigger>

                {/* Assessment Structure Tab (disabled if no subjects yet) */}
                <TabsTrigger 
                    value="assessment" 
                    disabled={!hasSubjects}
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:border-b-3 data-[state=active]:border-b-gray-900 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed w-max"
                >
                    Assessment Structure
                </TabsTrigger>
            </TabsList>

            {/* Tabs Content - Subjects and Assessment Structure Forms */}
            <div className="w-full">
                {/* Subjects Tab Content - Renders subjects form */}
                <TabsContent value="subjects" className="mt-0">
                   <SubjectsForm subjects={subjects}  />
                </TabsContent>

                {/* Assessment Structure Tab Content - Renders assessment structure form */}
                <TabsContent value="assessment" className="mt-0">
                    <AssessmentStructureForm assessmentStructure={assessmentStructure} />
                </TabsContent>
            </div>
        </Tabs>
    )
}

