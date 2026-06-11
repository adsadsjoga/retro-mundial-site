// ─── SHOPIFY ADMIN API SYNC ───────────────────────────────────────────────────
// Usa App automation token para buscar produtos automaticamente
// GET /api/shopify/sync?action=test
// GET /api/shopify/sync?action=products

const SHOPIFY_DOMAIN = 'shop.retromundial.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

async function adminApiFetch(token, query, variables = {}) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');

  return json.data;
}

const PRODUCTS_QUERY = `
  query {
    products(first: 20) {
      edges {
        node {
          id
          handle
          title
          description
          priceRange {
            minVariantPrice { amount }
          }
          variants(first: 30) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount }
              }
            }
          }
        }
      }
    }
  }
`;

export default async function handler(req, res) {
  const action = req.query.action || 'test';

  try {
    if (action === 'test') {
      return res.status(200).json({
        success: true,
        message: 'Shopify Admin API connected',
        domain: SHOPIFY_DOMAIN,
      });
    }

    if (action === 'products') {
      const data = await adminApiFetch(ADMIN_TOKEN, PRODUCTS_QUERY);
      const products = data.products.edges.map(({ node }) => ({
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description,
        price: node.priceRange.minVariantPrice.amount,
        variants: node.variants.edges.length,
      }));

      return res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Sync error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
