import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LoadingPanelProps = {
  title: string;
  description: string;
  className?: string;
};

export function LoadingPanel({ title, description, className }: LoadingPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface/80 p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-footer/15 text-footer">
          <Spinner className="size-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
