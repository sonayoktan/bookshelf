import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-sky-400 dark:border-sky-500 bg-[#89CFF0]/25 dark:bg-[#89CFF0]/25 text-black dark:text-black font-bold",
        babyblue:
          "border-sky-300 bg-[#89CFF0] text-gray-800 font-bold shadow-xs",
        secondary:
          "border-pink-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        outline: "border-pink-300 dark:border-zinc-700 text-black dark:text-zinc-200 font-semibold bg-white/60 dark:bg-zinc-800/60",
        pink: "border-pink-200 dark:border-pink-900/50 bg-pink-100 dark:bg-pink-950/40 text-pink-950 dark:text-pink-200 font-semibold",
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
