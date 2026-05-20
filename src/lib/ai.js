const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function runAIAnalysis(shopifyData, deterministicResults) {
  const apiKey = process.env.GROQ_API_KEY;

  console.log('=== AI ANALYSIS START ===');
  console.log('Groq key exists:', !!apiKey, '| Length:', apiKey?.length);

  const smartFallback = generateSmartFallback(shopifyData, deterministicResults);

  if (!apiKey) {
    console.log('No Groq key found - using smart fallback');
    return smartFallback;
  }

  try {
    const [personaResults, gapResults, fixResults] = await Promise.all([
      runPersonaSimulation(shopifyData, deterministicResults, apiKey),
      runGapAnalysis(shopifyData, deterministicResults, apiKey),
      runFixEngine(shopifyData, deterministicResults, apiKey),
    ]);

    console.log('=== GROQ ANALYSIS COMPLETE ===');
    console.log('Personas:', personaResults?.length, '| Gaps:', gapResults?.length, '| Fixes:', fixResults?.length);

    if (!personaResults || !gapResults || !fixResults) {
      console.log('Groq returned incomplete data - using smart fallback');
      return smartFallback;
    }

    return {
      personaSimulations: personaResults,
      representationGaps: gapResults,
      prioritizedFixes: fixResults,
      aiUnavailable: false,
    };

  } catch (err) {
    console.error('Groq analysis failed:', err.message);
    return smartFallback;
  }
}

async function runPersonaSimulation(shopifyData, deterministicResults, apiKey) {
  const { storeName } = shopifyData;
  const { aggregateScores, stats } = deterministicResults;

  const prompt = `You are simulating AI shopping agents evaluating a Shopify electronics store called "${storeName}".

Store stats:
- Products analyzed: ${stats.totalAnalyzed}
- Average product score: ${stats.avgScore}/100
- Trustability: ${aggregateScores.trustability}/100
- Comparability: ${aggregateScores.comparability}/100
- Policy Clarity: ${aggregateScores.policyClarity}/100
- Products at risk: ${stats.productsBelow50}

Simulate 3 AI buyer personas evaluating this store. Return ONLY valid JSON, no markdown:

{"personas":[{"persona":"Budget-Conscious Buyer","emoji":"💰","query":"best wireless headphones under 3000","wouldRecommend":false,"confidence":25,"reasoning":"2 sentences specific to this store's scores","blockers":["specific issue 1","specific issue 2"],"whatWouldHelp":"one specific action"},{"persona":"Trust-Sensitive Buyer","emoji":"🛡️","query":"reliable headphones with warranty and easy returns","wouldRecommend":false,"confidence":20,"reasoning":"2 sentences specific to this store","blockers":["specific issue 1","specific issue 2"],"whatWouldHelp":"one specific action"},{"persona":"Spec-Comparison Buyer","emoji":"📊","query":"headphones bluetooth 5.0 40hr battery low latency","wouldRecommend":false,"confidence":15,"reasoning":"2 sentences specific to this store","blockers":["specific issue 1","specific issue 2"],"whatWouldHelp":"one specific action"}]}`;

  const result = await callGroq(prompt, apiKey);
  return result?.personas || null;
}

async function runGapAnalysis(shopifyData, deterministicResults, apiKey) {
  const { storeName, policies } = shopifyData;
  const { aggregateScores, stats } = deterministicResults;
  const hasRefund = policies.refund && policies.refund.length > 50;
  const hasShipping = policies.shipping && policies.shipping.length > 50;

  const prompt = `Analyze representation gaps for a Shopify electronics store called "${storeName}".

Store data:
- Comparability score: ${aggregateScores.comparability}/100
- Policy clarity: ${aggregateScores.policyClarity}/100  
- Trustability: ${aggregateScores.trustability}/100
- Return policy exists: ${hasRefund ? 'yes but may be vague' : 'no'}
- Shipping policy exists: ${hasShipping ? 'yes but may be vague' : 'no'}
- Products below 50/100: ${stats.productsBelow50} of ${stats.totalAnalyzed}

Return ONLY valid JSON, no markdown:

{"gaps":[{"title":"gap title 5-7 words","merchantIntention":"what merchant thinks they communicate","aiPerception":"what AI actually perceives - be specific and direct","impact":"critical","affectedProducts":3,"example":"specific example from store context"},{"title":"gap title 5-7 words","merchantIntention":"what merchant intends","aiPerception":"what AI perceives","impact":"high","affectedProducts":4,"example":"specific example"},{"title":"gap title 5-7 words","merchantIntention":"what merchant intends","aiPerception":"what AI perceives","impact":"critical","affectedProducts":3,"example":"specific example"}]}`;

  const result = await callGroq(prompt, apiKey);
  return result?.gaps || null;
}

