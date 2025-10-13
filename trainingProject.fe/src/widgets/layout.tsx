import clsx from "clsx";
import React from "react";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const childrenCount = React.Children.count(children);

  // Fallback: max 3 Columns for base
  const gridCols =
    childrenCount <= 1
      ? "grid-cols-1"
      : childrenCount === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div
      className={clsx(
        // Responsive columns (Apple-like airy spacing)
        "grid gap-6 p-6 mx-auto max-w-7xl",
        // Base fallback by children count + responsive overrides
        gridCols,
        "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}
    >
      {children}
    </div>
  );
}
