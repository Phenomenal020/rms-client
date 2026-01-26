// Interface for the SubjectInfo component props
interface SubjectInfoProps {
    selectedSubject?: string;
    enrolledStudentsCount?: number;
    term?: string;
    academicYear?: string;
}

export const SubjectInfo = ({
    selectedSubject = "",
    enrolledStudentsCount = 0,
    term = "",
    academicYear = ""
}: SubjectInfoProps) => {
    return (
        <div className="mb-8">

            {/* Edit subject information section */}
            <div className="flex items-center justify-between mb-3">

                {/* Title of the editing subject information section */}
                <h3 className="text-lg md:text-xl font-bold text-gray-800  border-gray-300 pb-2">
                    SUBJECT INFORMATION
                </h3>

            </div>

            {/* More Editing options - subject information */}
            <div className="grid grid-cols-2 gap-6">

                <div className="space-y-3">
                    {/* Subject name (span when not editing, input when editing) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40 text-sm md:text-base">
                            Subject Name:
                        </span>

                        <span className="text-gray-900 text-sm md:text-base">
                            {selectedSubject || ""}
                        </span>
                    </div>

                    {/* Number of students enrolled (read-only) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40 text-sm md:text-base">
                            Students Enrolled:
                        </span>
                        <span className="text-gray-900 text-sm md:text-base">
                            {enrolledStudentsCount}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Term (read-only, from school data) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40 text-sm md:text-base">
                            Term:
                        </span>
                        <span className="text-gray-900 text-sm md:text-base">
                            {term || "N/A"}
                        </span>
                    </div>

                    {/* Academic Year (read-only, from school data) */}
                    <div className="flex items-center">
                        <span className="font-semibold text-gray-700 w-40 text-sm md:text-base">
                            Academic Year:
                        </span>
                        <span className="text-gray-900 text-sm md:text-base">
                            {academicYear || "N/A"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}