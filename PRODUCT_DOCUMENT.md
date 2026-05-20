# AgentLens - Product Document

**Track 5: AI Representation Optimizer**
**Hackathon: Kasparro Agentic Commerce Hackathon 2026**

---

## The Problem

Shopify merchants are becoming invisible. Not because their products are bad, but because AI shopping agents cannot confidently understand or recommend their stores.

The shift in how people shop is already here. In 2025, ChatGPT started completing purchases inside conversations. Google AI Mode began recommending products directly in search results. Shopify launched its Agentic Plan to connect merchant catalogs to AI shopping channels. Shopping is no longer browse-and-search. It is ask-and-decide.

This became real to me during an internship assessment I was given last year. The task was straightforward: build a simple "AI Readiness Audit" page where a user enters any website URL and sees a mock readiness score out of 100, along with a short list of issues like missing structured content, no FAQs, or weak headings. Then write a 300-500 word explanation of that tool aimed at a technical founder.

I built it, deployed it, and wrote the explanation. But what stuck with me was the reasoning behind the scoring. Why would an AI skip a page? Not because the content was wrong, but because it was incomplete, ambiguous, or contradictory enough that the AI chose not to engage with it at all. That insight was the seed for AgentLens.

The specific problem AgentLens addresses is this: when a user asks an AI shopping agent "best wireless headphones under Rs. 5000 with low latency," the agent reasons over store data in milliseconds and either recommends a product or silently skips it. There is no error message for the merchant. No bounce rate. No signal of any kind. Just invisible lost revenue.

The core behavior driving this is that AI agents avoid uncertainty. Vague product descriptions, missing specifications, ambiguous return policies, and contradictory information all create enough uncertainty that the agent skips the product rather than risk a bad recommendation. The merchant has no way of knowing this is happening, let alone which products are affected or why.

The "AI Readiness Audit" I built during that assessment was a proof of concept for a generic website. AgentLens applies the same diagnostic logic to where it matters most right now: Shopify stores operating in an AI-mediated commerce environment.

---

## Who This Is For

**Primary user: Shopify merchant (small to mid-size)**

Current experience:
- Runs a Shopify store with 20 to 500 products
- Notices inconsistent sales without understanding why
- Has no insight into how AI shopping tools perceive their store
- Cannot tell which products are being skipped by AI agents or what is causing it

What they actually need:
- A diagnostic that tells them exactly how AI agents see their store
- A concrete, prioritized fix list ranked by revenue impact
- A clear explanation of why each issue causes AI agents to skip their products

---

## What I Decided to Build

**AgentLens** is a merchant-facing AI diagnostics platform that does four things:

1. Ingests a Shopify store via the Admin API
2. Generates an AIR Score (AI Recommendation Readiness) across 5 dimensions
3. Simulates how three different AI buyer personas would evaluate the store
4. Produces a Representation Gap Analysis and a Revenue-Prioritized Fix Engine

The AIR Score is a weighted composite across product description quality, specification completeness, policy clarity, trust signals, and structured data availability. Each dimension is scored deterministically from the raw store data. The LLM layer then explains what those scores mean in plain language and generates persona-specific recommendations.

The Representation Gap Analysis is the core differentiator. It compares what the merchant intends to communicate with what an AI agent actually perceives from the available data. That gap, made visible and specific, is what turns a diagnostic into something a merchant can act on.

---

## Key Product Decisions

**Decision 1: Diagnostic tool, not automation**

The decision was to surface insights rather than auto-fix content. Merchants need to understand and trust the diagnosis before acting on it. Autonomous remediation that a merchant does not review can create new problems while appearing to solve old ones.

**Decision 2: Deterministic scoring with LLM reasoning on top**

All numerical scoring is handled by deterministic code. Field validation, completeness checks, and contradiction detection produce scores that are reproducible and auditable. The LLM handles perception simulation, gap explanations, and fix recommendations. This boundary is intentional. If a score changes between runs without a data change, the system loses credibility.

**Decision 3: Three buyer personas, not one**

A single generic agent misses category-specific failure modes. A budget-conscious buyer asking about warranty has different informational needs than an expert buyer comparing specifications. Three personas surface different gap types and give the merchant a more complete picture of how AI agents evaluate their store.

**Decision 4: Electronics as the demo category**

Electronics has the highest density of representation problems. Missing specs, vague descriptions, absent warranty information, and no compatibility details are common. It is the category where AI agents are most likely to skip products, and where the fix is most clearly tied to specific missing fields.

**Decision 5: Prioritize fixes by revenue impact, not fix effort**

Merchants care about money first. A fix that takes three hours but recovers significant revenue from skipped products is more valuable than an easy fix that has marginal impact. The Fix Engine ranks actions by estimated revenue impact, not convenience.

---

## What I Chose Not to Build

**Full autonomous remediation.** This is a planned v2 feature. The trust problem needs to be solved first. A merchant needs to understand what the AI perceives before they will accept automated changes to their product content.

**Real competitor benchmarking.** Meaningful benchmarking requires data partnerships or large-scale data collection. Neither is feasible within the hackathon scope, and a fake benchmark would undermine the credibility of the tool.

**Browser automation or scraping.** Fragile, unnecessary given the Admin API, and difficult to maintain.

**Mobile app.** Out of scope for this version.

---

## Tradeoffs

**Depth over breadth.** AgentLens analyzes 20 products deeply rather than 500 shallowly. Specific, actionable advice for a focused set of products is more useful to a merchant than a generic scan across an entire catalog.

**Honest loading over false speed.** The analysis takes 20 to 30 seconds. The UI shows an honest, animated progress indicator that explains what is happening rather than showing fake instant results. This is a deliberate trust decision.

**Progressive disclosure.** The results are structured as score first, then gaps, then fixes. This mirrors how a merchant actually makes decisions: first understand the severity, then understand the causes, then act. Presenting everything at once creates cognitive overload.

---

*Document version: 1.0 | Kasparro Agentic Commerce Hackathon 2026*
