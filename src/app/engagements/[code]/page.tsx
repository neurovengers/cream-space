import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRIEFS } from "@/lib/data/briefs";
import {
  CONTRACTS,
  ENGAGEMENTS,
  ESCROWS,
  OFFERS,
  PROVENANCE,
} from "@/lib/data/commerce";
import { CREATOR_BY_ID } from "@/lib/data/creators";
import { assessTrust } from "@/lib/domain/trust";
import { ESCROW_POLICY, payoutBreakdown } from "@/lib/integrations/razorpay";
import { EngagementWorkspace } from "@/components/engagement/engagement-workspace";
import type { PayoutMath } from "@/components/engagement/escrow-panel";

export const revalidate = 3600;

export function generateStaticParams() {
  return ENGAGEMENTS.map((e) => ({ code: e.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const engagement = ENGAGEMENTS.find((e) => e.code === code || e.id === code);
  if (!engagement) return { title: "Engagement not found" };
  const brief = BRIEFS.find((b) => b.id === engagement.briefId);
  const creator = CREATOR_BY_ID.get(engagement.creatorId);
  return {
    title: `${engagement.code}${brief ? ` — ${brief.title}` : ""}`,
    description: `Production workspace for ${creator?.displayName ?? "an AI creator"}: gated stages, escrow position, contract stack, generation rounds and provenance.`,
  };
}

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const engagement = ENGAGEMENTS.find((e) => e.code === code || e.id === code);
  if (!engagement) notFound();

  const brief = BRIEFS.find((b) => b.id === engagement.briefId);
  const creator = CREATOR_BY_ID.get(engagement.creatorId);
  const trust = creator ? assessTrust(creator) : null;
  const offer = OFFERS.find((o) => o.id === engagement.offerId);
  const contracts = CONTRACTS.filter((c) => engagement.contractIds.includes(c.id));
  const escrow = ESCROWS.find((e) => e.id === engagement.escrowId);
  const provenance = [
    ...engagement.provenance,
    ...PROVENANCE.filter((p) => p.engagementId === engagement.id),
  ];

  const payout: PayoutMath | null = escrow
    ? payoutBreakdown(escrow.releasedInr)
    : null;

  const daysRemaining = Math.ceil(
    (new Date(engagement.dueAt).getTime() - Date.now()) / 86_400_000,
  );

  return (
    <EngagementWorkspace
      engagement={engagement}
      brief={brief}
      creator={creator}
      trust={trust}
      offer={offer}
      contracts={contracts}
      escrow={escrow}
      provenance={provenance}
      policy={ESCROW_POLICY}
      payout={payout}
      daysRemaining={daysRemaining}
    />
  );
}
