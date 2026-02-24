"use client";

import { Tabs, TabsContent } from "@/shadcn/ui/tabs";
import { Button } from "@/shadcn/ui/button";
import { SubjectsForm } from "./subjects-form";
import { AssessmentStructureForm } from "./assessment-structure-form";
import { useUser } from "@/contexts/user-context";
import Loading from "./loading";
import { useState } from "react";

export default function SubjectsTabs() {

    // Fetch subjects and assessment structure from context
    const { subjects, assessmentStructure } = useUser();

    const [activeTab, setActiveTab] = useState("subjects");

    // Check if there are any subjects (to disable assessment structure tab if no subjects)
    const hasSubjects = subjects?.length && subjects.length > 0;

    if (!subjects) {
        return <Loading />;
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Buttons List */}
            <div className="flex flex-wrap justify-center gap-0 mb-2">
                <Button
                    onClick={() => setActiveTab("subjects")}
                    variant={activeTab === "subjects" ? "default" : "outline"}
                    className="h-10 cursor-pointer mb-0 rounded-sm"
                >
                    Subjects
                </Button>

                <Button
                    onClick={() => setActiveTab("assessment")}
                    variant={activeTab === "assessment" ? "default" : "outline"}
                    disabled={!hasSubjects}
                    className="h-10 cursor-pointer mb-0 rounded-sm"
                >
                    Assessment Structure
                </Button>
            </div>

            {/* Tabs Content */}
            <div className="w-full">
                {/* Subjects Tab Content - Renders subjects form */}
                <TabsContent value="subjects" className="mt-0">
                    <SubjectsForm subjects={subjects} />
                </TabsContent>

                {/* Assessment Structure Tab Content - Renders assessment structure form */}
                <TabsContent value="assessment" className="mt-0">
                    <AssessmentStructureForm assessmentStructure={assessmentStructure} />
                </TabsContent>
            </div>
        </Tabs>
    );
}

