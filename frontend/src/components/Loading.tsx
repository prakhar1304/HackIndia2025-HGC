"use client";

import { cn } from "@/lib/utils";

export default function Loading({ label = "Loading...", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 rounded-xl border-2 bg-white p-6 shadow-[6px_6px_0_0_#000]", className)}>
      <span className="size-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}


