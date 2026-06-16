import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Truck, Shield, RotateCcw, ExternalLink, AlertCircle, Check } from 'lucide-react';
import { ProductImage } from './shared';
import { checkoutCart } from '../shopify';
import { trackEvent } from '../tracking';

const SUPPORT_EMAIL = 'adsadsjoga@gmail.com';

// ─── COMBOS AUTOMÁTICOS ───────────────────────────────────────────────────────
// O carrinho deteta automaticamente quando o cliente montou um combo (juntando
// tees e totes individuais) e aplica o código de desconto correspondente — que
// existe no Shopify e desconta de facto no checkout. Sempre o melhor combo presente.
// Valores baseados em: Tee €39.99 · Tote €24.99 (preço Shopify real)
//   Tee + Tote      €64.98 → €54.99  (−€9.99)
//   Double Drop     €79.98 → €74.99  (−€4.99)  (2 tees)
//   Collector Kit  €104.97 → €89.99  (−€14.99) (2 tees + tote)
const COMBOS = {
  collector: { code: 'KIT-COLLECTOR', amount: 14.99, label: 'Collector Kit' },
  double:    { code: 'KIT-DOUBLE',    amount: 4.99,  label: 'Double Drop' },
  teetote:   { code: 'KIT-TEETOTE',   amount: 9.99,  label: 'Tee + Tote Kit' },
};

function classifyItem(item) {
  const name = (item.name || '').toLowerCase();
  if (name.includes('tote')) return 'tote';
  if (name.includes('hoodie')) return 'hoodie';
  if (item.isBundle) return 'bundle';
  if (item.country) return 'tee';
  return 'other';
}

function detectCombo(items) {
  let tees = 0, totes = 0;
  items.forEach(i => {
    const c = classifyItem(i);
    if (c === 'tee') tees += i.qty;
    if (c === 'tote') totes += i.qty;
  });
  if (tees >= 2 && totes >= 1) return COMBOS.collector;
  if (tees >= 2) return COMBOS.double;
  if (tees >= 1 && totes >= 1) return COMBOS.teetote;
  return null;
}

