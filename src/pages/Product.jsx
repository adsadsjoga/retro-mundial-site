import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Shield, Truck, RotateCcw, Check, ExternalLink } from 'lucide-react';
import { ProductImage, Stars, Badge, PriceDisplay } from '../components/shared';
import { checkoutWithVariant } from '../shopify';
import { trackEvent } from '../tracking';

export default function ProductPage({ product, config, onNavigate, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const availableSizes = product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL', '2XL'];
  const [selectedSize, setSelectedSize] = useState(availableSizes.includes('M') ? 'M' : availableSizes[0]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Só muda o índice quando o USUÁRIO troca de cor (ignora o mount inicial)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const imgs = (product.images || []).filter(u => u && !u.includes('cdn.shopify.com')).slice(0, 4);
    const vImg = selectedVariant?.imageUrl || null;
    if (vImg && !imgs.includes(vImg)) {
      setImgIdx(imgs.length + (product.videoUrl ? 1 : 0));
    } else {
      setImgIdx(0);
    }
  }, [selectedVariant]);

  // Rastreamento Meta (Pixel + Conversions API com deduplicação)
  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: product.name,
      content_type: 'product',
      content_ids: [product.shopifyProductId || product.id],
      value: product.compareAtPrice || product.price,
      currency: 'EUR',
    });
  }, [product]);

  // Galeria: 4 fotos admin em ordem + vídeo (se existir)
  // Se o admin carregou fotos, mostra só elas. Se não, cai no variant image.
  // Quando o cliente seleciona uma cor, o slot 0 troca para a foto dessa cor
  // (só se for uma imagem do Cloudinary, não do Shopify CDN).
  // Galeria: slots 1-4 = fotos admin, slot 5 = vídeo, último = imagem da cor selecionada
  const adminImages = (product.images || []).filter(url => url && !url.includes('cdn.shopify.com')).slice(0, 4);
  const variantImg = selectedVariant?.imageUrl || null;
  const galleryItems = [
    ...adminImages.map(url => ({ type: 'image', url })),
    ...(product.videoUrl ? [{ type: 'video', url: product.videoUrl }] : []),
    ...(variantImg && !adminImages.includes(variantImg) ? [{ type: 'image', url: variantImg }] : []),
  ].filter(item => item.url);

  const currentItem = galleryItems[imgIdx] || galleryItems[0] || null;

  // Resolve o variant ID correto para a combinação cor+tamanho selecionada
  function resolvedVariant() {
    const correctId = product.variantsByColorSize?.[`${selectedVariant?.name}/${selectedSize}`]
      || selectedVariant?.shopifyVariantId;
    return { ...selectedVariant, shopifyVariantId: correctId };
  }

  function handleAddToCart() {
    // O evento AddToCart é disparado em App.addToCart (onAddToCart) — evita duplicação
    onAddToCart(product, resolvedVariant(), selectedSize, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleBuyNow() {
    const { shopifyDomain, shopifyToken } = config.integrations || {};
    setCheckingOut(true);

    trackEvent('InitiateCheckout', {
      content_name: product.name,
      content_type: 'product',
      content_ids: [selectedVariant?.shopifyVariantId || product.id],
      value: product.price * qty,
      currency: 'EUR',
      num_items: qty,
    });

    const variant = resolvedVariant();
    if (shopifyDomain && shopifyToken && variant?.shopifyVariantId) {
      try {
        const url = await checkoutWithVariant(shopifyDomain, shopifyToken, variant.shopifyVariantId, qty);
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
    <div className="min-h-screen bg-black pt-16 pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] text-gray-500 py-3 sm:py-5 flex-wrap">
          <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Home</button>
          <ChevronRight size={10} />
          <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Shop</button>
          <ChevronRight size={10} />
          <span className="text-gray-300 truncate max-w-[180px] sm:max-w-none">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-12 lg:gap-20">
          {/* ── GALERIA ── */}
          <div>
            {/* Imagem / Vídeo principal */}
            <div className="relative overflow-hidden rounded-sm aspect-square bg-gray-900">
              {currentItem?.type === 'video' ? (
                <ProductVideo src={currentItem.url} />
              ) : currentItem?.url ? (
                <img src={currentItem.url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ProductImage product={product} variantImageUrl={selectedVariant?.imageUrl}
                  className="w-full h-full" />
              )}

              {/* Navegação da galeria */}
              {galleryItems.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + galleryItems.length) % galleryItems.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black p-1.5 rounded-full transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % galleryItems.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black p-1.5 rounded-full transition-colors">
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {galleryItems.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-amber-500' : 'bg-gray-600'}`} />
                    ))}
                  </div>
                </>
              )}

              {/* Badge de desconto */}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-sm">
                  -{Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryItems.length > 1 && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {galleryItems.map((item, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-sm overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-amber-500' : 'border-gray-700'}`}>
                    {item.type === 'video'
                      ? <div className="w-full h-full bg-gray-800 flex items-center justify-center text-lg">▶</div>
                      : <img src={item.url} alt="" className="w-full h-full object-cover" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── DETALHES ── */}
          <div className="mt-1 md:mt-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge label={product.badge} colorClass={product.badgeColor} />
              {product.stock <= 15 && (
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wide animate-pulse">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-1">
              {product.copy?.headline || product.name}
            </h1>
            <p className="text-gray-400 text-sm mb-3">
              {product.copy?.subtitle || 'Limited edition · 500 units'}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <Stars rating={4.9} />
              <span className="text-sm font-bold">4.9</span>
              <span className="text-gray-500 text-xs">(Verified)</span>
            </div>

            <div className="mb-4">
              <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-green-400 text-xs mt-0.5 font-bold">
                  Save €{(product.compareAtPrice - product.price).toFixed(2)}
                </p>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed mb-4 text-sm">
              {product.copy?.description || product.desc || ''}
            </p>

            {/* Bullets */}
            {product.copy?.bullets?.length > 0 && (
              <ul className="space-y-1.5 mb-4">
                {product.copy.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* ── COR ── */}
            {product.variants?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wide mb-2">
                  Cor: <span className="text-amber-500">{selectedVariant?.name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} title={v.name}
                      disabled={!v.inStock}
                      className={`w-9 h-9 rounded-full border-2 transition-all relative ${
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
                  <p className="text-red-400 text-xs mt-1">This colour is sold out.</p>
                )}
              </div>
            )}

            {/* ── TAMANHO ── */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold uppercase tracking-wide">
                  Size: <span className="text-amber-500">{selectedSize}</span>
                </p>
                <button onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                  Size guide {sizeGuideOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {availableSizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`w-11 h-11 text-sm font-bold rounded-sm transition-all ${
                      selectedSize === s
                        ? 'bg-amber-500 text-black border-2 border-amber-500'
                        : 'border border-gray-600 hover:border-gray-400 text-gray-300'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>

              {sizeGuideOpen && (
                <div className="mt-3 p-3 bg-gray-900 rounded-sm text-sm overflow-x-auto">
                  <table className="w-full text-xs" style={{minWidth:'260px'}}>
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="py-1.5 text-left font-bold">Size</th>
                        <th className="py-1.5 font-bold">Chest</th>
                        <th className="py-1.5 font-bold">Length</th>
                        <th className="py-1.5 font-bold">Shoulder</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {[['S','100cm','70cm','46cm'],['M','104cm','72cm','48cm'],['L','110cm','74cm','51cm'],['XL','116cm','76cm','54cm'],['2XL','122cm','78cm','57cm']].map(r => (
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
            <div className="flex gap-2 mb-3">
              <div className="flex items-center border border-gray-700 rounded-sm flex-shrink-0">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:text-amber-500 transition-colors">
                  <ChevronLeft size={14} style={{transform:'rotate(90deg)'}} />
                </button>
                <span className="px-3 font-black">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="px-3 py-2.5 hover:text-amber-500 transition-colors">
                  <ChevronRight size={14} style={{transform:'rotate(90deg)'}} />
                </button>
              </div>
              <button onClick={handleAddToCart}
                className={`flex-1 font-black py-2.5 text-xs tracking-widest uppercase rounded-sm transition-all ${
                  added ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100 text-black'
                }`}>
                {added ? '✓ Added!' : 'Add to Cart'}
              </button>
            </div>

            {/* Buy Now — só visível no desktop (mobile usa o sticky bottom) */}
            <button onClick={handleBuyNow} disabled={checkingOut}
              className="hidden md:flex w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-black py-3.5 rounded-sm transition-all tracking-widest uppercase text-sm items-center justify-center gap-2 mb-5">
              {checkingOut ? 'Please wait...' : <><span>{product.copy?.cta || 'Buy Now'}</span> <ExternalLink size={14} /></>}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[[RotateCcw,'30 Days','Free returns'],[Truck,'Free Ship','Over €50'],[Shield,'Secure','256-bit SSL']].map(([Icon,t,s]) => (
                <div key={t} className="bg-gray-900 p-2 rounded-sm text-center">
                  <Icon size={15} className="text-amber-500 mx-auto mb-1" />
                  <div className="text-[10px] font-bold leading-tight">{t}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5 leading-tight">{s}</div>
                </div>
              ))}
            </div>

            {/* Specs */}
            <div className="border-t border-gray-800 pt-4">
              <h3 className="font-black text-xs uppercase tracking-widest mb-3">Specifications</h3>
              <div className="space-y-1.5">
                {[['Material','100% Organic Cotton GOTS'],['Cut','Oversized — size down for regular fit'],['Edition','Limited · 500 units'],['Print','Premium screen print'],['Care','Cold wash, dry in shade']].map(([k,v]) => (
                  <div key={k} className="flex gap-3 text-xs">
                    <span className="text-gray-500 w-16 flex-shrink-0">{k}</span>
                    <span className="text-gray-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ — oculto em mobile para não estender demais a página */}
        <div className="hidden sm:block border-t border-gray-800 mt-16 pt-12">
          <h2 className="text-2xl font-black mb-6">Frequently Asked</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            {[
              { q: 'Is this shirt true to size?', a: 'Our shirts are oversized. Size down for a regular fit.' },
              { q: 'How should I care for my shirt?', a: 'Cold wash, dry in shade. Avoid bleach and high heat.' },
              { q: 'What about international shipping?', a: 'We ship across Europe. Orders over €50 ship free.' },
              { q: 'What is your return policy?', a: 'Full returns within 30 days. No questions asked.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="pb-5 border-b border-gray-800">
                <h3 className="font-bold mb-1.5 text-sm">{q}</h3>
                <p className="text-gray-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* You might also like */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-black mb-5">You Might Also Like</h2>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
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

function ProductVideo({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [src]);
  return (
    <video ref={ref} key={src} src={src}
      className="w-full h-full object-cover"
      muted loop playsInline preload="auto" />
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
