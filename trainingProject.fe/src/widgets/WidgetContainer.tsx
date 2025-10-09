import clsx from "clsx";
import React from "react";

export default function WidgetContainer({
  children,
  size = "medium",
}: {
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}) {
  const sizeClasses = clsx({
    "col-span-1 row-span-1 h-64": size === "small",
    "col-span-2 row-span-1 h-64": size === "medium",
    "col-span-2 row-span-2 h-[32rem]": size === "large",
  });

  return (
    <div
      className={clsx(
        "p-6 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 hover:shadow-xl transition-shadow duration-300 overflow-auto",
        sizeClasses
      )}
    >
      {children}
    </div>
  );
}
