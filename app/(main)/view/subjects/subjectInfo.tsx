"use client";

// Interface for the SubjectInfo component props
interface SubjectInfoProps {
    selectedSubject?: string;
    enrolledStudentsCount?: number;
    term?: string;
    academicYear?: string;
    subjectStats?: {
        average: number;
        minimum: number;
        maximum: number;
        classAverage: number;
    } | null;
}

export const SubjectInfo = ({
    selectedSubject = "",
    enrolledStudentsCount = 0,
    term = "",
    academicYear = "",
    subjectStats = null,
}: SubjectInfoProps) => {
    return (
        <div className="mb-6">
            {/* Header */}
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-1 md:mb-2">
                SUBJECT INFORMATION
            </h4>

            {/* Content Grid - stacks on mobile, responsive columns on larger screens */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {/* Subject Name */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Subject: </span>
                    <span className="text-foreground">{selectedSubject || "N/A"}</span>
                </p>

                {/* Students Enrolled */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Students Enrolled: </span>
                    <span className="text-foreground">{enrolledStudentsCount}</span>
                </p>

                {/* Maximum Score */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Maximum Score: </span>
                    <span className="text-foreground">{subjectStats?.maximum ?? "N/A"}%</span>
                </p>

                {/* Academic Year */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Session: </span>
                    <span className="text-foreground">{academicYear || "N/A"}</span>
                </p>

                {/* Average Score */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Average Score: </span>
                    <span className="text-foreground">{subjectStats?.average ?? "N/A"}%</span>
                </p>

                {/* Minimum Score */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Minimum Score: </span>
                    <span className="text-foreground">{subjectStats?.minimum ?? "N/A"}%</span>
                </p>


                {/* Term */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Term: </span>
                    <span className="text-foreground">{term || "N/A"}</span>
                </p>

                {/* Class Average */}
                <p className="text-sm sm:text-base">
                    <span className="font-semibold text-muted-foreground">Class Average: </span>
                    <span className="text-foreground">{subjectStats?.classAverage ?? "N/A"}%</span>
                </p>
            </div>
        </div>
    );
}
