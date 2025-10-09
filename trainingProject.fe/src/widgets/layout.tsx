import clsx from "clsx";
import React from "react";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const childrenCount = React.Children.count(children);

  // Fallback: max 3 Columns
  const gridCols =
    childrenCount <= 1
      ? "grid-cols-1"
      : childrenCount === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className={clsx("grid gap-4 p-6 auto-rows-min", gridCols)}>
      {children}
    </div>
  );
}
