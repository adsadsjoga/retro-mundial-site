import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Truck, Shield, RotateCcw, ExternalLink } from 'lucide-react';
import { ProductImage } from './shared';
import { checkoutWithVariant } from '../shopify';

export default function Cart({ items, config, onClose, onUpdate, onRemove }) {
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const freeShip = config.site?.freeShippingThreshold || 50;
  const subtotal = items.reduce((s, i) => s + (i.salePrice || i.price) * i.qty, 0);
  const discount = appliedCoupon ? subtotal * (appliedCoupon.percent / 100) : 0;
  const shipping = subtotal - discount >= freeShip ? 0 : 4.99;
  const total = subtotal - discount + shipping;

  function applyCouponCode() {
    const found = config.discounts?.find(d => d.active && d.code.toUpperCase() === coupon.toUpperCase());
    if (found) { setAppliedCoupon(found); setCouponMsg(`✓ ${found.label} aplicado!`); }
    else setCouponMsg('Cupom inválido.');
  }

  async function handleCheckout() {
    const { shopifyDomain, shopifyToken } = config.integrations || {};
    setLoading(true);

    // Tenta checkout via Shopify Storefront API
    if (shopifyDomain && shopifyToken && items[0]?.shopifyVariantId) {
      try {
        // Para múltiplos itens, usamos apenas o primeiro variant como exemplo
        // Em produção, criar um cart com todos os items
        const url = await checkoutWithVariant(shopifyDomain, shopifyToken, items[0].shopifyVariantId, items[0].qty);
        window.open(url, '_blank');
        setLoading(false);
        return;
      } catch (e) {
        console.warn('Shopify checkout error, falling back:', e);
      }
    }

    // Fallback: redireciona para o domínio Shopify
    const domain = shopifyDomain?.replace('.myshopify.com', '') || 'retromundial';
    window.open(`https://${domain}.myshopify.com/cart`, '_blank');
    setLoading(false);
  }

  if (window.fbq) window.fbq('track', 'ViewCart');

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-black">SEU CARRINHO</h2>
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
            <div className="flex gap-2">
              <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)}
                placeholder={config.discounts?.[0]?.code || 'Coupon code'}
                className="flex-1 bg-black border border-gray-700 focus:border-amber-500 outline-none px-3 py-2 text-sm rounded-sm text-white placeholder-gray-600" />
              <button onClick={applyCouponCode} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-bold rounded-sm">Apply</button>
            </div>
            {couponMsg && <p className={`text-xs ${appliedCoupon ? 'text-green-400' : 'text-red-400'}`}>{couponMsg}</p>}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>€{subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>−€{discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">FREE</span> : `€${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-black text-base border-t border-gray-700 pt-2">
                <span>Total</span><span>€{total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-black py-4 rounded-sm transition-colors tracking-wider uppercase text-sm flex items-center justify-center gap-2">
              {loading ? 'Please wait...' : <><span>Checkout</span> <ExternalLink size={14} /></>}
            </button>
            <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1"><Shield size={11} /> Seguro</span>
              <span className="flex items-center gap-1"><RotateCcw size={11} /> 30 dias</span>
              <span className="flex items-center gap-1"><Truck size={11} /> Rápido</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
