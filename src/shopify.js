// ─── SHOPIFY STOREFRONT API ───────────────────────────────────────────────────
// Quando token configurado, puxa produtos reais do Shopify.
// Fallback: usa produtos do config local.

const COLOR_HEX = {
  // blues / navies
  'navy': '#1a2744', 'french navy': '#1a2744', 'dark navy': '#0d1b2a',
  'blue': '#2563eb', 'royal blue': '#2554c7', 'sky blue': '#38bdf8',
  'light blue': '#7dd3fc', 'navy blue': '#1e3a5f', 'ocean blue': '#006994',
  // blacks / grays
  'black': '#111111', 'jet black': '#111111', 'charcoal': '#374151',
  'dark grey': '#374151', 'dark gray': '#374151', 'grey': '#6b7280',
  'gray': '#6b7280', 'light grey': '#d1d5db', 'light gray': '#d1d5db',
  'ash': '#b2bec3', 'slate': '#64748b',
  // whites
  'white': '#f5f5f5', 'off white': '#faf9f6', 'cream': '#fffdd0',
  'ivory': '#fffff0', 'natural': '#f5f0e8',
  // reds
  'red': '#dc2626', 'scarlet': '#ff2400', 'crimson': '#dc143c',
  'burgundy': '#800020', 'wine': '#722f37', 'maroon': '#800000',
  // greens
  'green': '#16a34a', 'dark green': '#15803d', 'forest green': '#228b22',
  'bottle green': '#006a4e', 'olive': '#708238', 'khaki': '#c3b091',
  // yellows / ambers
  'yellow': '#eab308', 'gold': '#fbbf24', 'amber': '#f59e0b',
  'mustard': '#e1a800',
  // neutrals / stone
  'stone': '#b5a99a', 'pebble': '#a89880', 'dune': '#c8b89a',
  'linen': '#e8dcc8', 'ecru': '#c2b280', 'oatmeal': '#d4c5a9',
  'vintage white': '#f0ebe0', 'vintage black': '#1a1a1a',
  // browns
  'brown': '#92400e', 'tan': '#d2b48c', 'camel': '#c19a6b',
  'chocolate': '#7b3f00', 'sand': '#c2b280', 'taupe': '#8b7d6b',
  // purples / pinks
  'purple': '#7c3aed', 'violet': '#8b5cf6', 'lilac': '#c084fc',
  'pink': '#ec4899', 'rose': '#f43f5e', 'fuchsia': '#d946ef',
  // oranges
  'orange': '#ea580c', 'coral': '#ff6b6b', 'terracotta': '#c1440e',
};

function colorNameToHex(name) {
  if (!name) return '#888888';
  const key = name.toLowerCase().trim();
  return COLOR_HEX[key] || '#888888';
}

// Países reconhecidos (rótulo exibido no filtro do Shop)
const KNOWN_COUNTRIES = {
  brazil: 'Brazil', brasil: 'Brazil',
  argentina: 'Argentina',
  england: 'England', inglaterra: 'England',
  france: 'France', franca: 'France', frança: 'France',
  spain: 'Spain', espanha: 'Spain', españa: 'Spain',
  germany: 'Germany', alemanha: 'Germany', deutschland: 'Germany',
  italy: 'Italy', italia: 'Italy', itália: 'Italy',
  portugal: 'Portugal',
  netherlands: 'Netherlands', holanda: 'Netherlands',
};