export default function Cart({ items, config, products, onClose, onUpdate, onRemove, onAddToCart }) {
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState('');

  const freeShip = config.site?.freeShippingThreshold || 50;
  const subtotal = items.reduce((s, i) => s + (i.salePrice || i.price) * i.qty, 0);
  // Combo automático tem prioridade sobre cupão manual (evita acumular descontos)
  const combo = detectCombo(items);
  const couponDiscount = appliedCoupon ? subtotal * (appliedCoupon.percent / 100) : 0;
  const discount = combo ? combo.amount : couponDiscount;
  const shipping = subtotal - discount >= freeShip ? 0 : 4.99;
  const total = subtotal - discount + shipping;

  // Upsell de tote: só mostra se existir um tote comprável (com variante Shopify) e
  // ainda não houver tote no carrinho. Evita botão "morto" quando nenhum tote está linkado.
  const cartHasTote = items.some(i => (i.name || '').toLowerCase().includes('tote'));
  // Procura primeiro na lista de produtos REAIS do Shopify (têm shopifyVariantId);
  // cai para a config local se necessário.
  const toteSource = (products && products.length ? products : config.products) || [];
  const upsellTote = !cartHasTote
    ? toteSource.find(p =>
        (p.name || '').toLowerCase().includes('tote') &&
        p.variants?.some(v => v.shopifyVariantId))
    : null;
  const upsellVariant = upsellTote?.variants?.find(v => v.shopifyVariantId) || upsellTote?.variants?.[0];

  function applyCouponCode() {
    const found = config.discounts?.find(d => d.active && d.code.toUpperCase() === coupon.toUpperCase());
    if (found) { setAppliedCoupon(found); setCouponMsg(`✓ ${found.label} applied!`); }
    else setCouponMsg('Invalid coupon.');
  }

  async function handleCheckout() {
    const { shopifyDomain, shopifyToken } = config.integrations || {};
    setCheckoutErr('');

    // Itens que conseguem ir para o checkout (precisam de variante Shopify)
    const lines = items
      .filter(i => i.shopifyVariantId)
      .map(i => ({ merchandiseId: i.shopifyVariantId, quantity: i.qty }));

    // Sem credenciais ou sem itens válidos → não há como criar um checkout real.
    // NUNCA abrir um carrinho Shopify vazio: mostra erro claro no próprio carrinho.
    if (!shopifyDomain || !shopifyToken || lines.length === 0) {
      setCheckoutErr('checkout_unavailable');
      return;
    }

    setLoading(true);

    // Estágio-chave do funil: dispara InitiateCheckout (navegador + CAPI + funil)
    trackEvent('InitiateCheckout', {
      value: subtotal - discount,
      currency: 'EUR',
      num_items: items.reduce((s, i) => s + i.qty, 0),
      content_ids: items.map(i => i.shopifyVariantId || i.id).filter(Boolean),
    });

    try {
      // Passa o código do combo detetado para o Shopify aplicar o desconto no checkout
      const discountCodes = combo ? [combo.code] : [];
      const url = await checkoutCart(shopifyDomain, shopifyToken, lines, discountCodes);
      // Mobile (sobretudo navegadores in-app do Instagram/Facebook) bloqueia ou
      // perde o contexto com window.open(_blank). Navega na mesma aba para garantir
      // que o checkout Shopify carrega. No desktop mantém nova aba (preserva o carrinho).
      const isMobile = /Android|iPhone|iPad|iPod|Mobile|Instagram|FBAN|FBAV/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = url;
        // não limpa loading: a página navega para fora
      } else {
        window.open(url, '_blank');
        setLoading(false);
      }
    } catch (e) {
      console.error('Shopify checkout error:', e);
      setCheckoutErr('checkout_failed');
      setLoading(false);
    }
  }

  useEffect(() => {
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    trackEvent('ViewCart', {
      value: totalValue,
      currency: 'EUR',
      num_items: items.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-black">YOUR CART</h2>
            <p className="text-gray-400 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="hover:text-amber-500 transition-colors p-1"><X size={22} /></button>
        </div>

        {subtotal < freeShip ? (
          <div className="px-6 py-3 bg-black/40 text-sm">
            <p className="text-gray-400 mb-1.5">
              <span className="text-amber-500 font-bold">€{(freeShip - subtotal).toFixed(2)}</span> away from free shipping
            </p>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.min((subtotal / freeShip) * 100, 100)}%` }} />
            </div>
          </div>
        ) : (
          <div className="px-6 py-2 bg-green-900/30 text-green-400 text-sm flex items-center gap-2">
            <Truck size={14} /> Free shipping unlocked!
          </div>
        )}

        {/* Upsell: Tote Bag add-on — só mostra se houver um tote comprável e o cliente
            tiver ≥1 tee no carrinho (desbloqueia o combo Tee + Tote ou Collector Kit) */}
        {items.length > 0 && upsellTote && onAddToCart && (
          <div className="mx-6 my-2 border border-amber-500/40 bg-amber-500/5 rounded-sm p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-amber-400">Add a Tote Bag</p>
              <p className="text-gray-400 text-xs mt-0.5">Complete the kit — €{(upsellTote.price || 22).toFixed(2)}</p>
            </div>
            <button
              onClick={() => onAddToCart(upsellTote, upsellVariant, upsellTote.sizes?.[0] || 'One Size', 1)}
              className="bg-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-sm hover:bg-amber-400 transition-colors whitespace-nowrap flex-shrink-0">
              + Add
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart size={48} className="mb-4 opacity-30" />
              <p className="font-semibold">Your cart is empty</p>
            </div>
          )}
          {items.map(item => (
            <div key={`${item.id}-${item.selectedVariantId}-${item.size}`} className="flex gap-4 p-3 bg-black/40 rounded-sm">
              <ProductImage product={item} variantImageUrl={item.variantImageUrl}
                className="w-20 h-20 flex-shrink-0 rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm leading-tight">{item.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {item.selectedVariantName && <span>{item.selectedVariantName} · </span>}
                      {item.size}
                    </p>
                  </div>
                  <button onClick={() => onRemove(item.id, item.selectedVariantId, item.size)}
                    className="text-gray-600 hover:text-red-400 transition-colors ml-2"><X size={14} /></button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 border border-gray-700 rounded-sm">
                    <button onClick={() => onUpdate(item.id, item.selectedVariantId, item.size, item.qty - 1)}
                      className="px-2 py-1 hover:text-amber-500"><Minus size={12} /></button>
                    <span className="px-2 text-sm font-bold">{item.qty}</span>
                    <button onClick={() => onUpdate(item.id, item.selectedVariantId, item.size, item.qty + 1)}
                      className="px-2 py-1 hover:text-amber-500"><Plus size={12} /></button>
                  </div>
                  <span className="font-black text-sm">€{((item.salePrice || item.price) * item.qty).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-800 p-6 space-y-4">
            {/* Combo automático aplicado */}
            {combo && (
              <div className="flex items-center gap-2 text-green-400 text-xs bg-green-900/20 border border-green-800/50 rounded-sm p-3">
                <Check size={15} className="flex-shrink-0" />
                <span><span className="font-black">{combo.label} unlocked</span> — you save €{combo.amount.toFixed(2)} + free EU shipping</span>
              </div>
            )}

            {/* Cupão manual — escondido quando há combo (combo tem prioridade) */}
            {!combo && (
              <>
                <div className="flex gap-2">
                  <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)}
                    placeholder={config.discounts?.[0]?.code || 'Coupon code'}
                    className="flex-1 bg-black border border-gray-700 focus:border-amber-500 outline-none px-3 py-2 text-sm rounded-sm text-white placeholder-gray-600" />
                  <button onClick={applyCouponCode} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-bold rounded-sm">Apply</button>
                </div>
                {couponMsg && <p className={`text-xs ${appliedCoupon ? 'text-green-400' : 'text-red-400'}`}>{couponMsg}</p>}
              </>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>€{subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-400"><span>{combo ? combo.label : 'Discount'}</span><span>−€{discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">FREE</span> : `€${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-black text-base border-t border-gray-700 pt-2">
                <span>Total</span><span>€{total.toFixed(2)}</span>
              </div>
            </div>

            {checkoutErr && (
              <div className="flex items-start gap-2 text-red-300 text-xs bg-red-950/40 border border-red-900 rounded-sm p-3">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    {checkoutErr === 'checkout_failed'
                      ? "We couldn't open checkout right now."
                      : 'Checkout is temporarily unavailable.'}
                  </p>
                  <p className="text-red-300/80">
                    Your cart is saved — please try again. If it keeps happening,{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}?subject=Checkout%20issue`}
                      className="underline hover:text-white">contact us</a> and we'll help you order.
                  </p>
                </div>
              </div>
            )}

            <button onClick={handleCheckout} disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-black py-4 rounded-sm transition-colors tracking-wider uppercase text-sm flex items-center justify-center gap-2">
              {loading ? 'Please wait...' : <><span>{checkoutErr ? 'Try again' : 'Checkout'}</span> <ExternalLink size={14} /></>}
            </button>
            <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1"><Shield size={11} /> Secure</span>
              <span className="flex items-center gap-1"><RotateCcw size={11} /> 30 days</span>
              <span className="flex items-center gap-1"><Truck size={11} /> Fast</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
