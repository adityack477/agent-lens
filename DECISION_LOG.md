# AgentLens - Decision Log

This log was maintained throughout the build as decisions were made. It reflects how thinking evolved from the first read of the problem statement to the final submission.

---

## Day 1 - Reading the Brief, Finding the Problem

**Chose Track 5 over the other four tracks**

Read through all five tracks carefully before committing. Track 1 (AI Shopping Agent) was the most obvious choice and probably the most common submission. Track 5 stood out because it is the most product-intensive and closest to what Kasparro actually works on day to day. The brief even says it directly: "this track is closest to the problems Kasparro builds on every day." That felt like a signal worth taking seriously.

There was also a personal reason. A few months ago I was given an internship assessment task: build a simple "AI Readiness Audit" page where a user enters a URL and sees a readiness score out of 100, along with a list of issues like missing structured content, weak headings, and no FAQs. Then write a short explanation of it aimed at a technical founder. I built it and submitted it. But what stayed with me afterward was the core reasoning behind the scoring. Why does an AI skip a page? Not because the content is wrong but because it is ambiguous enough that the AI decides not to engage. That exact insight mapped directly onto Track 5. The problem was already familiar. The Shopify context made it more specific and more real.

Chose Track 5.

**Named the product AgentLens**

Considered StoreIQ and SmartStore. StoreIQ sounds like a generic analytics dashboard. SmartStore is closer but puts the emphasis on the merchant seeing themselves, not on AI perception specifically. AgentLens communicates the actual mechanic: a lens through which you see your store the way an AI agent sees it. Kept it.

**Chose electronics as the demo category**

The diagnostic output is only impressive if there are actually gaps to find. Electronics has the highest density of representation problems: impedance, latency, codec support, battery life, compatibility, warranty terms. A clothing store with missing size guides is a thinner demo. Electronics makes every scoring dimension light up. Decided on this within the first hour of thinking about the product.

---

## Day 2 - Writing the Product Document

**Wrote documentation before writing any code**

This was intentional and not just because the hackathon requires it. Writing the product document first forced me to answer questions I would have avoided if I had gone straight to coding. Who exactly is this for? What does the merchant actually need versus what would be technically impressive to build? What am I not building and why? Those answers shaped every implementation decision that came after.

The Kasparro brief is explicit about this being their actual working style: "every feature starts with a product requirement document." Treating this seriously felt like the right approach both for the submission and for demonstrating genuine alignment with how they work.

**Decided to build a diagnostic tool, not an automation tool**

The tempting version of this product auto-fixes content: it rewrites product descriptions, fills in missing specs, generates policy copy. That version has a trust problem. A merchant who does not understand the diagnosis will not trust automated changes to their store content. The right first step is making the problem visible and specific. Remediation is a v2 feature, after the merchant has seen the gap and decided they believe it.

**Decided on three buyer personas instead of one generic agent**

A single generic AI agent flattens the analysis. A budget-conscious buyer cares about price, warranty, and return policy. A spec-driven expert buyer cares about technical completeness and comparability. A casual browser cares about description clarity and trust signals. Each persona surfaces different gap types. Three is enough to cover the meaningful variation without making the output overwhelming.

**Decided to prioritize fixes by revenue impact, not fix effort**

The easy version of a fix engine ranks by how simple each fix is to implement. That is the wrong metric for a merchant. A fix that takes three hours but recovers revenue from products that AI agents are currently skipping is more valuable than a five-minute fix that changes nothing material. Revenue-first ranking is a more honest and more useful product.

---

## Day 3 - Shopify Setup and API Ingestion

**Chose Next.js over a separate React frontend and FastAPI backend**

One repo, one deploy, API keys stay server-side without spinning up a separate server. Vercel handles the full stack from a single repository. For a solo build with a 10-day window, reducing infrastructure complexity was the right call. Next.js API routes give me server-side execution without the overhead of maintaining two codebases.

**Hit first real blocker: Shopify API scopes were more involved than expected**

Setting up the development store and creating a custom app was straightforward. Getting the right API scopes took longer than it should have. The `read_products` scope alone is not sufficient for everything AgentLens needs. Pulling collection data, shop policies, and metafields each require additional scopes that are not obvious from the documentation until you hit a permission error. Ended up needing `read_products`, `read_content`, and `read_shipping` as the minimum viable set. Added a scope validation check early in the ingestion layer so the error message tells the user exactly which scope is missing rather than returning a generic 403.

