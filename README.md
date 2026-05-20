# AgentLens 🔍
### AI Representation Optimizer for Shopify

> **"AgentLens helps Shopify merchants understand, measure, and optimize how AI shopping agents perceive and recommend their stores."**

**Track 5 (Advanced): AI Representation Optimizer - Kasparro Agentic Commerce Hackathon 2026**

---

## What It Does

AgentLens is a merchant-facing diagnostic platform that answers one question: **Why are AI shopping agents skipping your products?**

It generates:
- **AIR Score** (AI Recommendation Readiness) - a weighted score across 5 dimensions
- **Buyer Persona Simulation** - how 3 different AI shopping agents evaluate your store
- **Representation Gap Analysis** - what you intend to communicate vs. what AI actually perceives
- **Revenue-Prioritized Fix Engine** - ranked action list by estimated business impact

---

## Problem Statement

AI-mediated commerce is replacing browse-first shopping. When a user asks an AI "best wireless headphones under ₹5000," an AI agent scans store data and either recommends or silently skips. Merchants have no visibility into this. **AI agents avoid uncertainty** - missing specs, vague policies, and incomplete data cause stores to be skipped without any signal to the merchant.

---

## Demo Video

Link: https://drive.google.com/file/d/1EMGimZ5qlFtN2uEi3PvkTbsbKhxyemZI/view?usp=drive_link

---

## Live Link

Link: 

---

## Setup Instructions

### Prerequisites
- Node.js 18+ (download at nodejs.org)
- A Shopify Partner account with a development store
- A Groq (Llama 3.3 70B) API key 

### Step 1: Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/agentlens.git
cd agentlens
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Set up environment variables
```bash
cp .env.example .env.local
```
Open `.env.local` and add your Gemini API key:
```
GROQ_API_KEY=your_key_here
```

### Step 4: Run locally
```bash
npm run dev
```
Open http://localhost:3000

### Step 5: Use the app
1. Enter your Shopify development store URL (e.g. `mystore.myshopify.com`)
2. Enter your Admin API access token (from Shopify Partner Dashboard → Apps → API credentials)
3. Click "Analyze My Store"
4. Wait ~20-30 seconds for the full analysis

### Setting up Shopify (if needed)
1. Go to partners.shopify.com → create free account
2. Stores → Add store → Development store
3. Inside your store: Settings → Apps → Develop apps → Enable
4. Create app → Configure → Enable scopes: `read_products`, `read_content`, `read_shipping`
5. Install app → copy the Admin API access token

---

## Architecture

```
Next.js App (single repo)
├── src/app/
│   ├── page.js              # Main page, state machine
│   ├── layout.js            # Root layout, fonts
│   └── api/analyze/route.js # Server-side API handler
├── src/lib/
│   ├── shopify.js           # Shopify GraphQL ingestion
│   ├── analyzer.js          # Deterministic analysis engine
│   ├── ai.js                # Groq AI reasoning layer
│   └── scoring.js           # AIR Score calculation
└── src/components/
    ├── InputForm.js         # Store URL + token input
    ├── LoadingState.js      # Animated progress indicator
    ├── Dashboard.js         # Results container
    ├── AIRScorePanel.js     # Score ring + dimension bars
    ├── PersonaPanel.js      # 3 AI buyer persona cards
    ├── GapPanel.js          # Representation gap analysis
    └── FixPanel.js          # Prioritized fix engine
```

**Key architectural decision:** Deterministic code handles all numerical scoring (field validation, completeness checks, contradiction detection). Groq handles language (perception simulation, gap explanations, fix recommendations). This boundary keeps scores reproducible and auditable.

---

## Judging Criteria Mapping

| Criterion | How AgentLens addresses it |
|---|---|
| Product Thinking (25%) | Sharp problem framing, explicit scope decisions, revenue-first prioritization |
| Technical Execution (25%) | Clean AI/deterministic boundary, structured failure handling, typed API routes |
| Product Experience (20%) | Progressive disclosure UX, honest loading states, specific actionable output |
| Business Relevance (15%) | Directly addresses merchant revenue loss from AI invisibility |
| Originality (15%) | Representation gap analysis + persona simulation - not built anywhere else |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React + Tailwind CSS
- **AI:** Groq (Llama 3.3 70B)
- **Data:** Shopify Admin GraphQL API
- **Fonts:** Syne + DM Sans

---

## Submission Info

- **Participant:** Solo
- **Track:** 5 - AI Representation Optimizer
- **Time split:** ~40% product thinking + documentation, ~60% implementation
- **AI tools used:** Claude (code assistance) - all architectural decisions, scope choices, and documentation reflect genuine understanding of the problem

---

## Documents

- [Product Document](./PRODUCT_DOCUMENT.md)
- [Technical Document](./TECHNICAL_DOCUMENT.md)
- [Decision Log](./DECISION_LOG.md)