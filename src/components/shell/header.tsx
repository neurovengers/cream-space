"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { Wordmark } from "./wordmark";
import { Button } from "@/components/ui/primitives";
import type { IntegrationStatus } from "@/lib/integrations/registry";

const NAV = [
  { href: "/discover", label: "Discover", match: "/discover" },
  { href: "/briefs", label: "Briefs", match: "/briefs" },
  { href: "/engagements", label: "Workspaces", match: "/engagements" },
  { href: "/trust", label: "Trust", match: "/trust" },
  { href: "/model", label: "Data model", match: "/model" },
  { href: "/deck", label: "Deck", match: "/deck" },
];

export function Header({ integrations }: { integrations: IntegrationStatus[] }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const shortlist = useApp((s) => s.shortlist);
  const live = integrations.filter((i) => i.mode === "live").length;

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65">
      <div className="container-x flex h-15 items-center gap-4">
        <Wordmark className="shrink-0" />

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.match || pathname.startsWith(`${item.match}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
                  active ? "text-ink" : "text-ink-muted hover:text-ink-2",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-px bg-caramel" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/trust"
            className="hidden items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1.5 transition-colors hover:border-line-strong md:inline-flex"
            title="Integration mode — what is live versus mocked"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-mint" />
              <span className="relative inline-flex size-1.5 rounded-full bg-mint" />
            </span>
            <span className="font-mono text-[10.5px] tracking-tight text-ink-2">
              {live}/{integrations.length} live
            </span>
            <span className="font-mono text-[10.5px] text-ink-faint">
              {shortlist.length} shortlisted
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            aria-label="Toggle surface"
            className="grid size-8.5 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {theme === "espresso" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          <Button asChild size="sm" variant="accent" className="hidden sm:inline-flex">
            <Link href="/briefs/new">
              <Sparkles className="size-3.5" />
              New brief
            </Link>
          </Button>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid size-8.5 place-items-center rounded-full border border-line text-ink-muted lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden">
          <div className="container-x grid gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-[15px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="accent" className="mt-2 w-full">
              <Link href="/briefs/new">Start a brief</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}