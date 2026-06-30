import { OrgAdminGate } from "@/shared-components/org-admin-gate";
import { TermForm } from "./term-form";
import TermLoading from "./loading";

export default function TermPage() {
    return (
        <OrgAdminGate fallback={<TermLoading />}>
            <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
                <div className="mx-auto w-full max-w-5xl space-y-10">
                    <TermForm />
                </div>
            </main>
        </OrgAdminGate>
    );
}