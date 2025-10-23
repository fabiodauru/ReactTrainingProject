import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  style,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-foreground)] text-[var(--color-foreground)] bg-[color:var(--color-primary)] h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "border-2 border-solid focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)] focus:ring-opacity-20",
        "aria-invalid:ring-[color:var(--color-error)] aria-invalid:ring-opacity-20 aria-invalid:border-[color:var(--color-error)]",
        className
      )}
      style={{
        borderColor: "var(--color-muted)",
        ...style,
      }}
      {...props}
    />
  );
}

export { Input };