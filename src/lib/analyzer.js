const ELECTRONICS_REQUIRED_SPECS = [
  "battery",
  "bluetooth",
  "wireless",
  "connectivity",
  "frequency",
  "impedance",
  "driver",
  "codec",
  "warranty",
  "water resistant",
  "noise cancel",
  "latency",
  "range",
  "charging",
  "usb",
  "compatibility",
  "weight",
  "dimensions",
];

const VAGUE_MARKETING_WORDS = [
  "amazing",
  "incredible",
  "best",
  "perfect",
  "premium",
  "ultra",
  "superior",
  "ultimate",
  "unbeatable",
  "revolutionary",
  "game-changing",
  "world-class",
  "cutting-edge",
  "next-gen",
  "state-of-the-art",
];

const POLICY_VAGUE_PHRASES = [
  "we'll do our best",
  "as soon as possible",
  "may vary",
  "at our discretion",
  "subject to change",
  "case by case",
  "contact us",
  "we will try",
];

export function runDeterministicAnalysis(shopifyData) {
  const { products = [], policies = {} } = shopifyData || {};

  const productAnalyses = products.map(analyzeProduct);

  const policyAnalysis = analyzePolicy(policies);

  // Aggregate product scores
  const avgTrustability = avg(
    productAnalyses.map((p) => p.trustability)
  );

  const avgInterpretability = avg(
    productAnalyses.map((p) => p.interpretability)
  );

  const avgComparability = avg(
    productAnalyses.map((p) => p.comparability)
  );

  const avgDecisionCompleteness = avg(
    productAnalyses.map((p) => p.decisionCompleteness)
  );

  // Worst products
  const criticalProducts = productAnalyses
    .filter((p) => p.overallScore < 50)
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 5);

  const missingFieldsSummary =
    aggregateMissingFields(productAnalyses);

  return {
    productAnalyses,

    policyAnalysis,

    aggregateScores: {
      trustability: Math.round(avgTrustability),

      interpretability: Math.round(
        avgInterpretability
      ),

      comparability: Math.round(avgComparability),

      decisionCompleteness: Math.round(
        avgDecisionCompleteness
      ),

      policyClarity: policyAnalysis.score,
    },

    criticalProducts,

    missingFieldsSummary,

    stats: {
      totalAnalyzed: products.length,

      productsBelow50: productAnalyses.filter(
        (p) => p.overallScore < 50
      ).length,

      productsBelow70: productAnalyses.filter(
        (p) => p.overallScore < 70
      ).length,

      avgScore: Math.round(
        avg(productAnalyses.map((p) => p.overallScore))
      ),
    },
  };
}

