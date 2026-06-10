import { OrgAdminGate } from "@/shared-components/org-admin-gate";
import { SchoolForm } from "./school-form";
import SchoolLoading from "./loading";

// School settings page — SchoolForm loads active organisation via useActiveOrganization()
export default function SchoolSettingsPage() {
  return (
    <OrgAdminGate fallback={<SchoolLoading />}>
      <main className="min-h-screen w-full bg-background relative overflow-hidden px-4 py-6 md:px-6 md:py-10">
        <div className="mx-auto w-full max-w-5xl space-y-10">
          <SchoolForm />
        </div>
      </main>
    </OrgAdminGate>
  );
}
