import * as React from "react"

import { cn } from "@/lib/utils"

type EmptyStateBackdropProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyStateBackdrop = React.forwardRef<
  HTMLDivElement,
  EmptyStateBackdropProps
>(function EmptyStateBackdrop({ className, children, ...rest }, ref) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cn(
        "relative size-full overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a]",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] mask-[radial-gradient(ellipse_70%_60%_at_50%_50%,black_30%,transparent_100%)] bg-size-[32px_32px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(99,102,241,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(99,102,241,0.12),transparent_70%)]"
      />
      {children}
    </div>
  )
})
