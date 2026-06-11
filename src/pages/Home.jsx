import { useState, useEffect } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { ProductImage, Badge, PriceDisplay, Stars } from '../components/shared';

export default function HomePage({ products, config, onNavigate, onAddToCart }) {
  const [email, setEmail] = useState('');
  const [emailDone, setEmailDone] = useState(false);
  const { hero, trustBadges } = config;
  const activeProducts = (products || []).filter(p => p.active);
  const activeCoupon = config.discounts?.find(d => d.active);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden"
        style={hero.backgroundImage ? { backgroundImage: `url(${hero.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        {hero.backgroundImage && <div className="absolute inset-0 bg-black/60" />}
        {!hero.backgroundImage && (
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg,#F59E0B 0,#F59E0B 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 pt-24 pb-16">
          <div className="inline-flex items-center gap-2 border border-amber-500/40 text-amber-500 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-sm mb-8">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            World Cup Heritage Collection
          </div>

          <h1 className="text-6xl sm:text-8xl lg:text-[9rem] font-black leading-none tracking-tighter mb-6">
            {hero.title.split(' ').map((word, i) => (
              <span key={i}>
                {i === 1 ? <span className="text-amber-500">{word}</span> : word}
                {i < hero.title.split(' ').length - 1 ? <br /> : ''}
              </span>
            ))}
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-light">{hero.subtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => onNavigate('shop')}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 text-sm tracking-widest uppercase transition-all hover:scale-105 rounded-sm">
              {hero.ctaPrimary} →
            </button>
            <button onClick={() => onNavigate('story')}
              className="border border-white/40 hover:border-white text-white font-bold px-10 py-4 text-sm tracking-widest uppercase transition-all hover:bg-white/5 rounded-sm">
              {hero.ctaSecondary}
            </button>
          </div>

          <div className="mt-16 flex flex-col items-center gap-2 text-gray-600 text-xs tracking-widest uppercase">
            <span>Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-gray-600 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-amber-500 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-black text-sm font-black tracking-wide uppercase">
            {trustBadges.map((b, i) => (
              <span key={i} className="flex items-center gap-2"><Check size={14} /> {b.text}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUTOS ── */}
      <section className="bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="scroll-reveal text-center mb-16">
            <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">A Coleção</div>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight">TODAS AS PEÇAS</h2>
            <p className="text-gray-400 mt-3">Edições limitadas · 500 unidades · Devolução grátis</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProducts.map(product => (
              <HomeProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="bg-gray-900 py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">Nossa História</div>
            <h2 className="text-5xl font-black leading-tight mb-6">FEITA PARA A<br />CULTURA DO<br />FUTEBOL</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Cada camisa do arquivo Retro Mundial é um portal para os maiores momentos da história da Copa do Mundo. Não fazemos sportswear — preservamos cultura.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              100% algodão orgânico certificado GOTS, corte oversized para conforto e estilo. Limitado a 500 unidades por design — quando acaba, acaba.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[['500','Unidades/Design'],['100%','Algodão Orgânico'],['Grátis','Devoluções']].map(([n,l]) => (
                <div key={l} className="border border-gray-700 p-4 text-center rounded-sm">
                  <div className="text-2xl font-black text-amber-500">{n}</div>
                  <div className="text-xs text-gray-400 mt-1 leading-tight">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="scroll-reveal grid grid-cols-2 gap-4">
            {activeProducts.slice(0, 4).map(p => (
              <div key={p.id} className="aspect-square rounded-sm overflow-hidden cursor-pointer"
                onClick={() => onNavigate('product', p)}>
                <ProductImage product={p} variantImageUrl={p.variants?.[0]?.imageUrl}
                  className="w-full h-full hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMAIL ── */}
      <section className="bg-amber-500 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center scroll-reveal">
          <div className="text-black/60 text-xs font-bold tracking-widest uppercase mb-3">Entrar no Arquivo</div>
          <h2 className="text-4xl sm:text-5xl font-black text-black mb-4">SEJA O PRIMEIRO<br />NOS NOVOS DROPS</h2>
          {activeCoupon && (
            <p className="text-black/70 mb-8">Cadastre-se e ganhe <strong>{activeCoupon.percent}%</strong> de desconto na 1ª compra.</p>
          )}
          {!emailDone ? (
            <form onSubmit={e => { e.preventDefault(); if (window.fbq) window.fbq('track','Lead',{content_name:'footer_email'}); setEmailDone(true); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="flex-1 px-4 py-3 rounded-sm bg-black/20 border border-black/20 text-black placeholder-black/50 outline-none focus:border-black/60 transition-colors" />
              <button type="submit" className="bg-black text-white font-black px-8 py-3 rounded-sm hover:bg-gray-900 uppercase tracking-wide text-sm">
                Entrar
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 text-black font-black text-lg">
              <Check size={24} /> Feito! Verifique seu e-mail{activeCoupon ? ` — código ${activeCoupon.code} enviado` : ''}.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Card de produto da home — clica e vai para a página do produto
function HomeProductCard({ product, onNavigate }) {
  const [hoveredVariant, setHoveredVariant] = useState(null);
  const displayVariant = hoveredVariant || product.variants?.[0];
  const displayImage = displayVariant?.imageUrl || product.images?.[0] || null;
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;

  return (
    <div className="scroll-reveal group">
      <div className="relative overflow-hidden rounded-sm cursor-pointer" onClick={() => onNavigate('product', product)}>
        <ProductImage product={product} variantImageUrl={displayImage}
          className="w-full aspect-[3/4] group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge label={product.badge} colorClass={product.badgeColor} />
          {discount && <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-sm">-{discount}%</span>}
        </div>
        {product.stock <= 11 && (
          <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-sm">
            <span className="text-xs text-amber-400 font-bold">Só {product.stock} restantes</span>
          </div>
        )}
        {product.variants?.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {product.variants.map(v => (
              <button key={v.id}
                onMouseEnter={() => setHoveredVariant(v)}
                onMouseLeave={() => setHoveredVariant(null)}
                onClick={e => { e.stopPropagation(); onNavigate('product', product); }}
                className={`w-5 h-5 rounded-full border-2 transition-all ${hoveredVariant?.id === v.id ? 'border-white scale-110' : 'border-gray-500'}`}
                style={{ backgroundColor: v.hex }} title={v.name} />
            ))}
          </div>
        )}
      </div>
      <div className="pt-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-black text-base group-hover:text-amber-500 transition-colors cursor-pointer" onClick={() => onNavigate('product', product)}>
            {product.name}
          </h3>
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        </div>
        <Stars rating={4.9} />
        <p className="text-gray-500 text-xs mt-1 mb-3 line-clamp-2">{product.copy?.subtitle || ''}</p>
        <button onClick={() => onNavigate('product', product)}
          className="w-full bg-white hover:bg-amber-500 text-black font-bold py-3 text-xs tracking-widest uppercase transition-all rounded-sm">
          Ver Produto
        </button>
      </div>
    </div>
  );
}
