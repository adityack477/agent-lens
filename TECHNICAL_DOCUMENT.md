# AgentLens - Technical Document

**Track 5: AI Representation Optimizer**
**Hackathon: Kasparro Agentic Commerce Hackathon 2026**

---

## System Architecture

```
Next.js App (single repo)
├── src/app/
│   ├── page.js                  # Main page, state machine
│   ├── layout.js                # Root layout, fonts
│   └── api/analyze/route.js     # Server-side API handler
├── src/lib/
│   ├── shopify.js               # Shopify GraphQL ingestion
│   ├── analyzer.js              # Deterministic analysis engine
│   ├── ai.js                    # Groq AI reasoning layer
│   └── scoring.js               # AIR Score calculation
└── src/components/
    ├── InputForm.js             # Store URL + token input
    ├── LoadingState.js          # Animated progress indicator
    ├── Dashboard.js             # Results container
    ├── AIRScorePanel.js         # Score ring + dimension bars
    ├── PersonaPanel.js          # 3 AI buyer persona cards
    ├── GapPanel.js              # Representation gap analysis
    └── FixPanel.js              # Prioritized fix engine
```

The entire application lives in a single Next.js 14 repo. The frontend is React with Tailwind CSS. All analysis logic runs server-side inside a single API route at `/api/analyze`. API keys are never exposed to the client.

Data flows in one direction: the merchant enters their store URL and Admin API token, the server fetches store data from Shopify's GraphQL Admin API, the deterministic engine scores it, Groq adds language-level reasoning on top, and the full result object is returned to the client in one response.

---

## Key Implementation Decisions

**Decision 1: Next.js monorepo over separate frontend and backend**

A single Next.js repo with API routes keeps the codebase simple for a solo build. There is no Express or FastAPI server to deploy separately. Vercel deploys the full stack from one repo, and the API route handles server-side secrets cleanly. This was the right call for scope and speed.

**Decision 2: Hard boundary between deterministic scoring and LLM reasoning**

This is the most important architectural decision in the system. All numerical scoring is handled entirely by deterministic code in `analyzer.js` and `scoring.js`. The LLM is never allowed to produce or influence a number.

Deterministic code handles:
- Missing field detection across product data
- Schema validation and completeness checks
- Contradiction detection (for example, a product marked in-stock with zero inventory)
- Numerical scoring across all five AIR dimensions
- Fix ranking by estimated revenue impact

Groq (Llama 3.3 70B) handles:
- Buyer persona simulation: how each persona would perceive and evaluate the store
- Gap explanation: translating score deltas into plain language a merchant understands
- Fix recommendations: specific, actionable copy written for each identified gap

The reason for this boundary is reproducibility. If a merchant runs the analysis twice on the same store data and gets different scores, the tool loses credibility. LLM non-determinism is acceptable for language output. It is not acceptable for scoring.

**Decision 3: Structured JSON output with retry and fallback**

Every Groq call is prompted to return a strict JSON object. The prompt specifies the exact schema expected. If the response fails to parse, the system retries once. If the retry also fails, the analysis falls back to deterministic-only output: the scores and gap data are still shown, but the LLM-generated explanations and recommendations are replaced with templated defaults. Partial results are always better than a failure screen.

**Decision 4: Smart product sampling, capped at 20**

Analyzing every product in a large store is slow and expensive. The sampling strategy selects the top 10 products by collection priority, 5 products with the most obvious data gaps (identified by a lightweight pre-scan), and 5 random products for coverage. This gives a representative picture of the store's AI readiness without sacrificing depth for breadth.

**Decision 5: Single API call, full result object**

Rather than streaming partial results or making multiple round trips, the client makes one request and waits for the complete analysis. This keeps the client-side state machine simple: loading, result, or error. The animated loading state with progress messages covers the 20 to 30 second wait time honestly, without faking progress.

---

## Data Flow

```
Client (browser)
    |
    | POST /api/analyze { storeUrl, accessToken }
    |
API Route (server-side, Next.js)
    |
    |-- shopify.js: GraphQL Admin API fetch
    |       Products, collections, policies, metafields
    |       Smart sample: top 10 + 5 gap + 5 random (capped at 20)
    |
    |-- analyzer.js: Deterministic analysis
    |       Missing field detection
    |       Contradiction detection
    |       Per-product gap flags
    |
    |-- scoring.js: AIR Score calculation
    |       5 dimension scores (weighted)
    |       Overall AIR Score (0-100)
    |
    |-- ai.js: Groq reasoning layer
    |       Persona simulation (3 calls or batched)
    |       Gap explanation generation
    |       Fix recommendations with revenue ranking
    |
    | Response: full result object (JSON)
    |
Client renders Dashboard
    AIRScorePanel, PersonaPanel, GapPanel, FixPanel
```

---

## AIR Score Dimensions

| Dimension | Scoring Method | Weight |
|---|---|---|
| Trustability | Deterministic + LLM context | 25% |
| Interpretability | Deterministic | 20% |
| Comparability | Deterministic + LLM context | 20% |
| Decision Completeness | Deterministic | 20% |
| Policy Clarity | Deterministic | 15% |

Trustability covers review presence, return policy clarity, and brand signal completeness. Interpretability covers description quality and heading structure. Comparability covers specification depth and structured attributes. Decision Completeness covers the presence of all fields an AI agent needs to make a confident recommendation. Policy Clarity covers shipping, return, and warranty information.

---

## Failure Handling

| Scenario | What Happens |
|---|---|
| Shopify API down or unreachable | Structured error returned, specific message shown to user |
| Invalid or expired API token | 401 caught at ingestion, clear re-entry instructions shown |
| Insufficient API scopes | Missing scope identified, exact scope name shown to user |
| Groq returns malformed JSON | Retry once with same prompt, then fall back to deterministic-only output |
| Groq rate limit hit | Wait 2 seconds, retry once |
| No products found in store | Early exit before any LLM call, specific empty-state message shown |
| Network timeout | 15 second timeout on all external fetches, retry button shown on client |
| Unexpected server error | Generic fallback with error logged server-side, user sees clean error state |

The principle throughout is that the system should degrade gracefully. If Groq fails entirely, the merchant still gets their AIR Score and gap flags from the deterministic layer. That is more useful than a blank screen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React + Tailwind CSS |
| Fonts | Syne + DM Sans |
| AI | Groq (Llama 3.3 70B) |
| Data | Shopify Admin GraphQL API |
| Deployment | Vercel (free tier) |

---

## Known Limitations and What I Would Improve

**Point-in-time analysis only.** The tool analyzes the store at the moment of the request. There is no continuous monitoring or alerting when store data changes in ways that affect AI readiness. A v2 webhook-based system that triggers re-analysis on product updates would address this.

**Sampling on large stores.** Stores with hundreds of products are sampled rather than fully analyzed. The sampling strategy is representative but not exhaustive. A paginated background job architecture would allow full catalog analysis without blocking the request.

**Persona simulation is synthetic.** The three buyer personas are constructed from reasonable assumptions about how AI shopping agents evaluate products. They are not trained on empirical data about actual AI agent behavior. Validating personas against real agent outputs would significantly improve accuracy.

**Policy parsing is text-based.** Return, shipping, and warranty policies are parsed from free-text fields. Structured policy schemas would produce more reliable scores in this dimension.

**No authentication layer.** The current build takes the Admin API token directly from the user on each request. A production version would use Shopify OAuth and store credentials securely.

---

*Document version: 1.0 | Kasparro Agentic Commerce Hackathon 2026*
