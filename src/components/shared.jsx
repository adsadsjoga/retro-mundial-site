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
        resourceType: 'auto', // aceita imagem E vídeo
        maxFileSize: 100000000, // 100 MB (vídeos)
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'],
      }, (error, result) => {
        if (error) {
          // mostra o erro real do Cloudinary em vez de falhar em silêncio
          const msg = error?.statusText || error?.message || JSON.stringify(error);
          console.error('Cloudinary upload error:', error);
          alert(`Erro no upload do Cloudinary:\n${msg}\n\nSe disser "Upload preset must be whitelisted for unsigned uploads", o preset "${uploadPreset}" precisa ser mudado para "Unsigned" no painel do Cloudinary (Settings → Upload → Upload presets).`);
          return;
        }
        if (result?.event === 'success') {
          onChange(result.info.secure_url);
        }
      });
      widget.open();
    }

    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.onload = launch;
      script.onerror = () => alert('Não foi possível carregar o widget do Cloudinary. Verifique a conexão.');
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
        /\.(mp4|webm|mov)(\?|$)/i.test(value) ? (
          <video src={value} className="mt-2 w-16 h-16 object-cover rounded-sm border border-gray-700" muted />
        ) : (
          <img src={value} alt="preview" className="mt-2 w-16 h-16 object-cover rounded-sm border border-gray-700" />
        )
      )}
    </div>
  );
}

// ─── COPY GENERATOR ───────────────────────────────────────────────────────────
// Gera copy baseado em templates por país.
// Para IA real, configure a Anthropic API key nas Integrações.

const COPY_TEMPLATES = {
  Brazil:    { headline: 'Brazil World Cup 2026', subtitle: 'Five titles. One living legend.', bullets: ['100% GOTS organic cotton', 'Premium oversized cut', 'Limited edition 500 units'], cta: 'Buy Now' },
  Argentina: { headline: 'Argentina Legacy', subtitle: 'Hand of God to Messi\'s generation.', bullets: ['Premium organic cotton', 'Heritage graphic — 1986 World Cup', '500 units worldwide'], cta: 'Add to Collection' },
  Germany:   { headline: 'Germany Precision', subtitle: 'Four World Cups. One unique precision.', bullets: ['Durable premium fabric', 'Minimalist German design', 'Collector\'s piece'], cta: 'Buy Now' },
  England:   { headline: 'England Tradition', subtitle: 'Where football was born.', bullets: ['Perfect oversized cut', 'Premium embroidered details', 'GOTS — sustainable production'], cta: 'Buy Now' },
  France:    { headline: 'France Elegance', subtitle: 'Les Bleus reimagined.', bullets: ['Premium Parisian silhouette', 'Champion generation graphic', '500 limited units'], cta: 'Buy Now' },
  Spain:     { headline: 'Spain Passion', subtitle: 'La Furia Roja. Tiki-taka in cotton.', bullets: ['Exclusive La Roja red', '100% traceable organic cotton', 'Numbered archive piece'], cta: 'Buy Now' },
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
