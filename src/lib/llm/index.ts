import { EMPTY_DRAFT, type BriefTurnRequest, type BriefTurnResponse } from "./contract";
import { geminiAvailable, runGeminiTurn, translateBriefForCreator } from "./gemini";
import { runDeterministicTurn } from "./reasoner";

export * from "./contract";
export { runDeterministicTurn, SUGGESTION_POOL, draftReadout, missingFields, progressOf } from "./reasoner";
export { geminiAvailable } from "./gemini";

/**
 * Single entry point for the conversational engine. Live when a key exists,
 * deterministic otherwise, identical contract either way.
 */
export async function runBriefTurn(input: BriefTurnRequest): Promise<BriefTurnResponse> {
  const normalised: BriefTurnRequest = {
    ...input,
    draft: { ...EMPTY_DRAFT, ...input.draft },
  };
  if (geminiAvailable()) {
    const live = await runGeminiTurn(normalised);
    if (live) return live;
  }
  return runDeterministicTurn(normalised);
}

export async function translateForCreator(input: {
  briefText: string;
  creatorName: string;
  brandName: string;
  conversation: { role: string; text: string }[];
}) {
  const live = await translateBriefForCreator(input);
  if (live) return live;
  return { text: fallbackTranslation(input), simulated: true };
}

/** Preserves every constraint when the model is unavailable. */
function fallbackTranslation(input: {
  briefText: string;
  creatorName: string;
  brandName: string;
}): string {
  const first = input.creatorName.split(" ")[0];
  return [
    `${first} — here is what ${input.brandName} actually asked for, with the parts they were vague about called out.`,
    "",
    input.briefText.trim(),
    "",
    "What they did not specify, and where I have assumed: review count is unstated, so the revision cap in the contract governs. Delivery format is unstated, so masters plus review proxies is assumed. Talent, location and casting are unstated — send us a reference and we will price against it rather than guess.",
  ].join("\n");
}