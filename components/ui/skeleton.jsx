// /components/ui/skeleton.jsx
import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/60 dark:bg-gray-800/60",
        className
      )}
      {...props}
    />
  );
}
