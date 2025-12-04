"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Renders a styled horizontal or vertical separator element.
 *
 * @param className - Additional CSS class names to merge with the component's default styles.
 * @param orientation - Layout orientation of the separator; `"horizontal"` renders a full-width 1px horizontal rule, `"vertical"` renders a full-height 1px vertical rule. Defaults to `"horizontal"`.
 * @param decorative - When `true`, marks the separator as purely presentational for assistive technologies. Defaults to `true`.
 * @returns A React element representing a themed separator divider.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }