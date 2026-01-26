"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { SubjectsForm } from "./subjects-form";
import { AssessmentStructureForm } from "./assessment-structure-form";
import type { Subject, AssessmentStructure } from "@/src/generated/prisma/client";

// Props interface for SubjectsTabs
interface SubjectsTabsProps {
  subjects: Subject[];
  assessmentStructure: AssessmentStructure[];
}

// Subjects Tabs component
export default function SubjectsTabs({ subjects, assessmentStructure }: SubjectsTabsProps) {

    // Check if there are any subjects (to disable assessment structure tab if no subjects)
    const hasSubjects = subjects?.length > 0;

    return (
        <Tabs defaultValue="subjects" className="w-full">
            {/* Tabs List */}
            <TabsList className="flex justify-center w-full mx-auto bg-white/60 backdrop-blur-sm rounded-lg p-1 gap-1 mb-8 shadow-sm border border-blue-100/50">
                {/* Subjects Tab */}
                <TabsTrigger 
                    value="subjects" 
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50"
                >
                    Subjects
                </TabsTrigger>

                {/* Assessment Structure Tab (disabled if no subjects yet) */}
                <TabsTrigger 
                    value="assessment" 
                    disabled={!hasSubjects}
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 rounded-md hover:text-blue-700 hover:bg-blue-50/50 data-[state=active]:text-primary-700 data-[state=active]:bg-blue-100/70 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200/50 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
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

