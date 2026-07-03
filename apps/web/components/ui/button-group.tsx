import * as React from "react";
import { cn } from "@/lib/utils";

const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { orientation?: string }>(
  ({ className, orientation, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex items-center gap-1", className)} {...props} />
  )
);
ButtonGroup.displayName = "ButtonGroup";

const ButtonGroupText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props} />
  )
);
ButtonGroupText.displayName = "ButtonGroupText";

export { ButtonGroup, ButtonGroupText };
