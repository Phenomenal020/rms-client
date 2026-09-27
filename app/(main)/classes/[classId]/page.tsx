import { OrgAdminGate } from "@/shared-components/org-admin-gate";
import ClassSubjectsLoading from "./class-subjects-loading";
import { ClassSubjectsContent } from "./class-subjects-content";

export default function ClassSubjectsPage() {
  return (
    <OrgAdminGate fallback={<ClassSubjectsLoading />}>
      <ClassSubjectsContent />
    </OrgAdminGate>
  );
}
