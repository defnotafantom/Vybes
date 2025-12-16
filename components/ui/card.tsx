import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-2xl border-2 bg-gradient-to-br from-white/90 via-sky-50/30 to-blue-50/30 dark:from-gray-800/90 dark:via-sky-900/20 dark:to-blue-900/20 backdrop-blur-xl border-sky-200/50 dark:border-sky-800/50 text-card-foreground shadow-xl shadow-sky-500/10 dark:shadow-sky-900/20 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/20 dark:hover:shadow-sky-900/30 hover:scale-[1.01] overflow-hidden",
      className
    )}
    {...props}
  >
    {/* Decorative gradient overlay */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/10 to-blue-500/10 rounded-full blur-2xl -z-0"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl -z-0"></div>
    <div className="relative z-10">
      {props.children}
    </div>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-slate-800 via-sky-600 to-blue-600 dark:from-slate-100 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 relative z-10", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

