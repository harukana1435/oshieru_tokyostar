import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-opacity-50 disabled:pointer-events-none disabled:opacity-50 touch-target",
  {
    variants: {
      variant: {
        default: "bg-primary-400 text-neutral-800 hover:bg-primary-500 active:bg-primary-600 shadow-normal hover:shadow-strong",
        destructive:
          "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-normal hover:shadow-strong",
        outline:
          "border-2 border-primary-300 bg-transparent text-primary-600 hover:bg-primary-50 hover:border-primary-400 active:bg-primary-100",
        secondary:
          "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 shadow-soft hover:shadow-normal",
        ghost: "bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700 active:bg-neutral-100",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
        success: "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-normal hover:shadow-strong",
        warning: "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 shadow-normal hover:shadow-strong",
      },
      size: {
        default: "h-11 px-4 py-2 md:px-6 md:py-3",
        sm: "h-9 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm",
        lg: "h-12 px-6 py-3 md:px-8 md:py-4 text-base md:text-lg",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 