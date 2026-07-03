import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Home, MapPin, User, Users } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: "/" | "/memories" | "/people" | "/places" | "/profile";
  label: string;
  Icon: typeof Home;
};

const items: NavItem[] = [
  { to: "/", label: "Início", Icon: Home },
  { to: "/memories", label: "Memórias", Icon: BookOpen },
  { to: "/people", label: "Pessoas", Icon: Users },
  { to: "/places", label: "Lugares", Icon: MapPin },
  { to: "/profile", label: "Perfil", Icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-3 pt-2">
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className="group relative flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium tracking-wide"
              >
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center transition-colors",
                    active ? "text-ink" : "text-ink-mute group-hover:text-ink-soft",
                  )}
                >
                  <Icon strokeWidth={1.6} className="h-[18px] w-[18px]" />
                </span>
                <span
                  className={cn(
                    "transition-colors",
                    active ? "text-ink" : "text-ink-mute group-hover:text-ink-soft",
                  )}
                >
                  {label}
                </span>
                {active && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-[9px] h-[2px] w-8 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
