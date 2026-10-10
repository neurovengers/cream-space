import type { Metadata } from "next";
import { BriefBuilder } from "@/components/brief/brief-builder";
import { BRANDS, ACTIVE_BRAND_ID } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "AI brief builder",
  description:
    "Turn a rough idea into a structured, quotable creative brief — content type, format, commercial use, budget and timeline — through conversation.",
};

export default function NewBriefPage() {
  const brand = BRANDS.find((b) => b.id === ACTIVE_BRAND_ID)!;
  return <BriefBuilder brandName={brand.name} />;
}