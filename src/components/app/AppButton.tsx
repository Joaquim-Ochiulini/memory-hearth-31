import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-[opacity,background,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        ghost: "bg-transparent text-ink hover:bg-surface-muted",
        outline: "border border-line bg-surface text-ink hover:bg-surface-muted",
        subtle: "bg-surface-muted text-ink hover:bg-line-soft",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface AppButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
AppButton.displayName = "AppButton";
