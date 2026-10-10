import { cn } from "@/lib/utils";
import { integrationStatus } from "@/lib/integrations/registry";
import { Header } from "./header";
import { Footer } from "./footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const integrations = integrationStatus();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(120%_80%_at_50%_-10%,color-mix(in_oklab,var(--caramel)_11%,transparent),transparent_62%)]"
      />
      <Header integrations={integrations} />
      <main className={cn("flex-1")}>{children}</main>
      <Footer integrations={integrations} />
    </div>
  );
}