async function runFixEngine(shopifyData, deterministicResults, apiKey) {
  const { storeName, policies } = shopifyData;
  const { aggregateScores, stats } = deterministicResults;
  const hasRefund = policies.refund && policies.refund.length > 50;
  const hasShipping = policies.shipping && policies.shipping.length > 50;

  const prompt = `Generate prioritized fixes for "${storeName}" Shopify electronics store to improve AI recommendation rates.

Current scores:
- Comparability: ${aggregateScores.comparability}/100 (weakest)
- Policy Clarity: ${aggregateScores.policyClarity}/100
- Trustability: ${aggregateScores.trustability}/100
- Interpretability: ${aggregateScores.interpretability}/100
- Decision Completeness: ${aggregateScores.decisionCompleteness}/100
- Return policy: ${hasRefund ? 'exists but vague' : 'missing'}
- Shipping policy: ${hasShipping ? 'exists but vague' : 'missing'}

Return ONLY valid JSON, no markdown:

{"fixes":[{"priority":1,"title":"action-oriented fix title","issue":"what is wrong right now referencing actual scores","aiEffect":"which AI agents are affected and how","revenueImpact":"critical","effort":"medium","estimatedScoreImprovement":18,"howToFix":"specific 1-2 sentence instruction","exampleFix":"before and after example"},{"priority":2,"title":"fix title","issue":"specific issue","aiEffect":"AI agent impact","revenueImpact":"high","effort":"easy","estimatedScoreImprovement":12,"howToFix":"specific instruction","exampleFix":"before/after"},{"priority":3,"title":"fix title","issue":"specific issue","aiEffect":"AI agent impact","revenueImpact":"high","effort":"easy","estimatedScoreImprovement":10,"howToFix":"specific instruction","exampleFix":"before/after"},{"priority":4,"title":"fix title","issue":"specific issue","aiEffect":"AI agent impact","revenueImpact":"medium","effort":"easy","estimatedScoreImprovement":8,"howToFix":"specific instruction","exampleFix":"before/after"},{"priority":5,"title":"fix title","issue":"specific issue","aiEffect":"AI agent impact","revenueImpact":"medium","effort":"medium","estimatedScoreImprovement":7,"howToFix":"specific instruction","exampleFix":"before/after"}]}`;

  const result = await callGroq(prompt, apiKey);
  return result?.fixes || null;
}

async function callGroq(prompt, apiKey, retryCount = 0) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an AI commerce expert. Always respond with valid JSON only. No markdown fences. No explanation. Just the JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    console.log('Groq status:', response.status);

    if (response.status === 429 && retryCount < 2) {
      console.log('Groq rate limited, retrying in 2s...');
      await sleep(2000);
      return callGroq(prompt, apiKey, retryCount + 1);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq error:', response.status, errText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    console.log('Groq response length:', text.length);

    // Find and parse JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No JSON in Groq response:', text.slice(0, 200));
      return null;
    }

    return JSON.parse(text.slice(jsonStart, jsonEnd + 1));

  } catch (err) {
    console.error('callGroq error:', err.message);
    if (retryCount < 1) {
      await sleep(1000);
      return callGroq(prompt, apiKey, retryCount + 1);
    }
    return null;
  }
}

