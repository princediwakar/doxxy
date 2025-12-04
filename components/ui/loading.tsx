// src/components/ui/loading.tsx
import { cn } from "@/lib/utils"
import { Loader2, CircleDashed } from "lucide-react"
import { Skeleton } from "./skeleton"

// --- 1. Base Spinner (SVG based is smoother than CSS border) ---

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl"
export type SpinnerVariant = "primary" | "secondary" | "muted" | "white" | "ghost"

interface SpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
  /**
   * If true, uses a dashed circle style instead of the standard spinner
   */
  dashed?: boolean
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

const variantClasses: Record<SpinnerVariant, string> = {
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  white: "text-white",
  ghost: "text-gray-400/50"
}

export const Spinner = ({ 
  size = "md", 
  variant = "primary", 
  dashed = false,
  className 
}: SpinnerProps) => {
  const Icon = dashed ? CircleDashed : Loader2
  
  return (
    <Icon
      className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Loading"
    />
  )
}

// --- 2. Bouncing Dots (Great for "Typing..." or minimal states) ---

export const DotsLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex space-x-1 items-center", className)}>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// --- 3. Page & Layout Loaders ---

interface PageLoaderProps {
  fullScreen?: boolean
  blur?: boolean
  size?: SpinnerSize
  text?: string
  className?: string
}

export const PageLoader = ({
  fullScreen = false,
  blur = false,
  size = "lg",
  text,
  className
}: PageLoaderProps) => {
  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4 z-50",
    fullScreen ? "fixed inset-0 min-h-screen w-full" : "min-h-[400px] w-full",
    blur && "bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60",
    !blur && fullScreen && "bg-background",
    className
  )

  return (
    <div className={containerClasses}>
      <Spinner size={size} variant="primary" />
      {text && (
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// --- 4. Overlay Loader (For blocking sections/forms) ---

export const LoadingOverlay = ({ 
  visible = false,
  className 
}: { 
  visible?: boolean, 
  className?: string 
}) => {
  if (!visible) return null;
  return (
    <div className={cn(
      "absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-inherit transition-all duration-200",
      className
    )}>
      <Spinner size="md" />
    </div>
  )
}

// --- 5. Button Loader (Cleaner implementation) ---

interface ButtonLoaderProps {
  label?: string
  loading?: boolean
  iconPosition?: "left" | "right"
  className?: string
  size?: SpinnerSize
}

/**
 * Helper to wrap inside buttons. 
 * Usage: <Button disabled={isLoading}> <ButtonLoader loading={isLoading} label="Submit" /> </Button>
 */
export const ButtonLoader = ({
  label,
  loading,
  iconPosition = "left",
  className,
  size = "xs"
}: ButtonLoaderProps) => {
  if (!loading) return <>{label}</>;

  return (
    <span className={cn("flex items-center gap-2", className)}>
      {iconPosition === "left" && <Spinner size={size} className="border-current" />}
      {label}
      {iconPosition === "right" && <Spinner size={size} className="border-current" />}
    </span>
  )
}

// --- 6. Skeleton Patterns ---

interface SkeletonLoaderProps {
  type?: "list" | "card" | "text"
  count?: number
  className?: string
}

export const SkeletonLoader = ({
  type = "list",
  count = 3,
  className
}: SkeletonLoaderProps) => {
  
  if (type === "card") {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Default List
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )
}