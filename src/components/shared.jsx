import { Star, Check, ExternalLink, Upload } from 'lucide-react';

export const FLAGS = {
  Brazil: '🇧🇷', Argentina: '🇦🇷', Germany: '🇩🇪',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', France: '🇫🇷', Spain: '🇪🇸',
};

// ─── PRODUCT IMAGE ─────────────────────────────────────────────────────────────

export function ProductImage({ product, variantImageUrl, className = '', onClick }) {
  const src = variantImageUrl || product?.variants?.[0]?.imageUrl || product?.imageUrl || product?.images?.[0] || '';

  if (src) {
    return (
      <div className={`overflow-hidden ${className}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <img src={src} alt={product?.name || ''} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 flex flex-col items-center justify-center gap-3 ${className}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <span className="text-5xl">{FLAGS[product?.country] || '⚽'}</span>
      <span className="text-gray-500 text-xs font-medium tracking-widest uppercase">{product?.country} Tee</span>
    </div>
  );
}

// ─── STARS ────────────────────────────────────────────────────────────────────

export function Stars({ rating = 5 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11} className={i <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-600'} />
      ))}
    </span>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

export function Badge({ label, colorClass }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm tracking-wide uppercase ${colorClass || 'bg-gray-700 text-white'}`}>
      {label}
    </span>
  );
}

// ─── PRICE DISPLAY ────────────────────────────────────────────────────────────

export function PriceDisplay({ price, compareAtPrice, size = 'md' }) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : null;

  return (
    <span className="flex items-center gap-2 flex-wrap">
      <span className={`font-black ${textSize} ${discount ? 'text-amber-500' : 'text-white'}`}>
        €{price.toFixed(2)}
      </span>
      {discount && (
        <>
          <span className="text-gray-500 line-through text-sm">€{compareAtPrice.toFixed(2)}</span>
          <span className="bg-red-600 text-white text-xs font-black px-1.5 py-0.5 rounded-sm">
            -{discount}%
          </span>
        </>
      )}
    </span>
  );
}

// ─── CLOUDINARY UPLOAD BUTTON ─────────────────────────────────────────────────
// Abre o widget do Cloudinary para upload. Fallback: input de URL manual.

export function ImageUpload({ value, onChange, config, label }) {
  const cloudName = config?.integrations?.cloudinaryCloud;
  const uploadPreset = config?.integrations?.cloudinaryPreset;
  const canUpload = cloudName && uploadPreset;

  function openWidget() {
    function launch() {
      const widget = window.cloudinary.createUploadWidget({
        cloudName,
        uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: false,
        maxFileSize: 5000000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      }, (error, result) => {
        if (!error && result?.event === 'success') {
          onChange(result.info.secure_url);
        }
      });
      widget.open();
    }

    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.onload = launch;
      document.head.appendChild(script);
    } else {
      launch();
    }
  }

  return (
    <div>
      {label && <label className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1 block">{label}</label>}
      <div className="flex gap-2">
        <input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={canUpload ? 'URL ou clique em Upload →' : 'Cole a URL da imagem'}
          className="flex-1 bg-gray-900 border border-gray-700 focus:border-amber-500 outline-none px-3 py-2 text-sm text-white rounded-sm placeholder-gray-600 transition-colors"
        />
        {canUpload && (
          <button type="button" onClick={openWidget}
            className="bg-gray-700 hover:bg-amber-500 hover:text-black px-3 py-2 rounded-sm text-sm font-bold transition-colors flex items-center gap-1.5 flex-shrink-0">
            <Upload size={14} /> Upload
          </button>
        )}
      </div>
      {!canUpload && (
        <p className="text-gray-600 text-xs mt-1">
          Configure o Cloudinary em Integrações para habilitar upload direto.
        </p>
      )}
      {value && (
        <img src={value} alt="preview" className="mt-2 w-16 h-16 object-cover rounded-sm border border-gray-700" />
      )}
    </div>
  );
}

// ─── COPY GENERATOR ───────────────────────────────────────────────────────────
// Gera copy baseado em templates por país.
// Para IA real, configure a Anthropic API key nas Integrações.

const COPY_TEMPLATES = {
  Brazil:    { headline: 'Brazil World Cup 2026', subtitle: 'Cinco títulos. Uma lenda viva.', bullets: ['100% algodão orgânico GOTS', 'Corte oversized premium', 'Edição limitada 500 un.'], cta: 'Comprar Agora' },
  Argentina: { headline: 'Argentina Legacy', subtitle: 'Da mão de Deus à geração Messi.', bullets: ['Algodão orgânico premium', 'Gráfico heritage Copa 1986', '500 unidades no mundo'], cta: 'Adicionar à Coleção' },
  Germany:   { headline: 'Germany Precision', subtitle: 'Quatro Copas. Uma precisão única.', bullets: ['Tecido premium durável', 'Design minimalista alemão', 'Peça de colecionador'], cta: 'Comprar Agora' },
  England:   { headline: 'England Tradition', subtitle: 'Onde o futebol nasceu.', bullets: ['Corte oversized perfeito', 'Detalhes bordados premium', 'GOTS — produção sustentável'], cta: 'Comprar Agora' },
  France:    { headline: 'France Elegance', subtitle: 'Les Bleus reimaginados.', bullets: ['Silhueta Parisiense premium', 'Gráfico da geração campeã', '500 unidades limitadas'], cta: 'Comprar Agora' },
  Spain:     { headline: 'Spain Passion', subtitle: 'La Furia Roja. Tiki-taka em algodão.', bullets: ['Vermelho La Roja exclusivo', 'Algodão 100% orgânico rastreável', 'Peça numerada de arquivo'], cta: 'Comprar Agora' },
};

export async function generateCopy(product, anthropicKey) {
  // Tenta Claude API se tiver a key (precisa de backend/proxy em produção por CORS)
  if (anthropicKey) {
    try {
      const res = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, apiKey: anthropicKey }),
      });
      if (res.ok) return await res.json();
    } catch {}
  }
  // Fallback: template por país
  return COPY_TEMPLATES[product.country] || COPY_TEMPLATES.Brazil;
}
