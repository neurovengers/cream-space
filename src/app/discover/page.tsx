import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoveryConsole } from "@/components/discover/discovery-console";
import { Skimmer } from "@/components/discover/console-fallback";

export const metadata: Metadata = {
  title: "Discover AI creators",
  description:
    "Search and filter AI filmmakers, animators and generative creators by skill, tool, content type, format, budget, turnaround and trust signal.",
};

export default function DiscoverPage() {
  return (
    <Suspense fallback={<Skimmer />}>
      <DiscoveryConsole />
    </Suspense>
  );
}