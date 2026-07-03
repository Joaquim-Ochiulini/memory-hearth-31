import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line-soft bg-surface p-6 shadow-lift"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {title && (
                      <Dialog.Title className="text-display text-xl text-ink">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-ink-soft">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close className="shrink-0 rounded-full p-1.5 text-ink-mute transition-colors hover:bg-surface-muted hover:text-ink">
                    <X className="h-4 w-4" strokeWidth={1.6} />
                  </Dialog.Close>
                </div>
                {children && <div className="mt-4">{children}</div>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
