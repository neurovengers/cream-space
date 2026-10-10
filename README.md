# CREAM

**An AI-native marketplace connecting AI filmmakers, animators and generative
content creators with brands and creative agencies.**

CREAM exists because the two hardest problems in generative creative work are
not generation problems.

The first is **verification**. A brand cannot tell which creator actually uses
the tools they claim, and cannot tell a published pipeline from a mood board. So
every creator on CREAM publishes a workflow with named human decision points,
carries vendor-credentialed tool claims, and has a trust score computed only
from claims that were independently substantiated.

The second is **the brief**. A brand knows what it wants and cannot say it. So
an assistant converses with them — one question at a time — and turns badly
worded intent into a brief specific enough for a creator to quote against. The
transcript is preserved and re-hydrated on the creator's side, which is the part
no other marketplace does.

Everything sensitive is delegated to a third party we do not control:
Supabase for auth, DigiLocker for identity, Razorpay for held payments,
SynthID/C2PA for provenance. CREAM keeps the orchestration, the contracts and
the trail.

---

## Run it

**Windows** — double-click:

```
START-CREAM.bat
```

It installs dependencies on first run, copies `.env.example` to `.env.local`
if it is missing, builds for production, starts the server, waits for it to
answer, and opens `http://localhost:3000` in your browser.

Other modes:

| Command | What it does |
| --- | --- |
| `START-CREAM.bat` | Production build, serve, open browser |
| `START-CREAM.bat dev` | Development server with hot reload |
| `START-CREAM.bat build` | Production build only |
| `START-CREAM.bat check` | `typecheck` + `lint` + production build |
| `START-CREAM.bat clean` | Wipe `.next` and reinstall dependencies |

**Any platform** — use the same launcher directly:

```bash
npm run launch            # build + serve + open
npm run launch -- --dev   # development server
npm run launch -- --no-build
```

Node 18+ required. **No API key is required to run anything.**

---

## Configuration

Copy `.env.example` to `.env.local` and fill in whatever you have. Every key is
optional; each subsystem falls back to a sandbox adapter that reproduces the
same object shapes and state machine as the live service.

| Key | Unlocks |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Google & Apple SSO, row-level security, Postgres + pgvector |
| `GEMINI_API_KEY` | Free-form requirement extraction and creator-side brief translation |
| `NEXT_PUBLIC_DIGILOCKER_CLIENT_ID` | Issuer-asserted identity verification |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `_KEY_SECRET` | Held-and-released escrow, sub-account splits, TDS payout |
| `NEXT_PUBLIC_SYNTHID_API_KEY` | Server-side imperceptible watermarking with confidence-scored extraction |

The header shows a live `n/5 live` counter, and `/trust` breaks down exactly
what each subsystem is doing and why. Nothing on screen claims a capability the
running code does not have.

---

## What to look at first

| Route | Why |
| --- | --- |
| `/` | The thesis: why the AI never queries the creator database |
| `/discover` | Faceted search with explainable ranking and a recovery-aware empty state |
| `/creators/aarav.mehta` | The AI portfolio: tools, models, workflows with human checkpoints, trust signals |
| `/briefs/new` | The AI brief builder — say it badly, get a quotable brief |
| `/briefs/BRF-2026-0141` | Brief definition: deliverables, formats, and the commercial-use struct |
| `/engagements/ENG-2026-0311` | Gated lifecycle: contracts, escrow arithmetic, watermarked rounds, provenance |
| `/trust` | The four objections answered from the adapters themselves |
| `/onboarding/identity` | The DigiLocker consent flow, including a supported refusal path |
| `/model` | **Deliverable 2** — the data model note |
| `/deck` | **Deliverable 3** — the demo deck (`←`/`→` to navigate, `P` to print) |

---

## Architecture

```
scripts/launch.mjs              one-command launcher (build, serve, health-check, open)

src/lib/domain/                 the model, with the reasoning attached
  types.ts                      every entity the marketplace reasons about
  taxonomy.ts                   tools, models, skills, formats, channels
  trust.ts                      verification signals, derived — never hand-authored

src/lib/data/                   seed dataset
  creators.ts  portfolio.ts  workflows.ts  briefs.ts  brands.ts  commerce.ts

src/lib/search/engine.ts        faceted search, explainable ranking, empty-state blockers

src/lib/integrations/
  registry.ts                   decides live vs sandbox, and says why
  digilocker.ts                 six-step issuer consent → signed assertion, no artefact
  razorpay.ts                   order → authorise → capture → milestone release → refund
  provenance.ts                 C2PA manifest + keyed watermark + visible burn-in + extraction

src/lib/llm/
  contract.ts                   the assistant's output schema
  gemini.ts                     live Gemini path (schema-constrained JSON)
  reasoner.ts                   deterministic extractor used when no key is present
  index.ts                      one entry point; identical contract either way

src/app/api/                    route handlers for every third-party seam
src/components/                 design system, media engine and feature surfaces
```

### Three decisions worth knowing

**The model never searches the database.** A model cannot hold a continuously
changing creator pool without overflowing, and when it guesses it hallucinates.
So the model converses, deterministic code queries, and the model explains the
result. The brief page at `/briefs/BRF-2026-0141` runs the real search engine
against the real pool to prove the brief is executable as a query.

**Trust signals are derived, not declared.** `signalsFor()` builds them from the
same records that power search — remove a tool from a profile and the "verified
tools" signal disappears with it. A claim and its substantiation cannot drift.
Only `verified` signals score; self-attested claims are shown and count zero.

**Commercial use is a struct, not a boolean.** `licenseType`, `territory`,
`duration`, `channels`, `paidMediaAllowed`, `modelTrainingAllowed`,
`competitorUseBlocked` — each one moves the price by a different amount, and
collapsing them into "commercial use: yes" is how disputes start.

---

## Commands

```bash
npm run dev         # development server
npm run build       # production build
npm start           # serve the production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run verify      # all three
npm run launch      # full launcher
```

---

## Notes

This is a working prototype. Payments, identity and watermarking run against
sandbox adapters unless keys are supplied. Contract content, dispute resolution
and refunds are explicitly human-reviewed in the product design and are not
automated here. All portfolio artwork is generated procedurally from each
piece's own seed and palette — the same piece always renders the same frame,
which is the reproducibility guarantee a real generative pipeline gives you.