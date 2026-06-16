import { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage, Badge, PriceDisplay, FLAGS } from '../components/shared';
import { trackEvent } from '../tracking';

const COUNTRY_LABELS = {
  Brazil:    { pt: 'Brasil',    en: 'BRAZIL'    },
  Argentina: { pt: 'Argentina', en: 'ARGENTINA' },
  Germany:   { pt: 'Alemanha',  en: 'GERMANY'   },
  England:   { pt: 'England',   en: 'ENGLAND'   },
  France:    { pt: 'France',    en: 'FRANCE'     },
  Spain:     { pt: 'Spain',     en: 'SPAIN'      },
};

// resolve destino de um link: page id interno ou URL externa
function handleTarget(target, product, onNavigate) {
  if (!target) { if (product) onNavigate('product', product); return; }
  if (/^https?:\/\//.test(target)) { window.open(target, '_blank', 'noreferrer'); return; }
  onNavigate(target);
}

export default function HomePage({ products, config, onNavigate }) {
  const [email, setEmail] = useState('');
  const [emailDone, setEmailDone] = useState(false);
  const [filter, setFilter] = useState('All');
  const { hero, trustBadges } = config;
  const hp = config.homepage || {};
  const editorial = hp.editorial || {};
  const story = hp.story || {};
  const countryImages = Object.fromEntries((hp.countries || []).map(c => [c.key, c.image]));
  const activeCoupon = config.discounts?.find(d => d.active);

  const activeProducts = (products || [])
    .filter(p => p.active)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

  const countriesOrder = (hp.countries || []).map(c => c.key);
  // Países que têm produtos ativos (para tabs do All Drops)
  const activeCountryTabs = [
    'All',
    ...countriesOrder
      .filter(k => activeProducts.some(p => p.country && p.country.toUpperCase() === k.toUpperCase()))
      .map(k => COUNTRY_LABELS[k]?.en || k.toUpperCase()),
    // Países dos produtos que não estão na ordem configurada
    ...activeProducts
      .map(p => p.country)
      .filter(Boolean)
      .filter(c => !countriesOrder.some(k => k.toUpperCase() === c.toUpperCase()))
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .map(c => COUNTRY_LABELS[c]?.en || c.toUpperCase()),
  ];
  const filteredProducts = filter === 'All'
    ? activeProducts
    : activeProducts.filter(p => {
        if (!p.country) return false;
        // compara ignorando capitalização: "Brazil" == "BRAZIL"
        return p.country.toUpperCase() === filter.toUpperCase()
          || (COUNTRY_LABELS[p.country]?.en || '').toUpperCase() === filter.toUpperCase();
      });

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.06 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });

  return (
    <div className="bg-black text-white">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden"
        style={hero.backgroundImage
          ? { backgroundImage: `url(${hero.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
          : { background: '#0a0a0a' }}>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute top-28 left-5 sm:left-10 z-10">
          <span className="inline-flex items-center gap-2 bg-amber-500 text-black text-[10px] font-black tracking-[0.18em] uppercase px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
            World Cup 2026 · Limited Edition
          </span>
        </div>

        <div className="relative z-10 px-5 sm:px-10 pb-14 sm:pb-20 max-w-7xl mx-auto w-full">
          <p className="text-amber-500 text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase mb-3">
            World Cup Heritage Collection
          </p>
          <h1 className="font-black leading-[0.88] tracking-tighter uppercase mb-6"
            style={{ fontSize: 'clamp(2.6rem, 7.5vw, 6.5rem)' }}>
            {hero.title.split(' ').map((word, i, arr) => (
              <span key={i}>
                <span className={i === 1 ? 'text-amber-500' : 'text-white'}>{word}</span>
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-sm mb-8 font-light leading-relaxed">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('shop')}
              className="group inline-flex items-center justify-center sm:justify-start gap-3 bg-white text-black font-black px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-amber-500 transition-colors">
              {hero.ctaPrimary}
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="inline-flex items-center justify-center sm:justify-start gap-2 border border-white/30 text-white font-bold px-8 py-4 text-xs tracking-[0.2em] uppercase hover:border-white transition-colors">
              {hero.ctaSecondary}
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 hidden sm:flex flex-col items-center gap-2 text-white/25 text-[9px] tracking-widest uppercase">
          <div className="w-px h-8 bg-gradient-to-b from-white/25 to-transparent" />
          scroll
        </div>
      </section>

      {/* ─── TRUST BAR ────────────────────────────────────────────────────── */}
      <div className="bg-amber-500 py-3 overflow-hidden">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 px-4 text-black text-[10px] sm:text-xs font-black tracking-[0.15em] uppercase">
          {trustBadges.map((b, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap">
              <Check size={11} strokeWidth={3} /> {b.text}
            </span>
          ))}
        </div>
      </div>

      {/* ─── ESCOLHE O TEU PAÍS ───────────────────────────────────────────── */}
      <section className="bg-black py-14 px-5 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6 reveal">
            <div>
              <p className="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase mb-1">2026 Collection</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Choose your country</h2>
            </div>
            <span className="text-gray-600 text-xs hidden sm:block">scroll →</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0">
            {countriesOrder.map(key => {
              const product = activeProducts.find(p => p.country === key);
              const img = countryImages[key];
              const label = COUNTRY_LABELS[key] || { en: key };
              return (
                <button
                  key={key}
                  onClick={() => onNavigate('shop', null, key)}
                  disabled={!product}
                  className={`snap-start flex-shrink-0 w-[150px] sm:w-auto sm:flex-1 relative overflow-hidden group transition-all aspect-[3/4]
                    ${product ? 'cursor-pointer' : 'opacity-40 cursor-default'}`}>
                  {img ? (
                    <>
                      <img src={img} alt={label.en} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                      <span className="text-5xl">{FLAGS[key] || '⚽'}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <span className="font-black text-sm uppercase tracking-wider block leading-tight">{label.en}</span>
                    {product && (
                      <span className="text-white/70 text-[10px] group-hover:text-amber-500 transition-colors mt-1 inline-flex items-center gap-1">
                        view collection <ArrowRight size={10} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TODOS OS DROPS (carrossel) ───────────────────────────────────── */}
      <section className="bg-black pb-20 px-5 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 reveal">
            <div>
              <p className="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase mb-1">The Full Collection</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">All drops</h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-amber-500 transition-colors">
              View shop <ArrowRight size={13} />
            </button>
          </div>

          {/* filtros */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
            {activeCountryTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-shrink-0 px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] border transition-colors
                  ${filter === tab ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-500 hover:border-gray-500 hover:text-gray-200'}`}>
                {tab}
              </button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            <DropsCarousel products={filteredProducts} onNavigate={onNavigate} />
          ) : (
            <div className="py-20 text-center text-gray-600 text-sm">No active products in this category.</div>
          )}
        </div>
      </section>

      {/* ─── EDITORIAL "500" (imagem/vídeo editável) ──────────────────────── */}
      <section className="relative overflow-hidden">
        {/* fundo: vídeo, imagem ou branco */}
        {editorial.mediaType === 'video' && editorial.mediaUrl ? (
          <EditorialVideo src={editorial.mediaUrl} />
        ) : editorial.mediaType === 'image' && editorial.mediaUrl ? (
          <img src={editorial.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}

        {/* overlay para legibilidade quando há mídia */}
        {editorial.mediaType !== 'none' && editorial.mediaUrl && (
          <div className="absolute inset-0 bg-black/60" />
        )}

        <div className={`relative z-10 py-24 sm:py-32 px-5 sm:px-10 ${editorial.mediaType === 'none' || !editorial.mediaUrl ? 'bg-white text-black' : 'text-white'}`}>
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-10 items-center">
            <div className="reveal">
              <p
                className={`font-black leading-none tracking-tighter select-none ${editorial.mediaType === 'none' || !editorial.mediaUrl ? 'text-black/[0.07]' : 'text-white/15'}`}
                style={{ fontSize: 'clamp(6rem, 20vw, 16rem)' }}>
                500
              </p>
            </div>
            <div className="reveal" style={{ transitionDelay: '120ms' }}>
              <p className={`text-[10px] font-black tracking-[0.3em] uppercase mb-4 ${editorial.mediaType === 'none' || !editorial.mediaUrl ? 'text-gray-500' : 'text-amber-500'}`}>
                {editorial.eyebrow}
              </p>
              <h2 className="text-4xl sm:text-5xl font-black uppercase leading-tight tracking-tight mb-5">
                {editorial.titleLine1}<br />{editorial.titleLine2}
              </h2>
              <p className={`text-base leading-relaxed mb-8 max-w-xs ${editorial.mediaType === 'none' || !editorial.mediaUrl ? 'text-gray-600' : 'text-gray-300'}`}>
                {editorial.text}
              </p>
              <button
                onClick={() => handleTarget(editorial.ctaTarget, null, onNavigate)}
                className={`group inline-flex items-center gap-3 font-black px-8 py-4 text-xs tracking-[0.2em] uppercase transition-colors
                  ${editorial.mediaType === 'none' || !editorial.mediaUrl
                    ? 'bg-black text-white hover:bg-amber-500 hover:text-black'
                    : 'bg-white text-black hover:bg-amber-500'}`}>
                {editorial.ctaLabel}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOSSA HISTÓRIA (imagens + links editáveis) ───────────────────── */}
      <section className="bg-black grid md:grid-cols-2 min-h-[70vh]">
        <div className="grid grid-cols-2 min-h-[300px] md:min-h-0">
          {[0, 1, 2, 3].map(i => {
            const product = activeProducts[i];
            const customImg = story.images?.[i];
            const customLink = story.imageLinks?.[i];
            return (
              <button
                key={i}
                onClick={() => handleTarget(customLink, product, onNavigate)}
                className="relative overflow-hidden group bg-gray-900">
                {customImg ? (
                  <img src={customImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : product ? (
                  <ProductImage product={product} variantImageUrl={product.variants?.[0]?.imageUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">⚽</div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </button>
            );
          })}
        </div>

        <div className="flex flex-col justify-center px-8 sm:px-14 py-16 reveal">
          <p className="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase mb-5">{story.eyebrow}</p>
          <h2 className="text-4xl sm:text-5xl font-black uppercase leading-tight tracking-tight mb-5 whitespace-pre-line">
            {story.title}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-3 max-w-sm">{story.text1}</p>
          <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-sm">{story.text2}</p>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {[['500', 'per design'], ['EU', 'printed'], ['30 days', 'returns']].map(([n, l]) => (
              <div key={l} className="border border-gray-800 p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-black text-amber-500">{n}</div>
                <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">{l}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleTarget(story.ctaTarget, null, onNavigate)}
            className="group self-start inline-flex items-center gap-3 border border-gray-700 text-white font-bold px-7 py-3.5 text-xs tracking-[0.2em] uppercase hover:border-amber-500 hover:text-amber-500 transition-colors">
            {story.ctaLabel}
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ─── FREE SHIPPING + BUNDLES ──────────────────────────────────────── */}
      <section className="bg-gray-950 py-20 px-5 sm:px-10 border-t border-gray-900">
        <div className="max-w-3xl mx-auto text-center reveal">
          <p className="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase mb-3">Build Your Kit</p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">
            Free shipping on every bundle
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Pair your favourite tee with a tote, or pick two designs at once — every bundle ships
            free across Europe. An independent football brand, built piece by piece.
          </p>
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="relative bg-amber-500 py-20 sm:py-24 px-5 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#000 0,#000 1px,transparent 0,transparent 50%)', backgroundSize: '14px 14px' }} />
        <div className="relative z-10 max-w-lg mx-auto text-center reveal">
          <p className="text-black/50 text-[10px] font-black tracking-[0.3em] uppercase mb-3">No spam. Just drops.</p>
          <h2 className="text-4xl sm:text-5xl font-black text-black uppercase leading-tight tracking-tight mb-3">
            Join the<br />archive
          </h2>
          {activeCoupon && (
            <p className="text-black/60 text-sm mb-8">
              Sign up and get <strong>{activeCoupon.percent}% off</strong> your first order.
            </p>
          )}
          {!emailDone ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                trackEvent('Lead', {
                  content_name: 'home_email',
                  content_type: 'newsletter',
                }, email);
                setEmailDone(true);
              }}
              className="flex flex-col sm:flex-row gap-2">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your email"
                className="flex-1 px-4 py-4 bg-black/10 border border-black/20 text-black placeholder-black/40 outline-none focus:border-black/50 transition-colors text-sm min-w-0" />
              <button type="submit"
                className="bg-black text-white font-black px-8 py-4 uppercase tracking-[0.15em] text-xs hover:bg-gray-900 transition-colors whitespace-nowrap">
                Subscribe →
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-3 text-black font-black">
              <Check size={20} strokeWidth={3} /> Done{activeCoupon ? ` — code ${activeCoupon.code} sent` : ''}!
            </div>
          )}
        </div>
      </section>

      {/* ─── BLOCO SEO ────────────────────────────────────────────────────── */}
      <section className="bg-black border-t border-gray-900 py-16 px-5 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-6">Retro Mundial — Retro Football Shirts</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-xs text-gray-700 leading-relaxed">
            <p>Retro Mundial creates premium oversized shirts inspired by the greatest moments in football history — Brazil, Argentina, Germany, England, France and Spain. Each design celebrates a golden generation of world football, printed on demand in Europe on soft, premium-weight fabric.</p>
            <p>Each collection is limited to 500 units. No restocks, no second run. Made for collectors, football fans and anyone who wants streetwear with a story. Shipping across Europe. Free delivery on orders over €50.</p>
            <p>World Cup 2026 retro shirt · Brazil retro football shirt · Argentina retro shirt · Premium football streetwear · Oversized football shirt · Heritage football apparel · Limited edition football shirts.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

// ─── CARROSSEL DE PRODUTOS (horizontal, com barra e setas) ─────────────────────

function DropsCarousel({ products, onNavigate }) {
  const scroller = useRef(null);
  const [progress, setProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  function update() {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScroll(max > 4);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [products.length]);

  function scrollBy(dir) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  }

  // arrastar a barra inferior
  function onTrackClick(e) {
    const el = scroller.current;
    const track = e.currentTarget;
    if (!el) return;
    const rect = track.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: ratio * max, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {/* setas (desktop) */}
      {canScroll && (
        <>
          <button onClick={() => scrollBy(-1)}
            className="hidden sm:flex absolute -left-3 top-[38%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white text-black hover:bg-amber-500 transition-colors shadow-lg">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scrollBy(1)}
            className="hidden sm:flex absolute -right-3 top-[38%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white text-black hover:bg-amber-500 transition-colors shadow-lg">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* trilho de scroll */}
      <div
        ref={scroller}
        className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 pb-1">
        {products.map(product => (
          <div key={product.id} className="snap-start flex-shrink-0 w-[68%] sm:w-[calc(33.333%-0.84rem)]">
            <ProductCard product={product} onNavigate={onNavigate} />
          </div>
        ))}
      </div>

      {/* barra de progresso arrastável */}
      {canScroll && (
        <div className="mt-6 px-1">
          <div onClick={onTrackClick} className="relative h-1 bg-gray-800 cursor-pointer rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-amber-500 rounded-full transition-[width] duration-150"
              style={{ width: `${Math.max(15, progress * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({ product, onNavigate }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // Fotos admin (max 4, sem Shopify CDN) + fotos de variantes de cor
  const adminImgs = (product.images || [])
    .filter(u => u && !u.includes('cdn.shopify.com'))
    .slice(0, 4);
  const variantImgs = (product.variants || []).map(v => v.imageUrl).filter(Boolean);
  const allImages = [...new Map([...adminImgs, ...variantImgs].map(u => [u, u])).values()];

  useEffect(() => {
    if (isHovered && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setImgIdx(i => (i + 1) % allImages.length);
      }, 1800);
    } else {
      clearInterval(intervalRef.current);
      if (!isHovered) setImgIdx(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovered, allImages.length]);

  const displayImage = allImages[imgIdx] || null;
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;

  return (
    <div className="group">
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: '3/4' }}
        onClick={() => onNavigate('product', product)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ProductImage product={product} variantImageUrl={displayImage}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && <Badge label={product.badge} colorClass={product.badgeColor} />}
          {discount && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5">-{discount}%</span>}
        </div>

        {product.stock != null && product.stock <= 11 && (
          <div className="absolute top-3 right-3 bg-black/80 px-2 py-1">
            <span className="text-[10px] text-amber-400 font-bold">Only {product.stock}</span>
          </div>
        )}

        {/* Dots de navegação — aparecem no hover quando há mais de 1 foto */}
        {allImages.length > 1 && (
          <div className={`absolute bottom-8 left-0 right-0 flex justify-center gap-1.5 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {allImages.map((_, i) => (
              <button key={i}
                onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-amber-500' : 'bg-white/60'}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 bg-white text-black text-[10px] font-black py-3 text-center tracking-[0.2em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          View Product
        </div>
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm cursor-pointer hover:text-amber-500 transition-colors line-clamp-2 leading-tight"
            onClick={() => onNavigate('product', product)}>
            {product.name}
          </h3>
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        </div>
      </div>
    </div>
  );
}

// Componente isolado para vídeo de fundo — evita que re-renders do config
// interrompam o buffering. Chama .play() explicitamente para garantir
// autoplay em mobile (iOS/Android bloqueiam o atributo autoPlay do React).
function EditorialVideo({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      key={src}
      className="absolute inset-0 w-full h-full object-cover"
      src={src}
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
