import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-xl border border-pink-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 px-3 py-1.5 text-sm text-black dark:text-zinc-100 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:border-[#89CFF0] focus-visible:ring-2 focus-visible:ring-[#89CFF0]/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