function analyzeProduct(product) {
  const issues = [];
  const strengths = [];

  const description =
    product.description?.toLowerCase() || "";

  const title = product.title || "";

  const productType = product.productType || "";

  const tags = product.tags || [];

  const variants = product.variants || [];

  // ---------------- TRUSTABILITY ----------------

  let trustScore = 100;

  if (!product.vendor?.trim()) {
    trustScore -= 20;

    issues.push({
      field: "vendor",
      impact: "high",
      message:
        "No brand/vendor name - AI agents cannot verify merchant identity",
    });
  }

  if (product.imageCount === 0) {
    trustScore -= 30;

    issues.push({
      field: "images",
      impact: "critical",
      message:
        "No product images - AI agents skip image-less products entirely",
    });
  } else if (product.imageCount === 1) {
    trustScore -= 15;

    issues.push({
      field: "images",
      impact: "medium",
      message:
        "Only 1 image - AI needs multiple angles to confidently recommend",
    });
  } else {
    strengths.push("Multiple product images present");
  }

  const hasWarranty = checkForKeyword(
    description,
    ["warranty", "guarantee", "year", "month"]
  );

  if (!hasWarranty) {
    trustScore -= 20;

    issues.push({
      field: "warranty",
      impact: "high",
      message:
        "No warranty information - trust-sensitive AI agents avoid recommending without warranty clarity",
    });
  } else {
    strengths.push("Warranty information present");
  }

  // Review/rating signal
  const hasReviews = tags.some(
    (t) =>
      t.toLowerCase().includes("review") ||
      t.toLowerCase().includes("rating")
  );

  if (hasReviews) {
    strengths.push("Review/rating metadata present");
  }

  trustScore = clamp(trustScore);

  // ---------------- INTERPRETABILITY ----------------

  let interpretScore = 100;

  const rawDescription =
    product.description || "";

  if (!rawDescription || rawDescription.length < 50) {
    interpretScore -= 40;

    issues.push({
      field: "description",
      impact: "critical",
      message:
        "Description too short or missing - AI cannot understand what this product does",
    });
  } else if (rawDescription.length < 150) {
    interpretScore -= 20;

    issues.push({
      field: "description",
      impact: "high",
      message:
        "Description is thin - AI needs more detail to confidently characterize this product",
    });
  } else {
    strengths.push("Adequate description length");
  }

  const vagueWordCount =
    VAGUE_MARKETING_WORDS.filter((w) =>
      description.includes(w)
    ).length;

  if (vagueWordCount >= 3) {
    interpretScore -= 20;

    issues.push({
      field: "marketing_language",
      impact: "medium",
      message: `${vagueWordCount} vague marketing words detected - AI cannot interpret subjective claims as product facts`,
    });
  }

  const titleLength = title.length;

  if (titleLength < 10) {
    interpretScore -= 20;

    issues.push({
      field: "title",
      impact: "high",
      message:
        "Product title too vague - AI uses title as primary product identifier",
    });
  } else if (titleLength > 100) {
    interpretScore -= 10;

    issues.push({
      field: "title",
      impact: "low",
      message:
        "Product title very long - AI agents truncate long titles during comparison",
    });
  }

  interpretScore = clamp(interpretScore);

  // ---------------- COMPARABILITY ----------------

  let compareScore = 100;

  const missingSpecs = [];

  const electronicKeywords = [
    "headphone",
    "earphone",
    "speaker",
    "phone",
    "laptop",
    "tablet",
    "watch",
    "camera",
    "audio",
    "wireless",
    "bluetooth",
    "charger",
    "cable",
    "headset",
    "earbuds",
  ];

  const isElectronics = electronicKeywords.some(
    (k) =>
      title.toLowerCase().includes(k) ||
      productType.toLowerCase().includes(k) ||
      description.includes(k)
  );

  if (isElectronics) {
    const criticalSpecs = [
      "battery",
      "connectivity",
      "warranty",
      "compatibility",
      "weight",
    ];

    criticalSpecs.forEach((spec) => {
      if (!description.includes(spec)) {
        compareScore -= 12;
        missingSpecs.push(spec);
      }
    });

    if (missingSpecs.length > 0) {
      issues.push({
        field: "specifications",

        impact:
          missingSpecs.length >= 3
            ? "critical"
            : "high",

        message: `Missing key specs: ${missingSpecs.join(
          ", "
        )} - spec-comparison AI agents cannot rank this product against competitors`,

        missingSpecs,
      });
    }

    // Bonus for detailed specs
    const matchedSpecs =
      ELECTRONICS_REQUIRED_SPECS.filter((spec) =>
        description.includes(spec)
      );

    if (matchedSpecs.length >= 5) {
      strengths.push(
        "Rich technical specifications provided"
      );
    }
  }

  compareScore = clamp(compareScore);

  // ---------------- DECISION COMPLETENESS ----------------

  let decisionScore = 100;

  const hasPrice = variants.some(
    (v) =>
      v.price &&
      !isNaN(parseFloat(v.price)) &&
      parseFloat(v.price) > 0
  );

  if (!hasPrice) {
    decisionScore -= 30;

    issues.push({
      field: "price",
      impact: "critical",
      message:
        "No price set - AI cannot include unpriced products in purchase recommendations",
    });
  }

  const hasAvailability = variants.some(
    (v) => v.available
  );

  if (!hasAvailability) {
    decisionScore -= 20;

    issues.push({
      field: "availability",
      impact: "high",
      message:
        "No variants marked available - AI agents avoid recommending out-of-stock products",
    });
  }

  if (!productType?.trim()) {
    decisionScore -= 15;

    issues.push({
      field: "product_type",
      impact: "medium",
      message:
        "No product type set - AI cannot categorize this product for filtered queries",
    });
  }

  decisionScore = clamp(decisionScore);

  // ---------------- OVERALL ----------------

  const overallScore = Math.round(
    trustScore * 0.25 +
      interpretScore * 0.25 +
      compareScore * 0.25 +
      decisionScore * 0.25
  );

  return {
    productId: product.id,

    title,

    trustability: trustScore,

    interpretability: interpretScore,

    comparability: compareScore,

    decisionCompleteness: decisionScore,

    overallScore,

    issues,

    strengths,

    missingSpecs,

    isElectronics,
  };
}

