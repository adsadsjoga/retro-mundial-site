import { useState, useEffect } from 'react';
import { useConfig } from './config';
import { fetchShopifyProducts, mergeWithLocalConfig } from './shopify';
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
    window.fbq('track', 'PageView');
  }, [pixelId]);
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { config, setConfig, resetConfig } = useConfig();
  const [products, setProducts] = useState(config.products);
  const [page, setPage] = useState('home');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Meta Pixel
  useMetaPixel(config.integrations?.pixelId);

  // Carrega produtos: Shopify se disponível, senão locais
  useEffect(() => {
    const { shopifyDomain, shopifyToken } = config.integrations || {};

    if (shopifyDomain && shopifyToken) {
      // Shopify disponível — busca e merge com config local
      fetchShopifyProducts(shopifyDomain, shopifyToken)
        .then(shopifyProducts => {
          setProducts(mergeWithLocalConfig(shopifyProducts, config.products));
        })
        .catch(err => {
          console.warn('Shopify fetch failed:', err.message);
          setProducts(config.products); // fallback para local
        });
    } else {
      // Sem token — usa apenas produtos locais
      setProducts(config.products);
    }
  }, [config.products, config.integrations?.shopifyToken, config.integrations?.shopifyDomain]);

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

  function navigate(p, product = null) {
    setPage(p);
    if (product) setCurrentProduct(product);
  }

  // ─── CARRINHO ────────────────────────────────────────────────────────────────

  function addToCart(product, variant, size, qty = 1) {
    if (window.fbq) window.fbq('track', 'AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.salePrice || product.price,
      currency: 'EUR',
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
        <Cart items={cart} config={activeConfig} onClose={() => setCartOpen(false)}
          onUpdate={updateCart} onRemove={removeFromCart} />
      )}
      {adminOpen && (
        <AdminPanel config={activeConfig} setConfig={setConfig} resetConfig={resetConfig} onClose={() => setAdminOpen(false)} />
      )}

      {/* Announcement bar — fixed no topo */}
      <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-xs font-bold text-center py-2 px-4 z-40">
        {config.site.announcementBar}
      </div>

      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onNavigate={navigate}
        currentPage={page}
        onAdminClick={() => setAdminOpen(true)}
      />

      <main>
        {page === 'home' && (
          <HomePage products={products} config={activeConfig} onNavigate={navigate} onAddToCart={addToCart} />
        )}
        {page === 'shop' && (
          <ShopPage products={products} config={activeConfig} onNavigate={navigate} />
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
              <h1 className="text-6xl font-black mb-6">NOSSA HISTÓRIA</h1>
              <p className="text-gray-400 max-w-md mx-auto mb-8">Em breve. Explore a coleção.</p>
              <button onClick={() => navigate('shop')}
                className="bg-amber-500 text-black font-black px-8 py-4 rounded-sm uppercase tracking-wide hover:bg-amber-400 transition-colors">
                Ver Coleção
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
          Ver Coleção — A partir de €{Math.min(...products.map(p => p.price)).toFixed(2)}
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
    <footer className="bg-gray-900 border-t border-gray-800 py-16 px-4 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="text-xl font-black tracking-tighter mb-1">RETRO MUNDIAL</div>
            <div className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">Moments That Matter</div>
            <p className="text-gray-400 text-sm leading-relaxed">Premium oversized football apparel celebrating World Cup heritage.</p>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-4">Coleção</h4>
            <ul className="space-y-2">
              {config.products.filter(p => p.active).map(p => (
                <li key={p.id}>
                  <button onClick={() => onNavigate('product', p)}
                    className="text-gray-400 hover:text-white text-sm transition-colors text-left">
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-4">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              {['Envio & Devoluções','Guia de Tamanhos','FAQ','Contato'].map(i => (
                <li key={i}>
                  <a href={`https://${domain}/pages/${i.toLowerCase().replace(/ /g,'-').replace('&','e')}`}
                    target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 Retro Mundial. Todos os direitos reservados.</p>
          <a href={`https://${domain}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors">
            {domain} <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </footer>
  );
}
