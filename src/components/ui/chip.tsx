import * as React from "react"

import { cn } from "@/lib/utils"
import { chipVariants, type ChipVariants } from "./chip-variants"

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ChipVariants {
  selected?: boolean
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, selected = false, ...props }, ref) => {
    return (
      <button
        type="button"
        className={cn(
          chipVariants({
            variant: selected ? "selected" : variant,
            size,
            className
          })
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Chip.displayName = "Chip"

export { Chip }