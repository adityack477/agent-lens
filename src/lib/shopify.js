const SHOPIFY_GRAPHQL_QUERY = `
  query GetStoreData {
    shop {
      name
      description
    }

    products(first: 50) {
      edges {
        node {
          id
          title
          description
          descriptionHtml
          productType
          vendor
          tags

          images(first: 3) {
            edges {
              node {
                url
              }
            }
          }

          variants(first: 5) {
            edges {
              node {
                id
                title
                price
                availableForSale
              }
            }
          }

          metafields(first: 10) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

const POLICIES_QUERY = `
  query GetPolicies {
    shop {
      name

      refundPolicy {
        body
        title
      }

      shippingPolicy {
        body
        title
      }

      privacyPolicy {
        body
        title
      }

      termsOfService {
        body
        title
      }
    }
  }
`;

export async function fetchShopifyData(storeUrl, apiToken) {
  // Normalize URL
  let cleanUrl = storeUrl.trim();

  if (!cleanUrl.startsWith("http")) {
    cleanUrl = "https://" + cleanUrl;
  }

  if (cleanUrl.endsWith("/")) {
    cleanUrl = cleanUrl.slice(0, -1);
  }

  const graphqlEndpoint =
    `${cleanUrl}/admin/api/2024-01/graphql.json`;

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": apiToken.trim(),
  };

  // ---------------- PRODUCTS ----------------

  let productsRes;

  try {
    productsRes = await fetchWithTimeout(graphqlEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: SHOPIFY_GRAPHQL_QUERY,
      }),
    });
  } catch (err) {
    throw new Error("SHOPIFY_UNAVAILABLE");
  }

  if (
    productsRes.status === 401 ||
    productsRes.status === 403
  ) {
    throw new Error("INVALID_TOKEN");
  }

  if (!productsRes.ok) {
    throw new Error("SHOPIFY_UNAVAILABLE");
  }

  const productsData = await productsRes.json();

  if (productsData.errors) {
    throw new Error("INVALID_TOKEN");
  }

  // ---------------- POLICIES ----------------

  let policiesData = {};

  try {
    const policiesRes = await fetchWithTimeout(
      graphqlEndpoint,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: POLICIES_QUERY,
        }),
      }
    );

    if (policiesRes.ok) {
      policiesData = await policiesRes.json();
    }
  } catch {
    // policies optional
  }

  // ---------------- FORMAT PRODUCTS ----------------

  const productEdges =
    productsData?.data?.products?.edges || [];

  const products = productEdges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    description: node.description || "",
    productType: node.productType || "",
    vendor: node.vendor || "",
    tags: node.tags || [],

    imageCount: node.images?.edges?.length || 0,

    variants:
      node.variants?.edges?.map(({ node: v }) => ({
        title: v.title,
        price: v.price,
        available: v.availableForSale,
      })) || [],

    metafields:
      node.metafields?.edges?.map(({ node: m }) => ({
        key: m.key,
        value: m.value,
      })) || [],
  }));

  // ---------------- POLICIES ----------------

  const policies = {
    refund:
      policiesData?.data?.shop?.refundPolicy?.body || "",

    shipping:
      policiesData?.data?.shop?.shippingPolicy?.body || "",

    privacy:
      policiesData?.data?.shop?.privacyPolicy?.body || "",

    terms:
      policiesData?.data?.shop?.termsOfService?.body || "",
  };

  // ---------------- SAMPLING ----------------

  const sampledProducts = sampleProducts(products);

  return {
    storeName:
      productsData?.data?.shop?.name || "Your Store",

    products: sampledProducts,

    totalProducts: products.length,

    policies,
  };
}

function sampleProducts(products) {
  if (products.length <= 20) {
    return products;
  }

  const top10 = products.slice(0, 10);

  const rest = products.slice(10);

  // Products with obvious quality gaps
  const gapProducts = rest
    .filter(
      (p) =>
        !p.description ||
        p.description.length < 50 ||
        p.imageCount < 2 ||
        p.variants.some((v) => !v.price)
    )
    .slice(0, 5);

  // Random remaining products
  const remaining = rest.filter(
    (p) => !gapProducts.includes(p)
  );

  const random = remaining
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return [...top10, ...gapProducts, ...random];
}

async function fetchWithTimeout(
  url,
  options,
  timeout = 15000
) {
  const controller = new AbortController();

  const id = setTimeout(
    () => controller.abort(),
    timeout
  );

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(id);
  }
}