function analyzePolicy(policies = {}) {
  let score = 100;

  const issues = [];
  const strengths = [];

  const refund =
    policies.refund?.toLowerCase() || "";

  const shipping =
    policies.shipping?.toLowerCase() || "";

  // ---------------- REFUND POLICY ----------------

  if (!refund || refund.length < 50) {
    score -= 30;

    issues.push({
      field: "refund_policy",
      impact: "critical",
      message:
        "Return policy missing or too vague - trust-sensitive AI agents require clear return windows",
    });
  } else {
    const hasReturnWindow =
      /\d+\s*(day|days|week|weeks|month|months)/i.test(
        refund
      );

    if (!hasReturnWindow) {
      score -= 20;

      issues.push({
        field: "return_window",
        impact: "high",
        message:
          "Return window not explicitly stated in days/weeks - AI cannot communicate return terms to buyers",
      });
    } else {
      strengths.push("Explicit return window found");
    }

    const vagueCount =
      POLICY_VAGUE_PHRASES.filter((p) =>
        refund.includes(p)
      ).length;

    if (vagueCount > 0) {
      score -= 10 * vagueCount;

      issues.push({
        field: "policy_language",
        impact: "medium",
        message: `${vagueCount} vague phrases in return policy - AI avoids interpreting ambiguous policies`,
      });
    }
  }

  // ---------------- SHIPPING POLICY ----------------

  if (!shipping || shipping.length < 50) {
    score -= 25;

    issues.push({
      field: "shipping_policy",
      impact: "high",
      message:
        "Shipping policy missing - delivery timelines are required for AI purchase recommendations",
    });
  } else {
    const hasDeliveryTime =
      /\d+\s*(day|days|week|weeks|business)/i.test(
        shipping
      );

    if (!hasDeliveryTime) {
      score -= 15;

      issues.push({
        field: "delivery_timeline",
        impact: "high",
        message:
          'Delivery timeframe not explicit - AI cannot answer "when will it arrive" queries',
      });
    } else {
      strengths.push(
        "Explicit delivery timeline found"
      );
    }
  }

  score = clamp(score);

  return {
    score: Math.round(score),
    issues,
    strengths,
  };
}

function aggregateMissingFields(productAnalyses) {
  const fieldCounts = {};

  productAnalyses.forEach((product) => {
    product.issues.forEach((issue) => {
      fieldCounts[issue.field] =
        (fieldCounts[issue.field] || 0) + 1;
    });
  });

  return Object.entries(fieldCounts)
    .map(([field, count]) => ({
      field,

      count,

      percentage: Math.round(
        (count / productAnalyses.length) * 100
      ),
    }))
    .sort((a, b) => b.count - a.count);
}

function checkForKeyword(text, keywords) {
  if (!text) return false;

  const lower = text.toLowerCase();

  return keywords.some((k) =>
    lower.includes(k.toLowerCase())
  );
}

function avg(arr) {
  if (!arr?.length) return 0;

  return (
    arr.reduce((sum, value) => sum + value, 0) /
    arr.length
  );
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}