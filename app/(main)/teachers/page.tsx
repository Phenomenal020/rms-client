import { OrgAdminGate } from "@/shared-components/org-admin-gate";
import { TeachersForm } from "./teachers-form";
import TeachersLoading from "./loading";

export default function TeachersPage() {
    return (
        <OrgAdminGate fallback={<TeachersLoading />}>
            <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
                <div className="mx-auto w-full max-w-5xl space-y-10">
                    <TeachersForm />
                </div>
            </main>
        </OrgAdminGate>
    );
}