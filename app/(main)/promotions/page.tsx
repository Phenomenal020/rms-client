import { OrgAdminGate } from "@/shared-components/org-admin-gate";
import { PromotionsForm } from "./promotions-form";
import PromotionsLoading from "./loading";

// Promotions page — org admin promotes students to the next class (mock data for now)
export default function PromotionsPage() {
    return (
        <OrgAdminGate fallback={<PromotionsLoading />}>
            <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
                <div className="mx-auto w-full max-w-5xl space-y-10">
                    <PromotionsForm />
                </div>
            </main>
        </OrgAdminGate>
    );
}
