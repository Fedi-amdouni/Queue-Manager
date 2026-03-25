import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
      link: "text-primary underline-offset-4 hover:underline",
      gradient: "bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
    }
    
    const sizes = {
      default: "h-11 px-5 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-14 rounded-xl px-8 text-lg",
      icon: "h-11 w-11",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
