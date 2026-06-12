import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Shield, Truck, RotateCcw, Check, ExternalLink } from 'lucide-react';
import { ProductImage, Stars, Badge, PriceDisplay } from '../components/shared';
import { checkoutWithVariant } from '../shopify';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductPage({ product, config, onNavigate, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Atualiza imagem quando muda a variante
  useEffect(() => {
    setImgIdx(0);
  }, [selectedVariant]);

  // Rastreamento Meta Pixel
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_type: 'product',
        content_ids: [product.shopifyProductId || product.id],
        value: product.compareAtPrice || product.price,
        currency: 'EUR',
      });
    }
  }, [product]);

  // Galeria: imagem da variante selecionada + imagens extras do produto
  const galleryImages = [
    selectedVariant?.imageUrl || product.images?.[0] || null,
    ...(product.images || []).filter(img => img !== selectedVariant?.imageUrl),
  ].filter(Boolean);

  const currentImage = galleryImages[imgIdx] || null;

  function handleAddToCart() {
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_type: 'product',
        content_ids: [selectedVariant?.shopifyVariantId || product.id],
        value: product.price * qty,
        currency: 'EUR',
        num_items: qty,
      });
    }
    onAddToCart(product, selectedVariant, selectedSize, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleBuyNow() {
    const { shopifyDomain, shopifyToken } = config.integrations || {};
    setCheckingOut(true);

    // Track InitiateCheckout event
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: product.name,
        content_type: 'product',
        content_ids: [selectedVariant?.shopifyVariantId || product.id],
        value: product.price * qty,
        currency: 'EUR',
        num_items: qty,
      });
    }

    if (shopifyDomain && shopifyToken && selectedVariant?.shopifyVariantId) {
      try {
        const url = await checkoutWithVariant(shopifyDomain, shopifyToken, selectedVariant.shopifyVariantId, qty);
        window.open(url, '_blank');
        setCheckingOut(false);
        return;
      } catch (e) {
        console.warn('Checkout error:', e);
      }
    }

    // Fallback: abre a página do produto no Shopify
    const domain = shopifyDomain || 'retromundial.myshopify.com';
    window.open(`https://${domain.replace('https://','')}${product.shopifyUrl ? '' : `/products/${product.handle}`}${product.shopifyUrl || ''}`, '_blank');
    setCheckingOut(false);
  }

  const relatedProducts = (config.products || [])
    .filter(p => p.active && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-black pt-20 pb-32 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 py-4 sm:py-6 flex-wrap">
          <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Home</button>
          <ChevronRight size={12} />
          <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Shop</button>
          <ChevronRight size={12} />
          <span className="text-gray-300 truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12 lg:gap-20">
          {/* ── GALERIA ── */}
          <div>
            {/* Imagem principal */}
            <div className="relative overflow-hidden rounded-sm aspect-square bg-gray-900 sticky top-24 md:top-0">
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ProductImage product={product} variantImageUrl={selectedVariant?.imageUrl}
                  className="w-full h-full" />
              )}

              {/* Navegação da galeria */}
              {galleryImages.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black p-2 rounded-full transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % galleryImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black p-2 rounded-full transition-colors">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {galleryImages.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-amber-500' : 'bg-gray-600'}`} />
                    ))}
                  </div>
                </>
              )}

              {/* Badge de desconto */}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-black px-3 py-1.5 rounded-sm">
                  -{Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {galleryImages.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-amber-500' : 'border-gray-700'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── DETALHES ── */}
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge label={product.badge} colorClass={product.badgeColor} />
              {product.stock <= 15 && (
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wide animate-pulse">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-2">
              {product.copy?.headline || product.name}
            </h1>
            <p className="text-gray-400 text-base mb-4">
              {product.copy?.subtitle || 'Limited edition · 500 units'}
            </p>

            <div className="flex items-center gap-3 mb-6">
              <Stars rating={4.9} />
              <span className="text-sm font-bold">4.9</span>
              <span className="text-gray-400 text-sm">(Verified Reviews)</span>
            </div>

            <div className="mb-6">
              <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-green-400 text-xs mt-1 font-bold">
                  Save €{(product.compareAtPrice - product.price).toFixed(2)}
                </p>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 text-sm">
              {product.copy?.description || product.desc || ''}
            </p>

            {/* Bullets */}
            {product.copy?.bullets?.length > 0 && (
              <ul className="space-y-2 mb-6">
                {product.copy.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* ── COR ── */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-wide mb-3">
                  Cor: <span className="text-amber-500 font-black">{selectedVariant?.name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} title={v.name}
                      disabled={!v.inStock}
                      className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                        selectedVariant?.id === v.id ? 'border-amber-500 scale-110' : 'border-gray-600 hover:border-gray-400'
                      } ${!v.inStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: v.hex }}>
                      {!v.inStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-px bg-gray-400 rotate-45 block" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedVariant?.inStock && (
                  <p className="text-red-400 text-xs mt-2">This colour is sold out.</p>
                )}
              </div>
            )}

            {/* ── TAMANHO ── */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold uppercase tracking-wide">
                  Size: <span className="text-amber-500">{selectedSize}</span>
                </p>
                <button onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  Size guide {sizeGuideOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(product.sizes || SIZES).map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 text-sm font-bold rounded-sm transition-all ${
                      selectedSize === s
                        ? 'bg-amber-500 text-black border-2 border-amber-500'
                        : 'border border-gray-600 hover:border-gray-400 text-gray-300'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>

              {sizeGuideOpen && (
                <div className="mt-4 p-4 bg-gray-900 rounded-sm text-sm overflow-x-auto">
                  <table className="w-full text-xs min-w-[300px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="py-2 text-left font-bold">Size</th>
                        <th className="py-2 font-bold">Chest</th>
                        <th className="py-2 font-bold">Length</th>
                        <th className="py-2 font-bold">Shoulder</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {[['XS','96cm','68cm','44cm'],['S','100cm','70cm','46cm'],['M','104cm','72cm','48cm'],['L','110cm','74cm','51cm'],['XL','116cm','76cm','54cm'],['XXL','122cm','78cm','57cm']].map(r => (
                        <tr key={r[0]} className="border-b border-gray-800">
                          <td className="py-2 font-bold">{r[0]}</td>
                          <td className="py-2 text-center">{r[1]}</td>
                          <td className="py-2 text-center">{r[2]}</td>
                          <td className="py-2 text-center">{r[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-gray-500 mt-3 text-xs">Oversized cut — size down if you prefer a slimmer fit.</p>
                </div>
              )}
            </div>

            {/* ── QTD + CTAs ── */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-gray-700 rounded-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 hover:text-amber-500 transition-colors">
                  <ChevronLeft size={16} style={{transform:'rotate(90deg)'}} />
                </button>
                <span className="px-4 font-black text-lg">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="px-4 py-3 hover:text-amber-500 transition-colors">
                  <ChevronRight size={16} style={{transform:'rotate(90deg)'}} />
                </button>
              </div>
              <button onClick={handleAddToCart}
                className={`flex-1 font-black py-3 text-sm tracking-widest uppercase rounded-sm transition-all ${
                  added ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100 text-black'
                }`}>
                {added ? '✓ Added!' : 'Add to Cart'}
              </button>
            </div>

            <button onClick={handleBuyNow} disabled={checkingOut}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-black py-4 rounded-sm transition-all tracking-widest uppercase text-sm flex items-center justify-center gap-2 mb-6">
              {checkingOut ? 'Please wait...' : <><span>{product.copy?.cta || 'Buy Now'}</span> <ExternalLink size={14} /></>}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[[RotateCcw,'30 Days','Free returns'],[Truck,'Free Shipping','Orders over €50'],[Shield,'100% Secure','256-bit SSL']].map(([Icon,t,s]) => (
                <div key={t} className="bg-gray-900 p-3 rounded-sm text-center">
                  <Icon size={18} className="text-amber-500 mx-auto mb-1.5" />
                  <div className="text-xs font-bold">{t}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s}</div>
                </div>
              ))}
            </div>

            {/* Specs */}
            <div className="border-t border-gray-800 pt-5">
              <h3 className="font-black text-xs uppercase tracking-widest mb-4">Specifications</h3>
              <div className="space-y-2">
                {[['Material','100% Organic Cotton GOTS'],['Cut','Oversized — size down for a regular fit'],['Edition','Limited · 500 numbered units'],['Print','Heritage, premium screen print'],['Care','Cold wash, dry in shade']].map(([k,v]) => (
                  <div key={k} className="flex gap-4 text-sm">
                    <span className="text-gray-500 w-20 flex-shrink-0">{k}</span>
                    <span className="text-gray-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Frequently asked questions */}
        <div className="border-t border-gray-800 mt-20 pt-14">
          <h2 className="text-2xl sm:text-3xl font-black mb-8">Frequently Asked</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
            {[
              { q: 'Is this shirt true to size?', a: 'Our shirts are oversized. If you prefer a regular fit, we recommend sizing down one size.' },
              { q: 'How should I care for my shirt?', a: 'Wash in cold water with similar colors. Dry in the shade. Avoid bleach and high heat to preserve the print.' },
              { q: 'What about international shipping?', a: 'We ship to all European countries. Orders over €50 qualify for free shipping.' },
              { q: 'What is your return policy?', a: 'Full returns within 30 days. No questions asked. We cover return shipping costs.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="pb-6 border-b border-gray-800">
                <h3 className="font-bold mb-2 text-sm">{q}</h3>
                <p className="text-gray-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* You might also like */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl sm:text-3xl font-black mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map(p => (
                <RelatedCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800 p-3">
        <button onClick={handleBuyNow} disabled={checkingOut}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 text-sm tracking-widest uppercase rounded-sm transition-colors">
          {checkingOut ? 'Please wait...' : `${product.copy?.cta || 'Buy Now'} — €${product.price.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

function RelatedCard({ product, onNavigate }) {
  return (
    <div className="group cursor-pointer" onClick={() => onNavigate('product', product)}>
      <div className="relative overflow-hidden rounded-sm aspect-[3/4] bg-gray-900">
        <ProductImage product={product} variantImageUrl={product.variants?.[0]?.imageUrl}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-sm">
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </div>
        )}
      </div>
      <div className="pt-3">
        <h3 className="font-black group-hover:text-amber-500 transition-colors">{product.name}</h3>
        <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
      </div>
    </div>
  );
}