// Detecta o país a partir das collections / tags / título do produto Shopify
function detectCountry(node) {
  const candidates = [];
  (node.collections?.edges || []).forEach(e => {
    candidates.push(e.node.title, e.node.handle);
  });
  if (Array.isArray(node.tags)) candidates.push(...node.tags);
  candidates.push(node.productType, node.title, node.handle);

  for (const raw of candidates) {
    if (!raw) continue;
    const words = String(raw).toLowerCase().split(/[\s\-_/]+/);
    for (const w of words) {
      if (KNOWN_COUNTRIES[w]) return KNOWN_COUNTRIES[w];
    }
  }
  return '';
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          productType
          tags
          collections(first: 10) {
            edges { node { title handle } }
          }
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

    // Build Color/Size → variantId lookup map
    const variantsByColorSize = {};
    const sizeSet = [];
    variantsRaw.forEach(v => {
      const color = v.selectedOptions.find(o => ['color','cor','colour'].includes(o.name.toLowerCase()))?.value;
      const size  = v.selectedOptions.find(o => o.name.toLowerCase() === 'size' || o.name.toLowerCase() === 'tamanho')?.value;
      if (color && size) {
        variantsByColorSize[`${color}/${size}`] = v.id;
        if (!sizeSet.includes(size)) sizeSet.push(size);
      }
    });
    // Shopify returns sizes in variant order (S→2XL) — preserve that order
    const sizes = sizeSet.length > 0 ? sizeSet : null;

    let variants;
    if (colorOption) {
      // Deduplica por cor — um swatch por cor (shopifyVariantId = primeira variante dessa cor, apenas para referência)
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
            hex: colorNameToHex(color),
            imageUrl: v.image?.url || images[0] || '',
            shopifyVariantId: v.id,
            inStock: v.availableForSale,
          };
        });
    } else {
      variants = variantsRaw.slice(0, 1).map(v => ({
        id: v.id,
        name: v.title || 'Default',
        hex: colorNameToHex(v.title),
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
      stock: null,
      images,
      variants,
      variantsByColorSize,
      sizes,
      country: detectCountry(node),
      _fromShopify: true,
    };
  });
}

// Cria carrinho com um ou mais itens e retorna a URL de checkout
export async function checkoutCart(domain, token, lines) {
  const data = await shopifyFetch(domain, token, CREATE_CART_MUTATION, { lines });
  const { cart, userErrors } = data.cartCreate;
  if (userErrors?.length) throw new Error(userErrors[0].message);
  return cart.checkoutUrl;
}

// Compat — usado em Product.jsx para Buy Now com item único
export async function checkoutWithVariant(domain, token, variantId, quantity = 1) {
  return checkoutCart(domain, token, [{ merchandiseId: variantId, quantity }]);
}

// Merge: Shopify como primária + copy/styling local
// Filtra só os 6 produtos locais (pelo shopifyHandle) e enriquece com dados locais
export function mergeWithLocalConfig(shopifyProducts, localProducts) {
  const localByHandle = {};
  localProducts.forEach(p => {
    const key = p.shopifyHandle || p.handle;
    localByHandle[key] = p;
  });

  // Inclui TODOS os produtos do Shopify; config local enriquece copy/styling
  return shopifyProducts.map(shopify => {
    const local = localByHandle[shopify.handle];
    // Imagens extras do produto = as que o admin carregou no painel (sequência manual)
    // Filtra URLs do Shopify CDN (dados antigos salvos antes da correção)
    const images = (local?.images || []).filter(
      url => url && !url.includes('cdn.shopify.com')
    );
    return {
      ...shopify,
      id: local?.id ?? shopify.handle,
      images,
      // produtos sem config local ficam inativos por padrão (admin escolhe ativar)
      active: local?.active ?? false,
      sortOrder: local?.sortOrder ?? 999,
      // dados de apresentação locais (copy, badges, etc)
      name: local?.name || shopify.title,
      // país: admin manual tem prioridade; senão usa o detectado nas collections Shopify
      country: local?.country || shopify.country || '',
      badge: local?.badge || '',
      badgeColor: local?.badgeColor || '',
      copy: local?.copy || {},
      coverImageUrl: local?.coverImageUrl || '',
      videoUrl: local?.videoUrl || '',
      // preço: Shopify tem prioridade; config local serve de fallback (ex: produtos não sincronizados)
      price: shopify.price || local?.price || 0,
      // compareAtPrice: Shopify tem prioridade; se não tiver, usa o config (permite definir promoção sem tocar no Shopify)
      compareAtPrice: shopify.compareAtPrice || local?.compareAtPrice || null,
      sizes: shopify.sizes || local?.sizes || ['S', 'M', 'L', 'XL', '2XL'],
      variantsByColorSize: shopify.variantsByColorSize || {},
      variants: shopify.variants.map(sv => {
        const localVariant = local?.variants?.find(lv => lv.name.toLowerCase() === sv.name.toLowerCase());
        // imagem da variante: Shopify > local > primeira imagem do produto
        const imageUrl = sv.imageUrl || localVariant?.imageUrl || images[0] || '';
        return {
          ...sv,
          name: localVariant?.name || sv.name,
          hex: localVariant?.hex || colorNameToHex(sv.name),
          imageUrl,
          inStock: sv.inStock ?? localVariant?.inStock ?? true,
        };
      }),
    };
  });
}
