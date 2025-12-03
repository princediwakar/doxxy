import { cn } from "@/lib/utils"
import { Loader2, Clock } from "lucide-react"
import { Skeleton } from "./skeleton"

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl"
export type SpinnerVariant = "primary" | "secondary" | "muted" | "white"

interface SpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16"
}

const variantClasses: Record<SpinnerVariant, string> = {
  primary: "border-primary",
  secondary: "border-secondary",
  muted: "border-muted",
  white: "border-white"
}

export const Spinner = ({ size = "md", variant = "primary", className }: SpinnerProps) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

interface PageLoaderProps {
  fullScreen?: boolean
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
}

export const PageLoader = ({
  fullScreen = false,
  size = "lg",
  variant = "primary",
  className
}: PageLoaderProps) => {
  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen ? "min-h-screen" : "min-h-[400px]",
    className
  )

  return (
    <div className={containerClasses}>
      <Spinner size={size} variant={variant} />
    </div>
  )
}

interface ButtonLoaderProps {
  icon?: "loader" | "clock"
  size?: "xs" | "sm"
  className?: string
}

export const ButtonLoader = ({ icon = "loader", size = "xs", className }: ButtonLoaderProps) => {
  const Icon = icon === "clock" ? Clock : Loader2
  return (
    <Icon className={cn(
      "animate-spin",
      size === "xs" ? "h-3 w-3" : "h-4 w-4",
      className
    )} />
  )
}

interface SkeletonLoaderProps {
  count?: number
  className?: string
  itemClassName?: string
}

export const SkeletonLoader = ({
  count = 3,
  className,
  itemClassName = "h-16 bg-muted/50 rounded-md"
}: SkeletonLoaderProps) => {
  return (
    <div className={cn("p-4 space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={itemClassName} />
      ))}
    </div>
  )
}