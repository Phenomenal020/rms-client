export const Signatures = () => {
    return <div className="grid grid-cols-3 gap-8 mt-8 pt-6 border-border">
        {/* Class Teacher Signature */}
        <div className="text-center">
            <div className="border-b border-border mb-2 h-12"></div>
            <p className="text-xs md:text-sm text-muted-foreground">Class Teacher</p>
        </div>
        {/* Principal Signature */}
        <div className="text-center">
            <div className="border-b border-border mb-2 h-12"></div>
            <p className="text-xs md:text-sm text-muted-foreground">Principal</p>
        </div>
        {/* Date */}
        <div className="text-center">
            <div className="border-b border-border mb-2 h-12"></div>
            <p className="text-xs md:text-sm text-muted-foreground">Date</p>
        </div>
    </div>
}
