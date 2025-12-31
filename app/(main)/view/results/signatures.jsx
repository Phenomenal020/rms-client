export const Signatures = () => {
    return <div className="grid grid-cols-3 gap-8 mt-8 pt-6 border-gray-300">
        {/* Class Teacher Signature */}
        <div className="text-center">
            <div className="border-b border-gray-300 mb-2 h-12"></div>
            <p className="text-sm text-gray-600">Class Teacher</p>
        </div>
        {/* Principal Signature */}
        <div className="text-center">
            <div className="border-b border-gray-300 mb-2 h-12"></div>
            <p className="text-sm text-gray-600">Principal</p>
        </div>
        {/* Date */}
        <div className="text-center">
            <div className="border-b border-gray-300 mb-2 h-12"></div>
            <p className="text-sm text-gray-600">Date</p>
        </div>
    </div>
}
// 