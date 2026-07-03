import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "@/components/app/BottomNav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
