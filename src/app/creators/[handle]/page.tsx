import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CREATORS } from "@/lib/data/creators";
import { CreatorProfile } from "@/components/creator/creator-profile";

export function generateStaticParams() {
  return CREATORS.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const creator = CREATORS.find((c) => c.handle === handle);
  if (!creator) return { title: "Creator not found" };
  return {
    title: `${creator.displayName} — ${creator.specializations[0] ?? "AI creator"}`,
    description: creator.headline,
  };
}

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const creator = CREATORS.find((c) => c.handle === handle);
  if (!creator) notFound();
  return <CreatorProfile creatorId={creator.id} />;
}