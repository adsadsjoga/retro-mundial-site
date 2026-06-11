// ─── SHOPIFY STOREFRONT API ───────────────────────────────────────────────────
// Quando token configurado, puxa produtos reais do Shopify.
// Fallback: usa produtos do config local.

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          images(first: 10) {
            edges { node { url altText } }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 30) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
                image { url altText }
              }
            }
          }
        }
      }
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation cartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  image { url }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

async function shopifyFetch(domain, token, query, variables = {}) {
  const url = `https://${domain}/api/2024-01/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// Busca produtos do Shopify e converte para o formato interno
export async function fetchShopifyProducts(domain, token) {
  const data = await shopifyFetch(domain, token, PRODUCTS_QUERY, { first: 20 });
  return data.products.edges.map(({ node }) => {
    const price = parseFloat(node.priceRange.minVariantPrice.amount);
    const compareAt = parseFloat(node.compareAtPriceRange?.minVariantPrice?.amount || 0);
    const images = node.images.edges.map(e => e.node.url);

    // Agrupa variantes por opção "Color" (ou pega todas se não houver cor)
    const variantsRaw = node.variants.edges.map(e => e.node);
    const colorOption = variantsRaw[0]?.selectedOptions?.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'cor' || o.name.toLowerCase() === 'colour');

    let variants;
    if (colorOption) {
      // Deduplica por cor
      const seen = new Set();
      variants = variantsRaw
        .filter(v => {
          const color = v.selectedOptions.find(o => ['color','cor','colour'].includes(o.name.toLowerCase()))?.value;
          if (!color || seen.has(color)) return false;
          seen.add(color);
          return true;
        })
        .map(v => {
          const color = v.selectedOptions.find(o => ['color','cor','colour'].includes(o.name.toLowerCase()))?.value || v.title;
          return {
            id: v.id,
            name: color,
            hex: '#888888',  // cor padrão — editável no admin
            imageUrl: v.image?.url || images[0] || '',
            shopifyVariantId: v.id,
            inStock: v.availableForSale,
          };
        });
    } else {
      variants = variantsRaw.slice(0, 1).map(v => ({
        id: v.id,
        name: 'Padrão',
        hex: '#888888',
        imageUrl: images[0] || '',
        shopifyVariantId: v.id,
        inStock: v.availableForSale,
      }));
    }

    return {
      shopifyProductId: node.id,
      handle: node.handle,
      name: node.title,
      price,
      compareAtPrice: compareAt > price ? compareAt : null,
      // quantityAvailable exige scope unauthenticated_read_product_inventory — sem ele,
      // o stock real fica null e o merge mantém o stock do config local
      stock: null,
      images,
      variants,
      _fromShopify: true,
    };
  });
}

// Cria carrinho e retorna a URL de checkout do Shopify
export async function checkoutWithVariant(domain, token, variantId, quantity = 1) {
  const data = await shopifyFetch(domain, token, CREATE_CART_MUTATION, {
    lines: [{ merchandiseId: variantId, quantity }],
  });
  const { cart, userErrors } = data.cartCreate;
  if (userErrors?.length) throw new Error(userErrors[0].message);
  return cart.checkoutUrl;
}

// Merge: Shopify como primária + copy/styling local
// Filtra só os 6 produtos locais (pelo shopifyHandle) e enriquece com dados locais
export function mergeWithLocalConfig(shopifyProducts, localProducts) {
  const localByHandle = {};
  localProducts.forEach(p => {
    const key = p.shopifyHandle || p.handle;
    localByHandle[key] = p;
  });

  // Mapeia por Shopify, busca local para copy + styling
  return shopifyProducts.filter(s => localByHandle[s.handle]).map(shopify => {
    const local = localByHandle[shopify.handle];
    return {
      ...shopify,
      // dados de apresentação locais (copy, badges, etc)
      name: local.name || shopify.title,
      country: local.country || '',
      badge: local.badge || '',
      badgeColor: local.badgeColor || '',
      copy: local.copy || {},
      sizes: local.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      // cores/hex do config local (permite edição via admin)
      variants: shopify.variants.map(sv => {
        const localVariant = local.variants?.find(lv => lv.name.toLowerCase() === sv.name.toLowerCase());
        return {
          ...sv,
          name: localVariant?.name || sv.name,
          hex: localVariant?.hex || '#888888',
          imageUrl: localVariant?.imageUrl || sv.imageUrl || '',
          inStock: sv.inStock ?? localVariant?.inStock ?? true,
        };
      }),
    };
  });
}
