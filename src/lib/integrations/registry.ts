/**
 * Integration registry — the single place that decides whether a subsystem is
 * live or mocked. Every page reads from here so the "sandbox / live" badges on
 * screen can never disagree with what is actually happening underneath.
 */

export type AdapterMode = "live" | "mock";

export interface IntegrationStatus {
  id: "supabase" | "gemini" | "digilocker" | "razorpay" | "synthid";
  name: string;
  vendor: string;
  mode: AdapterMode;
  /** Why we chose this mode, rendered verbatim in the trust panel. */
  reason: string;
  /** What a live key would unlock. */
  unlocks: string;
  envKey: string;
  docsUrl: string;
}

function key(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function integrationStatus(): IntegrationStatus[] {
  const supabaseLive = Boolean(key("NEXT_PUBLIC_SUPABASE_URL") && key("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
  const geminiLive = Boolean(key("GEMINI_API_KEY"));
  const dlLive = Boolean(key("NEXT_PUBLIC_DIGILOCKER_CLIENT_ID"));
  const rzLive = Boolean(key("NEXT_PUBLIC_RAZORPAY_KEY_ID") && key("NEXT_PUBLIC_RAZORPAY_KEY_SECRET"));
  const syLive = Boolean(key("NEXT_PUBLIC_SYNTHID_API_KEY") || key("NEXT_PUBLIC_SYNTHID_WATERMARK_ENDPOINT"));

  return [
    {
      id: "supabase",
      name: "Auth & datastore",
      vendor: "Supabase",
      mode: supabaseLive ? "live" : "mock",
      reason: supabaseLive
        ? "Connected. Sessions are issued by Supabase Auth with third-party SSO."
        : "No Supabase key present, so the session runs on the built-in datastore. The adapter boundary is identical, so swapping it in changes no application code.",
      unlocks: "Google / Apple SSO, row-level security, Postgres + pgvector, realtime updates.",
      envKey: "NEXT_PUBLIC_SUPABASE_URL",
      docsUrl: "https://supabase.com/docs",
    },
    {
      id: "gemini",
      name: "Brief builder",
      vendor: "Google Gemini",
      mode: geminiLive ? "live" : "mock",
      reason: geminiLive
        ? "Live. Structured brief extraction and creator-side translation run on Gemini."
        : "No API key present, so the conversational engine runs on a deterministic scripted reasoner that follows the same extraction contract.",
      unlocks: "Free-form requirement extraction from badly-worded ideas, multilingual input, semantic brief matching.",
      envKey: "GEMINI_API_KEY",
      docsUrl: "https://ai.google.dev/gemini-api/docs",
    },
    {
      id: "digilocker",
      name: "Identity",
      vendor: "DigiLocker",
      mode: dlLive ? "live" : "mock",
      reason: dlLive
        ? "Live. Identity is asserted by the issuer over a consented DigiLocker pull."
        : "Sandbox adapter. You walk the same six-step issuer consent flow, and receive the same assertion envelope — CREAM still never receives a document.",
      unlocks: "Government-issued identity verification without CREAM ever touching the file.",
      envKey: "NEXT_PUBLIC_DIGILOCKER_CLIENT_ID",
      docsUrl: "https://digilocker.gov.in",
    },
    {
      id: "razorpay",
      name: "Payments & escrow",
      vendor: "Razorpay",
      mode: rzLive ? "live" : "mock",
      reason: rzLive
        ? "Live. Orders, mandates and staged releases run through Razorpay Route."
        : "Sandbox adapter. Orders, captures, milestone releases and refunds reproduce the exact Razorpay object shapes and state transitions.",
      unlocks: "Held-and-released escrow, sub-account splits, TDS-compliant creator payouts, webhook reconciliation.",
      envKey: "NEXT_PUBLIC_RAZORPAY_KEY_ID",
      docsUrl: "https://razorpay.com/docs",
    },
    {
      id: "synthid",
      name: "Provenance & watermark",
      vendor: "SynthID / C2PA",
      mode: syLive ? "live" : "mock",
      reason: syLive
        ? "Live. Invisible watermarking is delegated to the SynthID endpoint."
        : "Local stamper. Emits a real C2PA-shaped manifest, embeds a keyed watermark envelope, and reproduces dual-branded visible burn-in.",
      unlocks: "Server-side imperceptible watermarking with confidence-scored extraction.",
      envKey: "NEXT_PUBLIC_SYNTHID_API_KEY",
      docsUrl: "https://deepmind.google/technologies/synthid/",
    },
  ];
}

export function modeOf(id: IntegrationStatus["id"]): AdapterMode {
  return integrationStatus().find((s) => s.id === id)?.mode ?? "mock";
}

export function isLive(id: IntegrationStatus["id"]) {
  return modeOf(id) === "live";
}

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";