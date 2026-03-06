"use client";

import type { School, AcademicTerm } from "@/types/drizzle";

interface SchoolHeaderProps {
    school: School | null;
    academicTerm: AcademicTerm;
}

export const SchoolHeader = ({
    school,
    academicTerm,
}: SchoolHeaderProps) => {
    return (
        <div className="text-center mb-3 border-b-2 border-border pb-3 space-y-1">
            {/* School Name */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {school?.schoolName}
            </h1>

            {/* School Motto */}
            {school?.schoolMotto && (
                <p className="text-base sm:text-lg md:text-xl text-foreground italic">
                    {school.schoolMotto}
                </p>
            )}

            {/* School Address */}
            {school?.schoolAddress && (
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    {school.schoolAddress}
                </p>
            )}

            {/* School Telephone and Email */}
            {(school?.schoolTelephone || school?.schoolEmail) && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {school?.schoolTelephone ? `Tel: ${school.schoolTelephone}` : null}
                    {school?.schoolTelephone && school?.schoolEmail ? " | " : null}
                    {school?.schoolEmail ? `Email: ${school.schoolEmail}` : null}
                </p>
            )}

            {/* Academic Report Card Title */}
            <h2 className="text-base md:text-lg font-bold text-foreground !mt-4">
                ACADEMIC REPORT CARD
            </h2>

            {/* Academic Year and Term */}
            <p className="text-sm md:text-base text-muted-foreground">
                Session: {academicTerm?.academicYear} | Term: {academicTerm?.term}
            </p>
        </div>
    );
};