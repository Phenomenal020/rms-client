import * as React from "react";

import { Button } from "@/shadcn/ui/button";
import { Loader2 } from "lucide-react";

// interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
//   loading: boolean;
// }

export function LoadingButton({
  loading,
  disabled,
  children,
  ...props
}) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}