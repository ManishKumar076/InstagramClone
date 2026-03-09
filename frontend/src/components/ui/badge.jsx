import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-gray-200 text-gray-800",
        secondary: "bg-slate-100 text-slate-800",
        destructive: "bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      data-variant={variant}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
