import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        babyblue:
          "bg-[#89CFF0] hover:bg-[#72bbf0] text-gray-800 font-bold border border-sky-300 shadow-sm shadow-sky-200/50",
        outline:
          "border border-pink-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 hover:text-black dark:hover:text-white font-semibold shadow-xs",
        ghost:
          "text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-pink-100/70 dark:hover:bg-zinc-800 font-semibold",
        secondary:
          "bg-white/90 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-black dark:hover:text-white border border-pink-200 dark:border-zinc-700 font-semibold shadow-xs",
        destructive:
          "bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-pink-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-900 font-semibold",
        tabActive:
          "bg-[#89CFF0] text-gray-800 font-bold shadow-xs",
        tabInactive:
          "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-medium hover:bg-pink-100/50 dark:hover:bg-zinc-700/50",
        genreActive:
          "bg-[#89CFF0] text-gray-800 font-bold border border-sky-300 shadow-sm",
        genreInactive:
          "bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-pink-200 dark:border-zinc-700 font-medium"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        pill: "h-7 rounded-full px-3.5 text-xs",
        icon: "h-9 w-9 p-2 rounded-lg",
        iconSm: "h-7 w-7 p-1 rounded-md",
      },
    },
    defaultVariants: {
      variant: "babyblue",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
