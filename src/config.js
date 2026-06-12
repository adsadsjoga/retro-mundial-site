// ─── CONFIG SCHEMA + HOOK ────────────────────────────────────────────────────
// Toda configuração do site. Salvo em localStorage.
// Shopify + Cloudinary ficam nas Integrações do admin.

export const DEFAULT_CONFIG = {
  adminPassword: 'retro2026',

  site: {
    announcementBar: '🏆 FREE SHIPPING OVER €50 · USE RETRO15 FOR 15% OFF YOUR FIRST ORDER',
    popupDelaySecs: 9,
    freeShippingThreshold: 50,
  },

  integrations: {
    pixelId: '2187595858447389',
    klaviyoFormId: '',
    // Shopify Storefront API — gere em: Shopify Admin → Settings → Apps → Develop apps
    shopifyDomain: 'w3vhuq-dy.myshopify.com', // domínio canónico — o custom dá 301 na API
    shopifyToken: 'c688c7df2fb623cf9fd3753647d6974f', // Storefront API public token (seguro no frontend)
    // Cloudinary — cloudinary.com (grátis)
    cloudinaryCloud: 'dsyupplhx',
    cloudinaryPreset: 'retromundial_uploads',
    // Claude API (para copywriting IA — precisa de backend em produção)
    anthropicKey: '',
  },

  hero: {
    title: 'MOMENTS THAT MATTER',
    subtitle: 'Premium oversized football apparel celebrating World Cup heritage. Limited to 500 units per design.',
    backgroundImage: 'https://res.cloudinary.com/dsyupplhx/image/upload/v1781183198/slide_6_oztt5m.png',
    ctaPrimary: 'SHOP COLLECTION',
    ctaSecondary: 'VIEW STORY',
  },

  trustBadges: [
    { text: 'Limited edition · 500 units' },
    { text: 'Free shipping over €50' },
    { text: '30-day guarantee' },
    { text: '100% secure checkout' },
  ],

  discounts: [
    { code: 'RETRO15', percent: 15, label: '15% off first order', active: true },
  ],

  // ─── HOMEPAGE — secções editáveis pelo Admin (aba "Aparência do Site") ───
  homepage: {
    // Imagens dos cards de país na secção "Escolhe o teu país".
    // Se vazio, mostra a bandeira emoji como fallback.
    countries: [
      { key: 'Brazil',    image: '' },
      { key: 'Argentina', image: '' },
      { key: 'Germany',   image: '' },
      { key: 'England',   image: '' },
      { key: 'France',    image: '' },
      { key: 'Spain',     image: '' },
    ],
    // Bloco editorial "500" — aceita imagem OU vídeo de fundo
    editorial: {
      mediaType: 'none',          // 'none' | 'image' | 'video'
      mediaUrl: '',               // URL da imagem ou vídeo (mp4/webm)
      eyebrow: 'Every design',
      titleLine1: '500 pieces.',
      titleLine2: 'Then it\'s gone.',
      text: 'No second run. No restock. When the number\'s up, the piece becomes archive. Yours could be one of them.',
      ctaLabel: 'See what\'s left',
      ctaTarget: 'shop',          // 'home' | 'shop' | 'about' ou URL externa
    },
    // Secção "A nossa história" — 4 imagens (colagem) + textos + links
    story: {
      images: ['', '', '', ''],   // 4 imagens; vazio = usa foto dos produtos
      imageLinks: ['', '', '', ''], // destino de cada imagem: vazio = produto correspondente
      eyebrow: 'Our story',
      title: 'We don\'t make\ntraining gear.\nWe make archive.',
      text1: 'Every Retro Mundial shirt holds a moment from World Cup history. The goal that wasn\'t. The final nobody saw coming. The farewell of a legend.',
      text2: '100% GOTS-certified organic cotton. Built to last decades, not seasons.',
      ctaLabel: 'Who we are',
      ctaTarget: 'about',
    },
  },

  // Cada produto tem variantes de cor com fotos próprias
  products: [
    {
      id: 1,
      handle: 'brazil-world-cup-2026',
      shopifyHandle: 'unisex-organic-oversized-high-neck-t-shirt',
      name: 'Brazil World Cup 2026',
      country: 'Brazil',
      badge: 'Best Seller',
      badgeColor: 'bg-amber-500 text-black',
      price: 36.99,
      compareAtPrice: 49.99,
      stock: 17,
      active: true,
      sortOrder: 1,
      shopifyProductId: '',    // GID do produto no Shopify (preenchido automaticamente)
      copy: {
        headline: 'Brazil World Cup 2026',
        subtitle: 'Five world titles. One timeless shirt.',
        description: 'Inspired by the Seleção\'s glorious history. Every thread carries the weight of five World Cups — from Pelé to the Ronaldo generation. A living archive of football\'s greatest nation.',
        bullets: [
          '100% GOTS-certified organic cotton',
          'Premium oversized cut — comfortable on and off the pitch',
          'Limited edition of 500 numbered units',
        ],
        cta: 'Buy Now',
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
      shopifyHandle: 'argentina-unisex-organic-oversized-high-neck-t-shirt',
      name: 'Argentina Legacy',
      country: 'Argentina',
      badge: 'Collector Edition',
      badgeColor: 'bg-purple-600 text-white',
      sortOrder: 2,
      price: 36.99,
      compareAtPrice: 49.99,
      stock: 17,
      active: true,
      shopifyProductId: '',
      copy: {
        headline: 'Argentina Legacy',
        subtitle: 'Hand of God to Messi\'s golden generation.',
        description: 'La Albiceleste lives in every stitch of this shirt. From Maradona to Messi, from Mexico \'86 to Qatar 2022 — the most epic journey in world football as a collector\'s edition.',
        bullets: [
          'Organic cotton with a premium feel',
          'Heritage graphic inspired by the 1986 World Cup',
          'Numbered — only 500 units in the world',
        ],
        cta: 'Add to Collection',
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
      shopifyHandle: 'germany-unisex-organic-oversized-high-neck-t-shirt',
      name: 'Germany Precision',
      sortOrder: 3,
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
        subtitle: 'Four titles. A perfect engineering.',
        description: 'Built with the German precision that won four World Cups. From Kaiser Franz to Völler, from Hungary 1954 to Brazil 2014 — Die Mannschaft as a form of art.',
        bullets: [
          'Durable premium fabric',
          'Minimalist design inspired by German precision',
          'Numbered collector\'s edition',
        ],
        cta: 'Buy Now',
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
      shopifyHandle: 'england-unisex-organic-oversized-high-neck-t-shirt',
      sortOrder: 4,
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
        subtitle: 'Where football was born.',
        description: 'The Three Lions roar in an oversized cut made for the terraces. The land that invented football deserves a shirt worthy of its history — from Wembley 1966 to today\'s dreams.',
        bullets: [
          'Oversized cut — perfect for everyday wear',
          'Premium embroidered details',
          'GOTS certified — sustainable production',
        ],
        cta: 'Buy Now',
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
      shopifyHandle: 'france-unisex-organic-oversized-high-neck-t-shirt',
      sortOrder: 5,
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
        subtitle: 'Les Bleus, reimagined.',
        description: 'The 1998 and 2018 champions deserve nothing less than perfection. From Zidane to Mbappé, from the home World Cup to Qatar domination — French elegance in premium cotton.',
        bullets: [
          'Parisian-inspired oversized silhouette',
          'Exclusive graphic of the champion generation',
          'Limited edition — 500 units',
        ],
        cta: 'Buy Now',
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
      shopifyHandle: 'espanha-unisex-organic-oversized-high-neck-t-shirt',
      name: 'Spain Passion',
      sortOrder: 6,
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
        subtitle: 'La Furia Roja. Tiki-taka in cotton.',
        description: 'Three consecutive Euros. One World Cup. The Spain that reinvented football with Del Bosque, Xavi, Iniesta and Puyol deserves to be remembered forever.',
        bullets: [
          'La Roja red with golden details',
          '100% traceable organic cotton',
          'Archive piece — 500 numbered units',
        ],
        cta: 'Buy Now',
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

import { useState, useCallback, useEffect } from 'react';

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

const STORAGE_KEY = 'rm_config_v3';

function parseAndMergeConfig(saved) {
  const merged = deepMerge(DEFAULT_CONFIG, JSON.parse(saved));
  const badToken = !merged.integrations.shopifyToken
    || merged.integrations.shopifyToken.startsWith('shpss_')
    || merged.integrations.shopifyToken.startsWith('shpat_')
    || merged.integrations.shopifyToken.startsWith('atkn_');
  if (badToken) merged.integrations.shopifyToken = DEFAULT_CONFIG.integrations.shopifyToken;
  if (!merged.integrations.shopifyDomain || merged.integrations.shopifyDomain === 'shop.retromundial.com') {
    merged.integrations.shopifyDomain = DEFAULT_CONFIG.integrations.shopifyDomain;
  }
  if (!merged.hero.backgroundImage) {
    merged.hero.backgroundImage = DEFAULT_CONFIG.hero.backgroundImage;
  }
  merged.products = merged.products.map((p, i) => {
    const def = DEFAULT_CONFIG.products.find(d => d.id === p.id || d.handle === p.handle);
    return {
      ...p,
      shopifyHandle: p.shopifyHandle || def?.shopifyHandle || '',
      sortOrder:     p.sortOrder     ?? (i + 1),
    };
  });
  return merged;
}

export function useConfig() {
  const [config, setConfigState] = useState(() => {
    try {
      localStorage.removeItem('rm_config_v1');
      localStorage.removeItem('rm_config_v2');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return parseAndMergeConfig(saved);
    } catch {}
    return DEFAULT_CONFIG;
  });

  const setConfig = useCallback((updater) => {
    setConfigState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setConfigState(parseAndMergeConfig(e.newValue));
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const resetConfig = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConfigState(DEFAULT_CONFIG);
  }, []);

  return { config, setConfig, resetConfig };
}
