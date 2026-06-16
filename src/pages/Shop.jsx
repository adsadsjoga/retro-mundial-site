import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { ProductImage, Badge, PriceDisplay } from '../components/shared';

const DEFAULT_FILTERS = ['All', 'Brazil', 'Argentina', 'England', 'France', 'Spain', 'Germany'];

export default function ShopPage({ products, config, onNavigate, selectedCountry, onFilterChange }) {
  const active = (products || []).filter(p => p.active);

  // Gera lista de países dinamicamente a partir dos produtos
  const uniqueCountries = ['All', ...new Set(active.map(p => p.country).filter(Boolean))];
  const filters = uniqueCountries.length > 1 ? uniqueCountries : DEFAULT_FILTERS;

  // Inicia com o país selecionado (se vir do Home), senão 'All'
  const [filter, setFilter] = useState(selectedCountry || 'All');

  // Sincroniza quando selectedCountry muda após o mount (ex: clique em Home)
  useEffect(() => {
    if (selectedCountry) setFilter(selectedCountry);
  }, [selectedCountry]);
  const filtered = filter === 'All' ? active : active.filter(p => p.country === filter);

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
    <div className="min-h-screen bg-black pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 scroll-reveal">
          <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">The Full Collection</div>
          <h1 className="text-6xl font-black tracking-tight">ALL PIECES</h1>
          <p className="text-gray-400 mt-2">Limited editions · 500 units · Free returns</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scroll-reveal" style={{ scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-sm transition-all ${
                filter === f ? 'bg-amber-500 text-black' : 'border border-gray-700 text-gray-400 hover:border-gray-400 hover:text-white'
              }`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-bold mb-2">No products found</p>
            <button onClick={() => setFilter('All')} className="text-amber-500 text-sm hover:underline">View all</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onNavigate }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const intervalRef = useRef(null);

  // Mesmas fotos da galeria do produto: até 4 fotos admin + variantes de cor
  const adminImgs = (product.images || []).filter(url => url && !url.includes('cdn.shopify.com')).slice(0, 4);
  const variantImgs = (product.variants || []).map(v => v.imageUrl).filter(Boolean);
  const allImages = [...new Map(
    [...adminImgs, ...variantImgs].map(url => [url, url])
  ).values()];

  // Auto-avança imagens ao fazer hover (intervalo 1.8s)
  useEffect(() => {
    if (hovered && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setImgIdx(i => (i + 1) % allImages.length);
      }, 1800);
    } else {
      clearInterval(intervalRef.current);
      if (!hovered) setImgIdx(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [hovered, allImages.length]);

  const displayImage = allImages[imgIdx] || null;
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="scroll-reveal group">
      <div
        className="relative overflow-hidden rounded-sm cursor-pointer"
        onClick={() => onNavigate('product', product)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ProductImage product={product} variantImageUrl={displayImage}
          className="w-full aspect-[3/4] transition-transform duration-500 group-hover:scale-105" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge label={product.badge} colorClass={product.badgeColor} />
          {discount && (
            <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-sm">-{discount}%</span>
          )}
        </div>

        {product.stock <= 11 && (
          <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-sm">
            <span className="text-xs text-amber-400 font-bold">Only {product.stock} left</span>
          </div>
        )}

        {/* Dots de navegação — aparecem no hover quando há mais de 1 foto */}
        {allImages.length > 1 && (
          <div className={`absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            {allImages.map((_, i) => (
              <button key={i}
                onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-amber-500' : 'bg-white/60'}`}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      <div className="pt-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-black text-base group-hover:text-amber-500 transition-colors cursor-pointer"
            onClick={() => onNavigate('product', product)}>
            {product.name}
          </h3>
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        </div>
        <p className="text-gray-500 text-xs mt-1 mb-3 line-clamp-2">
          {product.copy?.subtitle || product.desc || ''}
        </p>
        <button onClick={() => onNavigate('product', product)}
          className="w-full bg-white hover:bg-amber-500 text-black font-bold py-3 text-xs tracking-widest uppercase transition-all rounded-sm">
          View Product
        </button>
      </div>
    </div>
  );
}
