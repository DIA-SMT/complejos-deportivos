import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow-sm shadow-blue-900/15 hover:bg-blue-500 hover:shadow-md hover:shadow-blue-900/20",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-blue-200/80 bg-white/65 text-slate-700 shadow-sm backdrop-blur hover:border-blue-300 hover:bg-white hover:text-blue-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white",
        secondary:
          "bg-blue-100/80 text-blue-800 hover:bg-blue-200/80 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/60",
        ghost:
          "hover:bg-blue-100/70 hover:text-blue-700 dark:hover:bg-white/8 dark:hover:text-blue-200",
        link: "text-blue-600 underline-offset-4 hover:text-blue-700 hover:underline dark:text-blue-300 dark:hover:text-blue-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
