import { FileText } from "lucide-react";
import { ComingSoon } from "@/shared-components/coming-soon";

const CustomTemplatesPage = () => {
  return (
    <ComingSoon
      title="Custom Templates"
      description="Use your own templates to create result sheets. To protect the integrity of our clients, we are currently reviewing ways to implement this feature safely and securely. In the meantime, please use the default template or contact us for assistance."
      icon={FileText}
      variant="info"
    />
  );
};

export default CustomTemplatesPage;
