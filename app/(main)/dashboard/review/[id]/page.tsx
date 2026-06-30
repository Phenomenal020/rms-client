import { OrgAdminGate } from "@/shared-components/org-admin-gate";
import { ResultsSkeleton } from "@/app/(main)/students-view/ResultsSkeleton";
import { ReviewPageContent } from "./review-page-content";

export default function ReviewPage() {
  return (
    <OrgAdminGate fallback={<ResultsSkeleton />}>
      <ReviewPageContent />
    </OrgAdminGate>
  );
}
