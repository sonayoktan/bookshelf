import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-sky-300 bg-[#89CFF0]/25 text-gray-700 font-semibold",
        babyblue:
          "border-sky-300 bg-[#89CFF0] text-gray-700 font-bold shadow-xs",
        secondary:
          "border-pink-200 bg-white/80 text-gray-700",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        outline: "border-pink-300 text-black font-semibold bg-white/60",
        pink: "border-pink-200 bg-pink-100 text-pink-950 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
