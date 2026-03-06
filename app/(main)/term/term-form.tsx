"use client";

import { TermSetupCard } from "./term/term-setup-card";
import { AssessmentStructureCard } from "./assessment-structure/assessment-structure-card";
import { GradingSystemCard } from "./gradingSystem/grading-system-card";

export function TermForm() {
    return (
        <>
            <TermSetupCard />
            <AssessmentStructureCard />
            <GradingSystemCard />
        </>
    );
}