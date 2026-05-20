import { fetchShopifyData } from "@/lib/shopify";
import { runDeterministicAnalysis } from "@/lib/analyzer";
import { runAIAnalysis } from "@/lib/ai";
import { calculateAIRScore } from "@/lib/scoring";

export async function POST(request) {
  try {
    const { storeUrl, apiToken } = await request.json();
    console.log(
      "Attempting:",
      storeUrl,
      "| Token starts with:",
      apiToken?.slice(0, 10),
    );

    if (!storeUrl || !apiToken) {
      return Response.json(
        {
          error: "MISSING_CREDENTIALS",
          message: "Store URL and API token are required.",
        },
        { status: 400 },
      );
    }

    //Fetch Shopify data
    let shopifyData;
    try {
      shopifyData = await fetchShopifyData(storeUrl, apiToken);
    } catch (err) {
      if (err.message === "INVALID_TOKEN") {
        return Response.json(
          {
            error: "INVALID_TOKEN",
            message:
              "Your API token appears invalid or expired. Please check your Shopify Partner dashboard.",
          },
          { status: 401 },
        );
      }
      if (err.message === "SHOPIFY_UNAVAILABLE") {
        return Response.json(
          {
            error: "SHOPIFY_UNAVAILABLE",
            message:
              "Could not connect to your Shopify store. Please verify the store URL and try again.",
          },
          { status: 503 },
        );
      }
      throw err;
    }

    if (!shopifyData.products || shopifyData.products.length === 0) {
      return Response.json(
        {
          error: "NO_PRODUCTS",
          message:
            "Your store has no products to analyze. Please add products and try again.",
        },
        { status: 400 },
      );
    }

    // Deterministic analysis
    const deterministicResults = runDeterministicAnalysis(shopifyData);

    //ai analysis
    const aiResults = await runAIAnalysis(shopifyData, deterministicResults);

    //Calculate AIR Score
    const airScore = calculateAIRScore(deterministicResults, aiResults);

    return Response.json({
      success: true,
      storeName: shopifyData.storeName,
      productCount: shopifyData.products.length,
      airScore,
      deterministicResults,
      aiResults,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      {
        error: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
