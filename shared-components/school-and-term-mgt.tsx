import SmallTermText from "./small-term-text";

interface SchoolAndTermMgtProps {
    title: string;
}
export function SchoolAndTermMgt({ title }: SchoolAndTermMgtProps) {
    return <section className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
        </h1>
        <SmallTermText />
    </section>
}