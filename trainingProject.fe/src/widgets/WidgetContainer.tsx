import clsx from "clsx";
import React from "react";

export default function WidgetContainer({
  children,
  size = "medium",
  onClick,
}: {
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}) {
  const spanClasses = clsx({
    "col-span-1": size === "small",
    "col-span-2": size === "medium" || size === "large",
    "row-span-1": size === "small" || size === "medium",
    "row-span-2": size === "large",
  });

  const heightClasses = clsx({
    "h-60 md:h-64": size === "small",
    "h-72 md:h-80": size === "medium",
    "h-[28rem] md:h-[32rem]": size === "large",
  });

  return (
    <div
      onClick={onClick}
      className={clsx(
        // Minimal, dark, header-aligned
        "relative group overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-gray-900/85 to-gray-800/85 text-white",
        "border border-white/5 backdrop-blur-xl",
        // Soft depth + subtle hover
        "transform-gpu transition-all duration-200 ease-out",
        "shadow-[0_6px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.24)]",
        "hover:scale-[1.008] hover:-translate-y-0.5",
        // Gentle ring on hover/focus
        "ring-1 ring-white/5 hover:ring-white/10 focus-within:ring-white/15",
        // Spacing and content flow
        "p-5 md:p-6 overflow-auto",
        onClick ? "cursor-pointer select-none" : "",
        spanClasses,
        heightClasses
      )}
    >
      {/* Subtle top light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/5 to-transparent" />
      {/* Very gentle hover sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="h-full w-full bg-[radial-gradient(120%_120%_at_8%_6%,rgba(255,255,255,0.02)_0%,transparent_65%)]" />
      </div>

      {children}
    </div>
  );
}