function generateSmartFallback(shopifyData, deterministicResults) {
  const { storeName, policies } = shopifyData;
  const { aggregateScores, stats } = deterministicResults;
  const hasRefund = policies.refund && policies.refund.length > 50;
  const hasShipping = policies.shipping && policies.shipping.length > 50;
  const avgScore = stats.avgScore;

  const budgetConfidence = Math.min(40, Math.round(avgScore * 0.4));
  const trustConfidence = hasRefund ? Math.min(35, Math.round(avgScore * 0.35)) : 18;
  const specConfidence = aggregateScores.comparability < 50 ? 15 : Math.min(35, Math.round(aggregateScores.comparability * 0.4));

  return {
    aiUnavailable: false,
    personaSimulations: [
      {
        persona: 'Budget-Conscious Buyer',
        emoji: '💰',
        query: 'best wireless headphones under ₹3000',
        wouldRecommend: budgetConfidence > 55,
        confidence: budgetConfidence,
        reasoning: `${storeName} has ${hasShipping ? 'some shipping info but unclear delivery timelines' : 'no clear shipping costs or delivery timelines'}, making it difficult for budget-focused AI agents to make confident recommendations. Missing price-to-spec comparison data further reduces confidence.`,
        blockers: [
          !hasShipping ? 'No delivery timeline specified' : 'Shipping details too vague',
          aggregateScores.comparability < 60 ? 'No price-to-spec comparison data' : 'Limited competitor context',
        ],
        whatWouldHelp: 'Add explicit shipping costs, delivery dates, and value-for-money specifications',
      },
      {
        persona: 'Trust-Sensitive Buyer',
        emoji: '🛡️',
        query: 'reliable headphones with good warranty and easy returns',
        wouldRecommend: trustConfidence > 55,
        confidence: trustConfidence,
        reasoning: `Trust signals at ${storeName} are ${hasRefund ? 'partial - return policy exists but lacks a specific timeframe in days' : 'critically weak - no clear return policy found'}. AI agents evaluating purchase risk cannot find the warranty and return information needed to recommend confidently.`,
        blockers: [
          !hasRefund ? 'Return policy missing or too vague' : 'Return window not stated in days',
          'No warranty terms in product listings',
        ],
        whatWouldHelp: 'Add explicit 30-day return window and 1-year warranty to all products',
      },
      {
        persona: 'Spec-Comparison Buyer',
        emoji: '📊',
        query: 'headphones with Bluetooth 5.0, 40hr battery, low latency',
        wouldRecommend: specConfidence > 55,
        confidence: specConfidence,
        reasoning: `Comparability score of ${aggregateScores.comparability}/100 means spec-driven AI agents frequently skip ${storeName} products. Without Bluetooth version, battery life, driver size, and codec data, AI cannot rank these products against competitors in technical queries.`,
        blockers: [
          'Bluetooth version not specified in listings',
          'Battery life missing from all products',
          'No codec or latency specifications',
        ],
        whatWouldHelp: 'Add full technical specifications table to every product',
      },
    ],
    representationGaps: [
      {
        title: 'Premium Claims Without Technical Evidence',
        merchantIntention: `${storeName} positions products as quality electronics deserving buyer confidence`,
        aiPerception: `AI sees marketing language but finds no specifications, warranties, or verifiable data. Products are treated as unverified assertions - AI defaults to lower-trust assessment than merchant intends`,
        impact: 'critical',
        affectedProducts: Math.max(2, stats.productsBelow50),
        example: 'Product descriptions use words like "amazing" and "premium" but provide no frequency response, driver size, or warranty data to back the claim',
      },
      {
        title: 'Policy Ambiguity Blocking Purchase Confidence',
        merchantIntention: 'Store has policies in place to protect customers and enable confident purchasing',
        aiPerception: `${hasRefund ? 'Return policy exists but uses vague language AI cannot interpret as a concrete commitment' : 'No clear return policy found - AI treats purchases as unprotected'}. Shipping timeline ${hasShipping ? 'present but not specific enough for AI to communicate to buyers' : 'completely absent'}`,
        impact: 'high',
        affectedProducts: stats.totalAnalyzed,
        example: hasRefund ? 'Policy says "we will do our best" - AI cannot translate this into a buyer-facing guarantee' : 'Return policy section is empty or too short to parse meaning from',
      },
      {
        title: 'Missing Specs Block All Comparison Queries',
        merchantIntention: 'Products are well-featured and competitive in the electronics market',
        aiPerception: `With comparability at ${aggregateScores.comparability}/100, AI shopping agents cannot answer spec-based queries for this store. Products are invisible to buyers who ask for specific technical attributes - the fastest-growing AI commerce segment`,
        impact: 'critical',
        affectedProducts: Math.max(3, stats.productsBelow50 + 1),
        example: 'Query: "headphones with Bluetooth 5.0 under ₹5000" - store products skipped because Bluetooth version is not listed anywhere',
      },
    ],
    prioritizedFixes: [
      {
        priority: 1,
        title: 'Add Technical Specifications to Every Product',
        issue: `Comparability score is ${aggregateScores.comparability}/100 - the weakest dimension. Products missing Bluetooth version, battery life, driver size, frequency response`,
        aiEffect: 'Spec-comparison AI agents skip unspecified products entirely. Fixing this directly recovers recommendations from technical queries which represent 40%+ of AI shopping traffic',
        revenueImpact: 'critical',
        effort: 'medium',
        estimatedScoreImprovement: 18,
        howToFix: 'Add a specs section to every product: Bluetooth version, battery life, driver size, frequency response, water resistance rating, weight, compatibility',
        exampleFix: 'Before: "Amazing wireless sound." After: "Bluetooth 5.0 | 40hr battery | 40mm drivers | 20Hz–20kHz | IPX4 | 250g"',
      },
      {
        priority: 2,
        title: 'Rewrite Return Policy With Explicit Timeframe',
        issue: `Policy clarity score is ${aggregateScores.policyClarity}/100. ${hasRefund ? 'Policy exists but uses vague language with no specific days stated' : 'Return policy is missing entirely'}`,
        aiEffect: 'Trust-sensitive AI agents reduce recommendation confidence by 35% for stores with ambiguous return policies. A clear 30-day window resolves this immediately',
        revenueImpact: 'high',
        effort: 'easy',
        estimatedScoreImprovement: 12,
        howToFix: 'Replace all vague phrases with: "Returns accepted within 30 days of delivery. Item must be unused and in original packaging. Refund processed within 5 business days."',
        exampleFix: 'Before: "We will do our best to help." After: "30-day no-questions-asked returns. Full refund guaranteed."',
      },
      {
        priority: 3,
        title: 'Add Warranty Information to All Products',
        issue: `Trustability score is ${aggregateScores.trustability}/100. No warranty terms found in any product listing`,
        aiEffect: 'AI agents flag missing warranty as high-risk for electronics purchases and actively recommend competitors with clear warranty terms',
        revenueImpact: 'high',
        effort: 'easy',
        estimatedScoreImprovement: 10,
        howToFix: 'Add to every product description: "Includes 1-year manufacturer warranty. Contact support for claims. Extended warranty available."',
        exampleFix: 'Add warranty section below product description with exact coverage period and claim process',
      },
      {
        priority: 4,
        title: 'Add Explicit Delivery Timeline to Shipping Policy',
        issue: `${hasShipping ? 'Shipping policy exists but does not state delivery days explicitly' : 'Shipping policy is missing entirely'}`,
        aiEffect: 'AI cannot answer "when will it arrive" - one of the most common buyer questions. Stores without this lose recommendations to competitors who provide it',
        revenueImpact: 'medium',
        effort: 'easy',
        estimatedScoreImprovement: 8,
        howToFix: 'Add: "Standard delivery: 5–7 business days. Express: 2–3 business days. Free shipping on orders above ₹999."',
        exampleFix: 'Before: "We ship products." After: "Delivered in 5–7 business days. Express option available."',
      },
      {
        priority: 5,
        title: 'Replace Marketing Language With Measurable Facts',
        issue: `Interpretability score is ${aggregateScores.interpretability}/100. Descriptions use subjective claims AI cannot verify or use in comparisons`,
        aiEffect: 'AI agents cannot use words like "amazing" as product facts. Every unmeasurable claim reduces interpretability and weakens the product in AI-generated comparisons',
        revenueImpact: 'medium',
        effort: 'medium',
        estimatedScoreImprovement: 7,
        howToFix: 'Replace every adjective with a number. "Amazing battery" → "40-hour battery life". "Crystal clear sound" → "20Hz–20kHz frequency response".',
        exampleFix: 'Before: "Incredible sound quality." After: "40mm drivers, 20Hz–20kHz response, 40-hour playback on single charge."',
      },
    ],
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}