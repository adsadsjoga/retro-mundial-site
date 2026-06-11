// ─── TESTE DE CONEXÃO SHOPIFY ────────────────────────────────────────────────
// GET /api/shopify/test
// Verifica se o token está funcionando e retorna info dos produtos

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const domain = process.env.VITE_SHOPIFY_DOMAIN || 'shop.retromundial.com';
  const token = process.env.VITE_SHOPIFY_TOKEN;

  if (!token) {
    return res.status(400).json({ error: 'VITE_SHOPIFY_TOKEN não configurado em .env' });
  }

  try {
    const query = `{
      products(first: 3) {
        edges {
          node {
            id
            handle
            title
            description
          }
        }
      }
    }`;

    const response = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      return res.status(401).json({
        success: false,
        error: data.errors[0]?.message || 'Erro na API',
        detail: 'Token inválido ou expirado. Verifique em Shopify Admin → Settings → Apps → Storefront API',
      });
    }

    const products = data.data.products.edges.map(e => ({
      id: e.node.id,
      handle: e.node.handle,
      title: e.node.title,
    }));

    return res.status(200).json({
      success: true,
      domain,
      productsFound: products.length,
      sampleProducts: products,
      message: '✅ Token funcionando! Shopify está acessível.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      domain,
      token: token ? `${token.substring(0, 20)}...` : 'não configurado',
    });
  }
}
