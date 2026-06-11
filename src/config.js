// ─── CONFIG SCHEMA + HOOK ────────────────────────────────────────────────────
// Toda configuração do site. Salvo em localStorage.
// Shopify + Cloudinary ficam nas Integrações do admin.

export const DEFAULT_CONFIG = {
  adminPassword: 'retro2026',

  site: {
    announcementBar: '🏆 FRETE GRÁTIS ACIMA DE €50 · USE RETRO15 PARA 15% OFF NA 1ª COMPRA',
    popupDelaySecs: 9,
    freeShippingThreshold: 50,
  },

  integrations: {
    pixelId: '2187595858447389',
    klaviyoFormId: '',
    // Shopify Storefront API — gere em: Shopify Admin → Settings → Apps → Develop apps
    shopifyDomain: 'shop.retromundial.com',  // seu domínio customizado
    shopifyToken: '',                        // Storefront API access token (quando pegar)
    // Cloudinary — cloudinary.com (grátis)
    cloudinaryCloud: 'dsyupplhx',
    cloudinaryPreset: 'retromundial_uploads',
    // Claude API (para copywriting IA — precisa de backend em produção)
    anthropicKey: '',
  },

  hero: {
    title: 'MOMENTS THAT MATTER',
    subtitle: 'Premium oversized football apparel celebrating World Cup heritage. Limited to 500 units per design.',
    backgroundImage: '',
    ctaPrimary: 'SHOP COLLECTION',
    ctaSecondary: 'VIEW STORY',
  },

  trustBadges: [
    { text: 'Edição limitada · 500 unidades' },
    { text: 'Frete grátis acima de €50' },
    { text: 'Garantia de 30 dias' },
    { text: 'Checkout 100% seguro' },
  ],

  discounts: [
    { code: 'RETRO15', percent: 15, label: '15% off 1ª compra', active: true },
  ],

  // Cada produto tem variantes de cor com fotos próprias
  products: [
    {
      id: 1,
      handle: 'brazil-world-cup-2026',
      name: 'Brazil World Cup 2026',
      country: 'Brazil',
      badge: 'Best Seller',
      badgeColor: 'bg-amber-500 text-black',
      price: 36.99,
      compareAtPrice: 49.99,   // preço riscado (aparece como "de €49,99 por €36,99")
      stock: 17,
      active: true,
      shopifyProductId: '',    // GID do produto no Shopify (preenchido automaticamente)
      copy: {
        headline: 'Brazil World Cup 2026',
        subtitle: 'Cinco títulos mundiais. Uma camisa intemporal.',
        description: 'Inspirada na gloriosa história da Seleção. Cada fio carrega o peso de cinco Copas do Mundo — do Pelé à geração Ronaldo. Um arquivo vivo da maior nação do futebol.',
        bullets: [
          '100% algodão orgânico certificado GOTS',
          'Corte oversized premium — confortável dentro e fora de campo',
          'Edição limitada de 500 unidades numeradas',
        ],
        cta: 'Comprar Agora',
      },
      // Variantes de cor: cada cor tem sua foto e ID do Shopify
      variants: [
        { id: 'br-verde', name: 'Verde', hex: '#009C3B', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'br-amarelo', name: 'Amarelo', hex: '#FFDF00', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'br-branco', name: 'Branco', hex: '#F5F5F5', imageUrl: '', shopifyVariantId: '', inStock: true },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [],  // galeria extra
    },
    {
      id: 2,
      handle: 'argentina-legacy',
      name: 'Argentina Legacy',
      country: 'Argentina',
      badge: 'Collector Edition',
      badgeColor: 'bg-purple-600 text-white',
      price: 36.99,
      compareAtPrice: 49.99,
      stock: 17,
      active: true,
      shopifyProductId: '',
      copy: {
        headline: 'Argentina Legacy',
        subtitle: 'Da mão de Deus à geração dourada de Messi.',
        description: 'La Albiceleste vive em cada ponto desta camisa. De Maradona a Messi, da México 86 ao Qatar 2022 — a jornada mais épica do futebol mundial em uma edição de colecionador.',
        bullets: [
          'Algodão orgânico com toque premium',
          'Gráfico heritage inspirado na Copa de 1986',
          'Numerada — apenas 500 unidades no mundo',
        ],
        cta: 'Adicionar à Coleção',
      },
      variants: [
        { id: 'ar-azul', name: 'Azul Celeste', hex: '#74ACDF', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'ar-branco', name: 'Branco', hex: '#F5F5F5', imageUrl: '', shopifyVariantId: '', inStock: true },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [],
    },
    {
      id: 3,
      handle: 'germany-precision',
      name: 'Germany Precision',
      country: 'Germany',
      badge: 'Trending Now',
      badgeColor: 'bg-blue-600 text-white',
      price: 36.99,
      compareAtPrice: 49.99,
      stock: 15,
      active: true,
      shopifyProductId: '',
      copy: {
        headline: 'Germany Precision',
        subtitle: 'Quatro títulos. Uma engenharia perfeita.',
        description: 'Construída com a precisão alemã que conquistou quatro Copas do Mundo. Do Kaiser Franz ao Völler, da Hungria 1954 ao Brasil 2014 — a Die Mannschaft em forma de arte.',
        bullets: [
          'Tecido premium resistente e durável',
          'Design minimalista inspirado na precisão alemã',
          'Edição numerada de colecionador',
        ],
        cta: 'Comprar Agora',
      },
      variants: [
        { id: 'de-preto', name: 'Preto', hex: '#1a1a1a', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'de-branco', name: 'Branco', hex: '#F5F5F5', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'de-cinza', name: 'Cinza', hex: '#888888', imageUrl: '', shopifyVariantId: '', inStock: true },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [],
    },
    {
      id: 4,
      handle: 'england-tradition',
      name: 'England Tradition',
      country: 'England',
      badge: 'Best Seller',
      badgeColor: 'bg-amber-500 text-black',
      price: 36.99,
      compareAtPrice: 49.99,
      stock: 11,
      active: true,
      shopifyProductId: '',
      copy: {
        headline: 'England Tradition',
        subtitle: 'Onde o futebol nasceu.',
        description: 'Os Three Lions rugem em um corte oversized feito para as arquibancadas. A terra que inventou o futebol merece uma camisa à altura da sua história — de Wembley 1966 aos sonhos atuais.',
        bullets: [
          'Corte oversized — perfeito para usar no dia a dia',
          'Detalhes bordados premium',
          'Certificado GOTS — produção sustentável',
        ],
        cta: 'Comprar Agora',
      },
      variants: [
        { id: 'en-branco', name: 'Branco', hex: '#F5F5F5', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'en-vermelho', name: 'Vermelho', hex: '#CF091F', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'en-azul', name: 'Azul Marinho', hex: '#012169', imageUrl: '', shopifyVariantId: '', inStock: false },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [],
    },
    {
      id: 5,
      handle: 'france-elegance',
      name: 'France Elegance',
      country: 'France',
      badge: 'Fan Favorite',
      badgeColor: 'bg-green-600 text-white',
      price: 36.99,
      compareAtPrice: 49.99,
      stock: 15,
      active: true,
      shopifyProductId: '',
      copy: {
        headline: 'France Elegance',
        subtitle: 'Les Bleus, reimaginados.',
        description: 'Os campeões de 1998 e 2018 merecem nada menos que a perfeição. Do Zidane ao Mbappé, da Copa em casa à dominação no Catar — a elegância francesa em algodão premium.',
        bullets: [
          'Silhueta oversized de inspiração Parisiense',
          'Gráfico exclusivo da geração campeã',
          'Edição limitada — 500 unidades',
        ],
        cta: 'Comprar Agora',
      },
      variants: [
        { id: 'fr-azul', name: 'Azul', hex: '#002395', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'fr-branco', name: 'Branco', hex: '#F5F5F5', imageUrl: '', shopifyVariantId: '', inStock: true },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [],
    },
    {
      id: 6,
      handle: 'spain-passion',
      name: 'Spain Passion',
      country: 'Spain',
      badge: 'New Drop',
      badgeColor: 'bg-red-600 text-white',
      price: 36.99,
      compareAtPrice: 49.99,
      stock: 15,
      active: true,
      shopifyProductId: '',
      copy: {
        headline: 'Spain Passion',
        subtitle: 'La Furia Roja. Tiki-taka em algodão.',
        description: 'Três Eurocopas consecutivas. Quatro Copas do Mundo. A Espanha que reinventou o futebol com Del Bosque, Xavi, Iniesta e Puyol merece ser lembrada para sempre.',
        bullets: [
          'Vermelho La Roja com detalhes dourados',
          'Algodão 100% orgânico de origem rastreável',
          'Peça de arquivo — 500 unidades numeradas',
        ],
        cta: 'Comprar Agora',
      },
      variants: [
        { id: 'es-vermelho', name: 'Vermelho', hex: '#AA151B', imageUrl: '', shopifyVariantId: '', inStock: true },
        { id: 'es-preto', name: 'Preto', hex: '#1a1a1a', imageUrl: '', shopifyVariantId: '', inStock: true },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [],
    },
  ],
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

function deepMerge(target, source) {
  if (!source) return target;
  const out = Array.isArray(target) ? [...target] : { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

export function useConfig() {
  const [config, setConfigState] = useState(() => {
    try {
      const saved = localStorage.getItem('rm_config_v2');
      if (saved) return deepMerge(DEFAULT_CONFIG, JSON.parse(saved));
    } catch {}
    return DEFAULT_CONFIG;
  });

  const setConfig = useCallback((updater) => {
    setConfigState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('rm_config_v2', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    localStorage.removeItem('rm_config_v2');
    setConfigState(DEFAULT_CONFIG);
  }, []);

  return { config, setConfig, resetConfig };
}
