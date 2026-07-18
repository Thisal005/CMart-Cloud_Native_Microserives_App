import * as React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <FolderOpen className="text-muted-foreground h-12 w-12" />,
  actionLabel,
  onActionClick,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="bg-muted mb-4 flex items-center justify-center rounded-full p-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">{description}</p>
      {actionLabel && onActionClick && (
        <Button onClick={onActionClick} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
