import clsx from "clsx";
import React from "react";

export default function WidgetContainer({
  children,
  size = "medium",
  shape = "rectangle",
  onClick,
}: {
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  shape?: "rectangle" | "square";
  onClick?: () => void;
}) {
  // Grid spans (width/height footprint in the layout)
  const spanClasses = clsx({
    "col-span-1": size === "small",
    "col-span-2": size === "medium" || size === "large",
    "row-span-1": size === "small" || size === "medium",
    "row-span-2": size === "large",
  });

  // Rectangle heights (square uses aspect ratio instead)
  const heightRectClasses = clsx({
    "h-60 md:h-68": size === "small",
    "h-72 md:h-80": size === "medium",
    "h-[28rem] md:h-[32rem]": size === "large",
  });

  // Shape handling
  const shapeClasses =
    shape === "square"
      ? "aspect-square h-auto min-h-[12rem] max-h-[36rem]"
      : heightRectClasses;

  return (
    <div
      onClick={onClick}
      className={clsx(
        // Modern glassy dark card aligned with header colors
        "relative group overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-gray-800/85 to-gray-900/85 border border-white/10",
        "backdrop-blur-xl text-white",
        // Depth + subtle motion
        "transform-gpu will-change-transform transition-all duration-300 ease-out",
        "shadow-[0_8px_28px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "hover:scale-[1.015] hover:-translate-y-0.5",
        // Soft ring glow on hover/focus
        "ring-1 ring-white/5 hover:ring-white/10 focus-within:ring-white/15",
        // Spacing and scroll
        "p-5 md:p-6 overflow-auto" + (onClick ? " cursor-pointer" : ""),
        spanClasses,
        shapeClasses
      )}
    >
      {/* Subtle top light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/10 to-transparent" />

      {/* Very subtle hover highlight (more gentle “verlauf”) */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.05),transparent_55%)]" />
      </div>

      {children}
    </div>
  );
}
