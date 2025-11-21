"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

function Dialog({
  open,
  onOpenChange,
  ...props
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
      />
      <div
        data-slot="dialog"
        className={cn(
          "relative z-50 w-full max-w-lg bg-background rounded-lg border shadow-lg",
          props.className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {props.children}
      </div>
    </div>
  );
}

function DialogContent({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="dialog-content"
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex items-center justify-between mb-4", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function DialogClose({
  className,
  onClose,
  ...props
}) {
  return (
    <button
      data-slot="dialog-close"
      onClick={onClose}
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

function DialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex items-center justify-end gap-2 mt-6", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
}

