import { cva, type VariantProps } from "class-variance-authority"

export const chipVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        selected: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
      },
      size: {
        default: "h-8 px-3 py-1",
        sm: "h-7 px-2 py-0 text-xs",
        lg: "h-9 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ChipVariants = VariantProps<typeof chipVariants>