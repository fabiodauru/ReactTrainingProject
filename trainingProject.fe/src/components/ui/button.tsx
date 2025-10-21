import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "text-[var(--color-primary-foreground)] bg-[var(--color-accent)] hover:bg-[color:color-mix(in srgb,var(--color-accent) 90%,transparent)] focus-visible:ring-[var(--color-accent)]",
        destructive:
          "bg-[var(--color-error)] text-[var(--color-primary-foreground)] hover:bg-[color:color-mix(in srgb,var(--color-error) 90%,transparent)] focus-visible:ring-[var(--color-error)]",
        outline:
          "border border-[var(--color-muted)] bg-[var(--color-background)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary-foreground)]",
        secondary:
          "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[color:color-mix(in srgb,var(--color-muted) 80%,white)]",
        ghost:
          "hover:bg-[var(--color-accent)] hover:text-[var(--color-primary-foreground)]",
        link: "text-[var(--color-accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
