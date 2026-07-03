import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Screen — outer page wrapper.
 * Handles safe-areas, page enter animation, and consistent gutters.
 */
export function Screen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto min-h-[100dvh] w-full max-w-md px-5 pt-6 pb-28",
        className,
      )}
    >
      {children}
    </motion.main>
  );
}
