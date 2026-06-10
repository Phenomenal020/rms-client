// A single dashboard card component
import { Card, CardContent } from "@/shadcn/ui/card";

export function DashboardCard({ title, value }: { title: string; value: number }) {
    return (
        <Card className="relative overflow-hidden border border-border bg-card transition-colors hover:bg-accent/50 cursor-pointer">
            <CardContent className="p-4">
                <p className="text-4xl font-bold tracking-tight text-foreground">{value}</p>
                <p className="mt-1 text-sm md:text-base font-bold text-foreground/60">{title}</p>
            </CardContent>
        </Card>
    );
}
