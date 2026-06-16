import { useState, useEffect, useRef } from 'react';
import { useConfig } from './config';
import { fetchShopifyProducts, mergeWithLocalConfig } from './shopify';
import { trackEvent } from './tracking';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import EmailPopup from './components/EmailPopup';
import AdminPanel from './components/Admin';
import HomePage from './pages/Home';
import ShopPage from './pages/Shop';
import ProductPage from './pages/Product';
import CustomersPage from './pages/Customers';
import AboutPage from './pages/About';
import { ExternalLink } from 'lucide-react';

// ─── META PIXEL ───────────────────────────────────────────────────────────────

function useMetaPixel(pixelId) {
  useEffect(() => {
    if (!pixelId || window.fbq) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', pixelId);
    // PageView via trackEvent → navegador + CAPI (deduplicado) + registro no funil
    trackEvent('PageView');
  }, [pixelId]);
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { config, setConfig, setConfigSilent, resetConfig } = useConfig();
  const [products, setProducts] = useState(config.products);
  const [page, setPage] = useState('home');
  const [shopFilter, setShopFilter] = useState(null);
  const shopifyCache = useRef([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Meta Pixel
  useMetaPixel(config.integrations?.pixelId);

  // Busca Shopify quando token/domain mudam; cacheia para re-merge sem nova chamada
  useEffect(() => {
    const { shopifyDomain, shopifyToken } = config.integrations || {};
    if (!shopifyDomain || !shopifyToken) { setProducts(config.products); return; }

    fetchShopifyProducts(shopifyDomain, shopifyToken)
      .then(shopifyProducts => {
        shopifyCache.current = shopifyProducts;
        // Adiciona ao config qualquer produto novo da Shopify (fica inativo por padrão)
        // Usa setConfigSilent para NÃO sobrescrever o Supabase com config incompleta
        setConfigSilent(prev => {
          const existingHandles = new Set((prev.products || []).map(p => p.shopifyHandle || p.handle));
          const newOnes = shopifyProducts
            .filter(sp => !existingHandles.has(sp.handle))
            .map((sp, i) => ({
              id: sp.handle,
              handle: sp.handle,
              shopifyHandle: sp.handle,
              name: sp.title,
              country: '',
              badge: '',
              badgeColor: '',
              price: sp.price,
              compareAtPrice: null,
              stock: null,
              active: false,
              sortOrder: 999 + i,
              variants: sp.variants.map(v => ({
                id: v.id, name: v.name, hex: '#888888',
                imageUrl: v.imageUrl || '', shopifyVariantId: v.shopifyVariantId || v.id,
                inStock: v.inStock ?? true,
              })),
              copy: {}, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            }));
          return newOnes.length ? { ...prev, products: [...prev.products, ...newOnes] } : prev;
        });
        setProducts(mergeWithLocalConfig(shopifyProducts, config.products));
      })
      .catch(err => {
        console.warn('Shopify fetch failed:', err.message);
        setProducts(config.products);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.integrations?.shopifyToken, config.integrations?.shopifyDomain]);

  // Re-merge quando o admin edita config.products (sem nova chamada à API)
  useEffect(() => {
    if (shopifyCache.current.length > 0) {
      setProducts(mergeWithLocalConfig(shopifyCache.current, config.products));
    } else {
      // Shopify ainda não carregou — usa os produtos da config diretamente
      setProducts(config.products);
    }
  }, [config.products]);

  // Popup com delay configurável — 1× por sessão
  useEffect(() => {
    if (sessionStorage.getItem('rm_popup_seen')) return;
    const delay = (config.site?.popupDelaySecs || 9) * 1000;
    const t = setTimeout(() => {
      setPopupOpen(true);
      sessionStorage.setItem('rm_popup_seen', '1');
    }, delay);
    return () => clearTimeout(t);
  }, [config.site?.popupDelaySecs]);

  // Scroll to top on navigation
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page, currentProduct?.id]);

  // Config com produtos atualizados (pode vir do Shopify)
  const activeConfig = { ...config, products };

  // ─── NAVEGAÇÃO ───────────────────────────────────────────────────────────────

  function navigate(p, product = null, filter = null) {
    setPage(p);
    if (product) setCurrentProduct(product);
    if (filter) setShopFilter(filter);
  }

  // ─── CARRINHO ────────────────────────────────────────────────────────────────

  function addToCart(product, variant, size, qty = 1) {
    trackEvent('AddToCart', {
      content_name: product.name,
      content_type: 'product',
      content_ids: [product.id],
      value: (product.salePrice || product.price) * qty,
      currency: 'EUR',
      num_items: qty,
    });

    setCart(prev => {
      const key = { id: product.id, variantId: variant?.id, size };
      const existing = prev.find(i => i.id === key.id && i.selectedVariantId === key.variantId && i.size === key.size);
      const item = {
        ...product,
        selectedVariantId: variant?.id || null,
        selectedVariantName: variant?.name || null,
        shopifyVariantId: variant?.shopifyVariantId || null,
        variantImageUrl: variant?.imageUrl || null,
        size,
        qty,
      };
      if (existing) {
        return prev.map(i =>
          i.id === key.id && i.selectedVariantId === key.variantId && i.size === key.size
            ? { ...i, qty: Math.min(i.qty + qty, product.stock || 99) }
            : i
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
  }

  function updateCart(id, variantId, size, qty) {
    if (qty < 1) { removeFromCart(id, variantId, size); return; }
    setCart(prev => prev.map(i =>
      i.id === id && i.selectedVariantId === variantId && i.size === size ? { ...i, qty } : i
    ));
  }

  function removeFromCart(id, variantId, size) {
    setCart(prev => prev.filter(i => !(i.id === id && i.selectedVariantId === variantId && i.size === size)));
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Overlays */}
      {popupOpen && <EmailPopup config={activeConfig} onClose={() => setPopupOpen(false)} />}
      {cartOpen && (
        <Cart items={cart} config={activeConfig} products={products} onClose={() => setCartOpen(false)}
          onUpdate={updateCart} onRemove={removeFromCart} onAddToCart={addToCart} />
      )}
      {adminOpen && (
        <AdminPanel config={activeConfig} setConfig={setConfig} resetConfig={resetConfig} onClose={() => setAdminOpen(false)} products={products} />
      )}

      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onNavigate={navigate}
        currentPage={page}
        onAdminClick={() => setAdminOpen(true)}
        announcementText="🚚 Free shipping across Europe on Bundles · Build Your Kit and save"
        logoUrl={config.site.logoUrl}
        logoSubtitle={config.site.logoSubtitle}
      />

      <main>
        {page === 'home' && (
          <HomePage products={products} config={activeConfig} onNavigate={navigate} onAddToCart={addToCart} />
        )}
        {page === 'shop' && (
          <ShopPage products={products} config={activeConfig} onNavigate={navigate} selectedCountry={shopFilter} onFilterChange={setShopFilter} />
        )}
        {page === 'product' && currentProduct && (
          <ProductPage
            product={products.find(p => p.id === currentProduct.id) || currentProduct}
            config={activeConfig}
            onNavigate={navigate}
            onAddToCart={addToCart}
          />
        )}
        {page === 'story' && (
          <div className="min-h-screen pt-32 pb-20 flex items-center justify-center text-center px-4">
            <div>
              <h1 className="text-6xl font-black mb-6">OUR STORY</h1>
              <p className="text-gray-400 max-w-md mx-auto mb-8">Coming soon. Explore the collection.</p>
              <button onClick={() => navigate('shop')}
                className="bg-amber-500 text-black font-black px-8 py-4 rounded-sm uppercase tracking-wide hover:bg-amber-400 transition-colors">
                View Collection
              </button>
            </div>
          </div>
        )}
        {page === 'customers' && (
          <CustomersPage />
        )}
        {page === 'about' && (
          <AboutPage onNavigate={navigate} />
        )}
      </main>

      <Footer config={activeConfig} onNavigate={navigate} />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800 p-3">
        <button onClick={() => navigate('shop')}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 text-sm tracking-widest uppercase rounded-sm transition-colors">
          Shop Collection — From €{Math.min(...products.map(p => p.price)).toFixed(2)}
        </button>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer({ config, onNavigate }) {
  const { shopifyDomain } = config.integrations || {};
  const domain = shopifyDomain?.replace('.myshopify.com', '') ? `${shopifyDomain.replace('.myshopify.com','')}.com` : 'retromundial.com';

  return (
    <footer className="bg-black border-t border-gray-900 pt-16 pb-28 md:pb-16 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto">

        {/* top row — brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-black tracking-tighter mb-0.5">RETRO MUNDIAL</div>
            <div className="text-amber-500 text-[9px] font-black tracking-[0.3em] uppercase mb-5">Moments That Matter</div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[200px]">
              Premium oversized shirts. World Cup. 500 units per design.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="https://instagram.com/retro_mundial26" target="_blank" rel="noreferrer"
                className="text-gray-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                Instagram
              </a>
              <a href="https://tiktok.com/@retro_mundial26" target="_blank" rel="noreferrer"
                className="text-gray-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                TikTok
              </a>
            </div>
          </div>

          {/* coleção */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Collection</h4>
            <ul className="space-y-3">
              {config.products.filter(p => p.active).map(p => (
                <li key={p.id}>
                  <button onClick={() => onNavigate('product', p)}
                    className="text-gray-500 hover:text-white text-xs transition-colors text-left">
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* suporte */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Support</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              {[
                ['Shipping & Returns', `https://${domain}/pages/shipping-and-returns`],
                ['Size Guide',         `https://${domain}/pages/size-guide`],
                ['FAQ',                `https://${domain}/pages/faq`],
                ['Contact',            `mailto:adsadsjoga@gmail.com`],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer"
                    className="hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* empresa */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Company</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors text-left">
                  Our Story
                </button>
              </li>
              {[
                ['Terms & Conditions', `https://${domain}/policies/terms-of-service`],
                ['Privacy Policy',     `https://${domain}/policies/privacy-policy`],
                ['Cookie Policy',      `https://${domain}/policies/privacy-policy`],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer"
                    className="hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-gray-900 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[10px] text-gray-700">
            © 2026 Retro Mundial. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-gray-700 text-[10px]">
            <span>Visa</span><span>·</span>
            <span>Mastercard</span><span>·</span>
            <span>PayPal</span><span>·</span>
            <span>Shop Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
