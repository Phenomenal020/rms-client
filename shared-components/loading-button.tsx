"use client";

// Reusable Loading Button component
import React from "react";

import { Button } from "@/shadcn/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading: boolean;
}

export function LoadingButton({
  loading,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button 
      disabled={loading || disabled} 
      {...props} 
      className={cn("cursor-pointer", className)}
    >
      {loading ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}