**Decided to sample products rather than analyze the full catalog**

The naive approach is to pull every product and run the full analysis. On a store with 300 products that is slow, expensive on API calls, and produces more data than is useful. The sampling strategy takes the top 10 products by collection priority, 5 products identified by a lightweight pre-scan as having the most obvious gaps, and 5 random products for coverage. Capped at 20 total. Deep analysis of a representative 20 is more actionable than a shallow pass over 300.

---

## Day 4 - Core Analysis Engine and AI Layer

**Drew a hard boundary between deterministic scoring and LLM reasoning**

This was the most consequential architectural decision in the build. All numerical scoring is handled entirely by deterministic code. The LLM is never asked to produce or influence a number.

The reason is reproducibility. If a merchant runs the analysis twice on the same store and gets different scores, the tool loses credibility immediately. LLM output is non-deterministic by nature. That is fine for language: explanations and recommendations can vary slightly between runs without causing a problem. But scores need to be stable. Drawing this line explicitly, and enforcing it in code, keeps the system auditable.

**Tested Gemini and Groq before committing to either**

Started with Gemini 1.5 Flash because of the free tier and documentation quality. It worked but response times were inconsistent, ranging from 3 seconds to over 10 seconds on the same prompt. Tested Groq with Llama 3.3 70B as an alternative. Groq was consistently faster, inference is essentially instant compared to Gemini, and the output quality on structured JSON prompts was comparable. Switched to Groq. The speed difference matters for a tool where the merchant is waiting on a loading screen.

**Hit second real blocker: getting reliable structured JSON out of the LLM**

The first version of the Groq prompts asked for JSON output but did not enforce a schema. The model would sometimes return valid JSON, sometimes return JSON wrapped in markdown code fences, and occasionally return a mix of prose and JSON that was not parseable at all. Fixed this by specifying the exact expected schema in the prompt, instructing the model to return nothing outside the JSON object, and adding a retry with the same prompt on parse failure. If the retry also fails, the system falls back to deterministic-only output with templated language. This took longer to get right than expected but the fallback behavior is now solid.

**Decided on structured JSON prompts with explicit schema and fallback**

Every Groq call specifies the exact JSON schema expected in the prompt. Parse failure triggers one retry. If that fails, the deterministic scores and gap flags are still returned to the client with templated explanations. Partial results are always better than a failure screen. The merchant still gets their AIR Score even if the language layer is unavailable.

---

## Day 5 - UI, Loading States, and Testing

**Chose progressive disclosure for the results layout**

The first version of the dashboard showed everything at once: score, personas, gaps, and fixes in a single scrollable page. User testing on a friend showed they went straight to the fix list without reading the score or understanding the gaps. That defeats the purpose of the diagnostic. Restructured to score first, then gaps, then fixes. Each section builds on the previous one. This mirrors how a merchant actually needs to process the information: understand severity, then understand causes, then act.

**Chose honest loading states over fake instant results**

The analysis takes 20 to 30 seconds. An earlier version showed a spinner with no feedback. Added an animated progress indicator that describes what is actually happening at each stage: fetching store data, running analysis, generating recommendations. This is slower to build but more trustworthy. A merchant who watches the tool work understands it better and trusts it more than one who sees a result appear instantly with no explanation of how.

**Decided not to build a mobile app or mobile-optimized layout**

Out of scope and not the right surface for this tool. A merchant diagnosing their store's AI readiness is doing it on a desktop, probably alongside their Shopify admin panel. Mobile optimization would have cost a day and added nothing to the core value.

---

## Day 6 - Fixes, Polish, and Submission

**Cut competitor benchmarking from the final build**

The original plan included a section comparing the merchant's AIR Score against a synthetic competitor average. Generating synthetic competitor data that looks credible without real data is harder than it sounds. Fake benchmarks that a merchant cannot verify undermine the credibility of the real scores next to them. Cut it. Three features with genuine depth are better than four features where one is hollow.

**Kept the scope to 20 products for the demo store**

Considered expanding the sample size for the demo to make the output look more comprehensive. Kept it at 20. The demo store is an electronics store with well-constructed gaps. The analysis is specific and detailed at 20 products. Expanding it would not produce better output, just more of it.

**Wrote this decision log from notes kept throughout the build**

Decisions were noted as they were made across the six days. This document is a cleaned and structured version of those notes, not a reconstruction from memory after the fact.

---

*Decision log maintained throughout build | AgentLens | Kasparro Agentic Commerce Hackathon 2026*
