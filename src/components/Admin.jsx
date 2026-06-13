import { useState, useEffect, useRef } from 'react';
import {
  X, Lock, Settings, Save, Check, Package, Image, Percent,
  Zap, Globe, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw,
  Wand2, ChevronDown, ChevronUp, AlertCircle, ExternalLink, Users, Search,
  Mail, Send, Bot, Eye, BarChart2, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, GripVertical, Layout, Film,
} from 'lucide-react';
import { ImageUpload, generateCopy } from './shared';
import { DEFAULT_CONFIG } from '../config';

// ─── INPUTS ───────────────────────────────────────────────────────────────────

const iCls = "w-full bg-gray-900 border border-gray-700 focus:border-amber-500 outline-none px-3 py-2 text-sm text-white rounded-sm transition-colors placeholder-gray-500";
const lCls = "text-xs text-gray-400 font-bold uppercase tracking-wide mb-1 block";

function Field({ label, children }) {
  return <div><label className={lCls}>{label}</label>{children}</div>;
}

function Toggle({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-sm transition-colors ${
        value ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-500 border border-gray-700'
      }`}>
      {value ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
      {label || (value ? 'Ativo' : 'Inativo')}
    </button>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

export default function AdminPanel({ config, setConfig, resetConfig, onClose, products: mergedProducts }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [tab, setTab] = useState('products');
  const [saved, setSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'ok' | 'error'

  function login() {
    if (pw === config.adminPassword) setAuthed(true);
    else setPwErr('Senha incorreta.');
  }

  async function save() {
    setSaved(true);
    setSyncStatus('saving');
    const { saveRemoteConfig } = await import('../supabaseConfig');
    const result = await saveRemoteConfig(config);
    setSyncStatus(result.ok ? 'ok' : 'error');
    setTimeout(() => { setSaved(false); setSyncStatus('idle'); }, 3000);
  }

  const tabs = [
    { id: 'products',     icon: Package, label: 'Produtos' },
    { id: 'site',         icon: Layout,  label: 'Aparência' },
    { id: 'discounts',    icon: Percent, label: 'Descontos' },
    { id: 'customers',    icon: Users,   label: 'Clientes' },
    { id: 'analytics',    icon: BarChart2, label: 'Analytics' },
    { id: 'funnel',       icon: TrendingDown, label: 'Funil' },
    { id: 'klaviyo',      icon: Mail,    label: 'Klaviyo' },
    { id: 'integrations', icon: Zap,     label: 'Integrações' },
    { id: 'general',      icon: Settings,label: 'Geral' },
  ];

  if (!authed) return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-sm max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-6">
          <Lock size={20} className="text-amber-500" />
          <h2 className="text-xl font-black">Painel Admin</h2>
        </div>
        <label className={lCls}>Senha</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className={iCls + ' mb-3'} placeholder="Senha do admin" autoFocus />
        {pwErr && <p className="text-red-400 text-xs mb-3">{pwErr}</p>}
        <button onClick={login} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-sm uppercase tracking-wide text-sm">
          Entrar
        </button>
        <p className="text-gray-600 text-xs mt-3 text-center">Dica: clique no logo 5× para abrir</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Settings size={18} className="text-amber-500" />
          <span className="font-black text-lg">PAINEL ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold transition-colors ${
              syncStatus === 'ok' ? 'bg-green-600 text-white' :
              syncStatus === 'error' ? 'bg-red-600 text-white' :
              syncStatus === 'saving' ? 'bg-gray-600 text-white' :
              'bg-amber-500 hover:bg-amber-400 text-black'
            }`}>
            {syncStatus === 'ok'     ? <><Check size={14} /> Salvo na cloud!</> :
             syncStatus === 'error'  ? <><AlertCircle size={14} /> Erro — tenta novamente</> :
             syncStatus === 'saving' ? <><RefreshCw size={14} className="animate-spin" /> A guardar...</> :
             <><Save size={14} /> Salvar</>}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2"><X size={20} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col py-4 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left ${
                tab === t.id ? 'bg-amber-500/10 text-amber-500 border-r-2 border-amber-500' : 'text-gray-400 hover:text-white'
              }`}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
          <div className="mt-auto px-4 pb-4 pt-4 border-t border-gray-800">
            <button onClick={() => { if (window.confirm('Resetar todas as configurações para o padrão?')) { resetConfig(); onClose(); } }}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-400 transition-colors w-full">
              <RefreshCw size={12} /> Resetar tudo
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {tab === 'products'     && <ProductsTab     config={config} setConfig={setConfig} mergedProducts={mergedProducts || config.products} />}
          {tab === 'site'         && <SiteTab          config={config} setConfig={setConfig} />}
          {tab === 'discounts'    && <DiscountsTab     config={config} setConfig={setConfig} />}
          {tab === 'customers'    && <CustomersTab     onClose={onClose} />}
          {tab === 'analytics'    && <AnalyticsTab />}
          {tab === 'funnel'       && <FunnelTab />}
          {tab === 'klaviyo'      && <KlaviyoTab       config={config} />}
          {tab === 'integrations' && <IntegrationsTab  config={config} setConfig={setConfig} />}
          {tab === 'general'      && <GeneralTab       config={config} setConfig={setConfig} />}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────

function ProductsTab({ config, setConfig, mergedProducts }) {
  const [openId, setOpenId] = useState(null);

  function updateProduct(id, field, value) {
    setConfig(p => ({ ...p, products: p.products.map(pr => pr.id === id ? { ...pr, [field]: value } : pr) }));
  }

  function updateCopy(id, field, value) {
    setConfig(p => ({ ...p, products: p.products.map(pr => pr.id === id ? { ...pr, copy: { ...pr.copy, [field]: value } } : pr) }));
  }

  async function handleGenerateCopy(product) {
    const copy = await generateCopy(product, config.integrations?.anthropicKey);
    setConfig(p => ({ ...p, products: p.products.map(pr => pr.id === product.id ? { ...pr, copy } : pr) }));
  }

  // Usa os produtos merged (com imagens do Shopify) ordenados por sortOrder
  const sortedProducts = [...mergedProducts].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

  // Para editar campos locais, encontra o config local pelo id/handle
  function findLocalProduct(product) {
    return config.products.find(p => p.id === product.id || p.shopifyHandle === product.handle || p.handle === product.handle);
  }

  return (
    <div>
      <h3 className="text-xl font-black mb-2">Produtos</h3>
      <p className="text-gray-400 text-sm mb-2">
        Produtos sincronizados com a Shopify. Preços, variantes e stock são geridos direto na Shopify.
      </p>
      <p className="text-gray-500 text-xs mb-6">
        Para reordenar os produtos no Shop e adicionar a foto de capa do All Drops, vá em <span className="text-amber-500">Aparência → Ordem dos Produtos</span>.
      </p>

      <div className="space-y-3">
        {sortedProducts.map(product => {
          const localP = findLocalProduct(product);
          const localId = localP?.id ?? product.id;
          // thumbnail: foto da primeira variante do Shopify, ou coverImageUrl
          const thumbSrc = product.variants?.[0]?.imageUrl || product.images?.[0] || '';

          return (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-sm overflow-hidden">
              {/* Cabeçalho */}
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => setOpenId(openId === product.id ? null : product.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-sm overflow-hidden flex-shrink-0 bg-gray-800">
                    {thumbSrc
                      ? <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">⚽</div>
                    }
                  </div>
                  <div>
                    <p className="font-black text-sm">{product.name}</p>
                    <p className="text-gray-500 text-xs">
                      €{product.price?.toFixed?.(2)} · {product.variants?.length || 0} {product.variants?.length === 1 ? 'cor' : 'cores'} · {product.country || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle value={product.active} onChange={v => updateProduct(localId, 'active', v)} />
                  {openId === product.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {/* Conteúdo expandido */}
              {openId === product.id && (
                <div className="p-5 border-t border-gray-800 space-y-6">

                  {/* Cores do Shopify (só visualização) */}
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-amber-500">Variantes de Cor (Shopify)</h4>
                    <p className="text-gray-500 text-xs mb-3">Geridas na Shopify. As fotos e IDs são importados automaticamente.</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants?.map(v => (
                        <div key={v.id} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-sm">
                          <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" style={{ backgroundColor: v.hex }} />
                          <span className="text-xs font-bold">{v.name}</span>
                          {v.imageUrl && <img src={v.imageUrl} alt="" className="w-6 h-6 object-cover rounded-sm" />}
                          <span className={`text-xs ${v.inStock ? 'text-green-400' : 'text-red-400'}`}>{v.inStock ? '●' : '○'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campos editáveis locais */}
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-amber-500">Apresentação</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="País / Seleção">
                        <input value={localP?.country || ''} onChange={e => updateProduct(localId, 'country', e.target.value)}
                          className={iCls} placeholder="Brazil, Argentina, France..." />
                      </Field>
                      <Field label="Badge (etiqueta)">
                        <input value={localP?.badge || ''} onChange={e => updateProduct(localId, 'badge', e.target.value)}
                          className={iCls} placeholder="Best Seller, New Drop..." />
                      </Field>
                    </div>
                  </div>

                  {/* Galeria — até 4 fotos + 1 vídeo */}
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide mb-1 text-amber-500">Galeria do Produto (até 4 fotos)</h4>
                    <p className="text-gray-500 text-xs mb-3">Estas fotos aparecem na página do produto. Máx. 4 imagens.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map(i => {
                        const imgs = localP?.images || [];
                        return (
                          <div key={i} className="relative">
                            <ImageUpload
                              label={`Foto ${i + 1}${i === 0 ? ' (principal)' : ''}`}
                              value={imgs[i] || ''}
                              onChange={url => {
                                const next = [...(localP?.images || [])];
                                next[i] = url;
                                // remove trailing empty slots
                                while (next.length > 0 && !next[next.length - 1]) next.pop();
                                if (url) next[i] = url; // ensure slot is set even if above popped it
                                updateProduct(localId, 'images', next);
                              }}
                              config={config}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <h4 className="font-black text-sm uppercase tracking-wide mt-5 mb-1 text-amber-500">Vídeo do Produto</h4>
                    <p className="text-gray-500 text-xs mb-3">Aparece na galeria após as fotos. Formatos: mp4, webm.</p>
                    <ImageUpload
                      label="Vídeo (mp4 / webm)"
                      value={localP?.videoUrl || ''}
                      onChange={url => updateProduct(localId, 'videoUrl', url)}
                      config={config}
                    />
                  </div>

                  {/* Copywriting */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-black text-sm uppercase tracking-wide text-amber-500">Copywriting</h4>
                      <button onClick={() => handleGenerateCopy(product)}
                        className="flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-amber-500 hover:text-black px-3 py-1.5 rounded-sm font-bold transition-colors">
                        <Wand2 size={12} /> Gerar com IA
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="Headline (título principal)">
                        <input value={localP?.copy?.headline || ''} onChange={e => updateCopy(localId, 'headline', e.target.value)} className={iCls} />
                      </Field>
                      <Field label="Subtítulo">
                        <input value={localP?.copy?.subtitle || ''} onChange={e => updateCopy(localId, 'subtitle', e.target.value)} className={iCls} />
                      </Field>
                      <Field label="Descrição">
                        <textarea value={localP?.copy?.description || ''} onChange={e => updateCopy(localId, 'description', e.target.value)} className={iCls} rows={4} />
                      </Field>
                      <Field label="Bullet 1">
                        <input value={localP?.copy?.bullets?.[0] || ''} onChange={e => updateCopy(localId, 'bullets', [e.target.value, localP?.copy?.bullets?.[1]||'', localP?.copy?.bullets?.[2]||''])} className={iCls} />
                      </Field>
                      <Field label="Bullet 2">
                        <input value={localP?.copy?.bullets?.[1] || ''} onChange={e => updateCopy(localId, 'bullets', [localP?.copy?.bullets?.[0]||'', e.target.value, localP?.copy?.bullets?.[2]||''])} className={iCls} />
                      </Field>
                      <Field label="Bullet 3">
                        <input value={localP?.copy?.bullets?.[2] || ''} onChange={e => updateCopy(localId, 'bullets', [localP?.copy?.bullets?.[0]||'', localP?.copy?.bullets?.[1]||'', e.target.value])} className={iCls} />
                      </Field>
                      <Field label="Texto do Botão de Compra">
                        <input value={localP?.copy?.cta || ''} onChange={e => updateCopy(localId, 'cta', e.target.value)} className={iCls} placeholder="Buy Now" />
                      </Field>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BANNER ───────────────────────────────────────────────────────────────────

function BannerTab({ config, setConfig }) {
  function upd(field, val) {
    setConfig(p => ({ ...p, hero: { ...p.hero, [field]: val } }));
  }
  function updBadge(i, val) {
    setConfig(p => { const b = [...p.trustBadges]; b[i] = { text: val }; return { ...p, trustBadges: b }; });
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h3 className="text-xl font-black mb-2">Banner Hero</h3>
      <p className="text-gray-400 text-sm mb-4">Configure o visual da página inicial.</p>

      <ImageUpload label="Imagem de Fundo do Hero" value={config.hero.backgroundImage}
        onChange={v => upd('backgroundImage', v)} config={config} />
      <p className="text-gray-600 text-xs -mt-2">Resolução ideal: 1920×1080px ou maior. Deixe vazio para fundo preto.</p>

      <Field label="Título principal">
        <input value={config.hero.title} onChange={e => upd('title', e.target.value)} className={iCls} />
        <p className="text-gray-600 text-xs mt-1">A 2ª palavra fica em âmbar. "MOMENTS <u>THAT</u> MATTER" → THAT fica amarelo.</p>
      </Field>
      <Field label="Subtítulo">
        <textarea value={config.hero.subtitle} onChange={e => upd('subtitle', e.target.value)} className={iCls} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Botão principal">
          <input value={config.hero.ctaPrimary} onChange={e => upd('ctaPrimary', e.target.value)} className={iCls} />
        </Field>
        <Field label="Botão secundário">
          <input value={config.hero.ctaSecondary} onChange={e => upd('ctaSecondary', e.target.value)} className={iCls} />
        </Field>
      </div>

      <div>
        <label className={lCls}>Badges de confiança (barra âmbar)</label>
        {config.trustBadges.map((b, i) => (
          <input key={i} value={b.text} onChange={e => updBadge(i, e.target.value)} className={iCls + ' mb-2'} />
        ))}
      </div>
    </div>
  );
}

// ─── APARÊNCIA DO SITE ──────────────────────────────────────────────────────
// Edita as secções da landing page: países, bloco "500", "nossa história".

const COUNTRY_NAMES = {
  Brazil: 'Brasil', Argentina: 'Argentina', Germany: 'Alemanha',
  England: 'Inglaterra', France: 'França', Spain: 'Espanha',
};
const COUNTRY_FLAGS = {
  Brazil: '🇧🇷', Argentina: '🇦🇷', Germany: '🇩🇪',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', France: '🇫🇷', Spain: '🇪🇸',
};

function SiteTab({ config, setConfig }) {
  // garante que homepage existe (configs antigos)
  const hp = config.homepage || DEFAULT_CONFIG.homepage;

  function moveProduct(id, direction) {
    setConfig(prev => {
      const sorted = [...prev.products].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      const idx = sorted.findIndex(p => p.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const aOrder = sorted[idx].sortOrder ?? idx;
      const bOrder = sorted[swapIdx].sortOrder ?? swapIdx;
      return {
        ...prev,
        products: prev.products.map(p => {
          if (p.id === sorted[idx].id) return { ...p, sortOrder: bOrder };
          if (p.id === sorted[swapIdx].id) return { ...p, sortOrder: aOrder };
          return p;
        }),
      };
    });
  }

  function updateProductField(id, field, value) {
    setConfig(p => ({ ...p, products: p.products.map(pr => pr.id === id ? { ...pr, [field]: value } : pr) }));
  }

  const sortedProducts = [...config.products].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  const editorial = hp.editorial || DEFAULT_CONFIG.homepage.editorial;
  const story = hp.story || DEFAULT_CONFIG.homepage.story;
  const countries = hp.countries || DEFAULT_CONFIG.homepage.countries;

  function setHP(updater) {
    setConfig(p => {
      const base = p.homepage || DEFAULT_CONFIG.homepage;
      return { ...p, homepage: updater(base) };
    });
  }
  function setCountryImg(key, url) {
    setHP(h => ({ ...h, countries: (h.countries || countries).map(c => c.key === key ? { ...c, image: url } : c) }));
  }
  function setEditorial(field, val) {
    setHP(h => ({ ...h, editorial: { ...(h.editorial || editorial), [field]: val } }));
  }
  function setStory(field, val) {
    setHP(h => ({ ...h, story: { ...(h.story || story), [field]: val } }));
  }
  function setStoryImg(i, url) {
    setHP(h => {
      const imgs = [...((h.story || story).images || ['', '', '', ''])];
      imgs[i] = url;
      return { ...h, story: { ...(h.story || story), images: imgs } };
    });
  }
  function setStoryLink(i, url) {
    setHP(h => {
      const links = [...((h.story || story).imageLinks || ['', '', '', ''])];
      links[i] = url;
      return { ...h, story: { ...(h.story || story), imageLinks: links } };
    });
  }

  const targetHint = 'Use: home, shop, about — ou uma URL completa (https://...)';

  function updHero(field, val) {
    setConfig(p => ({ ...p, hero: { ...p.hero, [field]: val } }));
  }
  function updBadge(i, val) {
    setConfig(p => { const b = [...p.trustBadges]; b[i] = { text: val }; return { ...p, trustBadges: b }; });
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h3 className="text-xl font-black mb-2">Aparência do Site</h3>
        <p className="text-gray-400 text-sm">Troca imagens, textos e links das secções da página inicial. Altera aqui → atualiza o site.</p>
      </div>

      {/* ── ORDEM DOS PRODUTOS ── */}
      <section className="border border-amber-500/30 rounded-sm overflow-hidden">
        <div className="bg-amber-500/10 px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <h4 className="font-black text-sm uppercase tracking-wide text-amber-400">Ordem dos Produtos</h4>
            <p className="text-gray-500 text-xs mt-0.5">Use ↑↓ para reordenar. As fotos do All Drops são as mesmas da página do produto.</p>
          </div>
          <span className="text-amber-500 text-xs font-bold">{sortedProducts.filter(p => p.active).length} / {sortedProducts.length}</span>
        </div>
        <div className="divide-y divide-gray-800">
          {sortedProducts.map((product, i) => {
            const isFirst = i === 0;
            const isLast = i === sortedProducts.length - 1;
            const thumbSrc = product.variants?.[0]?.imageUrl || product.images?.[0] || '';
            return (
              <div key={product.id} className={`px-4 py-3 transition-colors ${product.active ? 'bg-gray-900' : 'bg-gray-900/40'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${product.active ? 'text-amber-500' : 'text-gray-700'}`}>
                    {product.active ? i + 1 : '—'}
                  </span>
                  <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 bg-gray-800">
                    {thumbSrc
                      ? <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">⚽</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${product.active ? 'text-white' : 'text-gray-500'}`}>{product.name}</p>
                    <p className="text-gray-600 text-xs truncate">{product.country || '—'} · €{product.price?.toFixed?.(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => moveProduct(product.id, 'up')} disabled={isFirst}
                      className="w-7 h-7 flex items-center justify-center rounded-sm text-gray-500 hover:text-white hover:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <ArrowUp size={13} />
                    </button>
                    <button onClick={() => moveProduct(product.id, 'down')} disabled={isLast}
                      className="w-7 h-7 flex items-center justify-center rounded-sm text-gray-500 hover:text-white hover:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <ArrowDown size={13} />
                    </button>
                    <Toggle value={product.active} onChange={v => updateProductField(product.id, 'active', v)}
                      label={product.active ? 'Ativo' : 'Oculto'} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BANNER HERO ── */}
      <section className="border border-gray-800 rounded-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
          <h4 className="font-black text-sm uppercase tracking-wide text-amber-400">Banner Hero</h4>
          <p className="text-gray-500 text-xs mt-0.5">Imagem de fundo, título, subtítulo e botões do ecrã principal.</p>
        </div>
        <div className="p-4 space-y-4">
          <ImageUpload label="Imagem de Fundo do Hero" value={config.hero.backgroundImage}
            onChange={v => updHero('backgroundImage', v)} config={config} />
          <p className="text-gray-600 text-xs -mt-2">Resolução ideal: 1920×1080px ou maior. Deixe vazio para fundo preto.</p>
          <Field label="Título principal">
            <input value={config.hero.title} onChange={e => updHero('title', e.target.value)} className={iCls} />
            <p className="text-gray-600 text-xs mt-1">A 2ª palavra fica em âmbar. "MOMENTS THAT MATTER" → THAT fica amarelo.</p>
          </Field>
          <Field label="Subtítulo">
            <textarea value={config.hero.subtitle} onChange={e => updHero('subtitle', e.target.value)} className={iCls} rows={3} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Botão principal">
              <input value={config.hero.ctaPrimary} onChange={e => updHero('ctaPrimary', e.target.value)} className={iCls} />
            </Field>
            <Field label="Botão secundário">
              <input value={config.hero.ctaSecondary} onChange={e => updHero('ctaSecondary', e.target.value)} className={iCls} />
            </Field>
          </div>
          <div>
            <label className={lCls}>Badges de confiança (barra âmbar)</label>
            {config.trustBadges.map((b, i) => (
              <input key={i} value={b.text} onChange={e => updBadge(i, e.target.value)} className={iCls + ' mb-2'} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ESCOLHE O TEU PAÍS ── */}
      <section className="border border-gray-800 rounded-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
          <h4 className="font-black text-sm uppercase tracking-wide text-amber-400">Secção "Escolhe o teu país"</h4>
          <p className="text-gray-500 text-xs mt-0.5">Uma imagem por país (3:4, vertical). Sem imagem = mostra a bandeira.</p>
        </div>
        <div className="p-4 grid sm:grid-cols-2 gap-4">
          {countries.map(c => (
            <div key={c.key} className="bg-gray-900/60 p-3 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{COUNTRY_FLAGS[c.key]}</span>
                <span className="font-bold text-sm">{COUNTRY_NAMES[c.key] || c.key}</span>
              </div>
              <ImageUpload value={c.image} onChange={url => setCountryImg(c.key, url)} config={config} />
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOCO "500" ── */}
      <section className="border border-gray-800 rounded-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
          <h4 className="font-black text-sm uppercase tracking-wide text-amber-400">Bloco de Destaque "500"</h4>
          <p className="text-gray-500 text-xs mt-0.5">Pode ter imagem ou vídeo de fundo. Sem mídia = fundo branco.</p>
        </div>
        <div className="p-4 space-y-4">
          <Field label="Tipo de fundo">
            <div className="flex gap-2">
              {[['none', 'Branco (sem mídia)'], ['image', 'Imagem'], ['video', 'Vídeo']].map(([val, lbl]) => (
                <button key={val} onClick={() => setEditorial('mediaType', val)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-sm border transition-colors ${
                    editorial.mediaType === val ? 'bg-amber-500 text-black border-amber-500' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  {val === 'video' && <Film size={12} />}{val === 'image' && <Image size={12} />}{lbl}
                </button>
              ))}
            </div>
          </Field>

          {editorial.mediaType === 'video' ? (
            <Field label="URL do vídeo (.mp4 ou .webm)">
              <input value={editorial.mediaUrl || ''} onChange={e => setEditorial('mediaUrl', e.target.value)}
                className={iCls} placeholder="https://.../video.mp4" />
              <p className="text-gray-600 text-xs mt-1">Sobe o vídeo no Cloudinary ou usa um link directo .mp4. Toca em loop, sem som.</p>
            </Field>
          ) : editorial.mediaType === 'image' ? (
            <ImageUpload label="Imagem de fundo" value={editorial.mediaUrl} onChange={url => setEditorial('mediaUrl', url)} config={config} />
          ) : null}

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Eyebrow (texto pequeno em cima)">
              <input value={editorial.eyebrow || ''} onChange={e => setEditorial('eyebrow', e.target.value)} className={iCls} />
            </Field>
            <div />
            <Field label="Título — linha 1">
              <input value={editorial.titleLine1 || ''} onChange={e => setEditorial('titleLine1', e.target.value)} className={iCls} />
            </Field>
            <Field label="Título — linha 2">
              <input value={editorial.titleLine2 || ''} onChange={e => setEditorial('titleLine2', e.target.value)} className={iCls} />
            </Field>
          </div>
          <Field label="Texto">
            <textarea value={editorial.text || ''} onChange={e => setEditorial('text', e.target.value)} className={iCls} rows={3} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Texto do botão">
              <input value={editorial.ctaLabel || ''} onChange={e => setEditorial('ctaLabel', e.target.value)} className={iCls} />
            </Field>
            <Field label="Destino do botão">
              <input value={editorial.ctaTarget || ''} onChange={e => setEditorial('ctaTarget', e.target.value)} className={iCls} placeholder="shop" />
              <p className="text-gray-600 text-xs mt-1">{targetHint}</p>
            </Field>
          </div>
        </div>
      </section>

      {/* ── NOSSA HISTÓRIA ── */}
      <section className="border border-gray-800 rounded-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
          <h4 className="font-black text-sm uppercase tracking-wide text-amber-400">Secção "A nossa história"</h4>
          <p className="text-gray-500 text-xs mt-0.5">Colagem de 4 imagens + textos. Cada imagem pode ter o seu link.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900/60 p-3 rounded-sm">
                <p className="text-xs font-bold text-gray-400 mb-2">Imagem {i + 1}</p>
                <ImageUpload value={story.images?.[i]} onChange={url => setStoryImg(i, url)} config={config} />
                <div className="mt-2">
                  <Field label="Link ao clicar (opcional)">
                    <input value={story.imageLinks?.[i] || ''} onChange={e => setStoryLink(i, e.target.value)}
                      className={iCls} placeholder="vazio = produto correspondente" />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs">Imagem vazia usa a foto do produto correspondente. Link vazio abre esse produto.</p>

          <Field label="Eyebrow">
            <input value={story.eyebrow || ''} onChange={e => setStory('eyebrow', e.target.value)} className={iCls} />
          </Field>
          <Field label="Título (use Enter para quebrar linha)">
            <textarea value={story.title || ''} onChange={e => setStory('title', e.target.value)} className={iCls} rows={3} />
          </Field>
          <Field label="Parágrafo 1">
            <textarea value={story.text1 || ''} onChange={e => setStory('text1', e.target.value)} className={iCls} rows={3} />
          </Field>
          <Field label="Parágrafo 2">
            <textarea value={story.text2 || ''} onChange={e => setStory('text2', e.target.value)} className={iCls} rows={2} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Texto do botão">
              <input value={story.ctaLabel || ''} onChange={e => setStory('ctaLabel', e.target.value)} className={iCls} />
            </Field>
            <Field label="Destino do botão">
              <input value={story.ctaTarget || ''} onChange={e => setStory('ctaTarget', e.target.value)} className={iCls} placeholder="about" />
              <p className="text-gray-600 text-xs mt-1">{targetHint}</p>
            </Field>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── DESCONTOS ────────────────────────────────────────────────────────────────

function DiscountsTab({ config, setConfig }) {
  function upd(i, f, v) {
    setConfig(p => { const d = [...p.discounts]; d[i] = { ...d[i], [f]: v }; return { ...p, discounts: d }; });
  }
  function add() {
    setConfig(p => ({ ...p, discounts: [...p.discounts, { code: 'NOVO10', percent: 10, label: '10% off', active: true }] }));
  }
  function remove(i) {
    setConfig(p => ({ ...p, discounts: p.discounts.filter((_, j) => j !== i) }));
  }

  return (
    <div className="max-w-xl">
      <h3 className="text-xl font-black mb-2">Cupons & Descontos</h3>
      <p className="text-gray-400 text-sm mb-6">Cupons são aplicados no carrinho. O 1º cupom ativo aparece no pop-up de e-mail.</p>

      <div className="space-y-4">
        {config.discounts.map((d, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-black">Cupom #{i + 1}</span>
              <div className="flex items-center gap-2">
                <Toggle value={d.active} onChange={v => upd(i, 'active', v)} />
                <button onClick={() => remove(i)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Código">
                <input value={d.code} onChange={e => upd(i, 'code', e.target.value.toUpperCase())} className={iCls} placeholder="RETRO15" />
              </Field>
              <Field label="Desconto (%)">
                <input type="number" min="1" max="99" value={d.percent} onChange={e => upd(i, 'percent', parseInt(e.target.value))} className={iCls} />
              </Field>
              <div className="col-span-2">
                <Field label="Descrição (exibida no carrinho)">
                  <input value={d.label} onChange={e => upd(i, 'label', e.target.value)} className={iCls} placeholder="15% off 1ª compra" />
                </Field>
              </div>
            </div>
          </div>
        ))}
        <button onClick={add}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-600 hover:border-amber-500 text-gray-400 hover:text-amber-500 py-3 rounded-sm text-sm font-bold transition-colors">
          <Plus size={16} /> Adicionar Cupom
        </button>
      </div>
    </div>
  );
}

// ─── INTEGRAÇÕES ──────────────────────────────────────────────────────────────

function IntegrationsTab({ config, setConfig }) {
  function upd(f, v) {
    setConfig(p => ({ ...p, integrations: { ...p.integrations, [f]: v } }));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-xl font-black mb-2">Integrações</h3>

      {/* Shopify */}
      <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-amber-400" />
            <span className="font-black">Shopify Storefront API</span>
          </div>
          {config.integrations.shopifyToken && (
            <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check size={12} /> Conectado</span>
          )}
        </div>
        <div className="space-y-3">
          <Field label="Domínio da loja (.myshopify.com)">
            <input value={config.integrations.shopifyDomain} onChange={e => upd('shopifyDomain', e.target.value)}
              className={iCls} placeholder="retromundial.myshopify.com" />
          </Field>
          <Field label="Storefront API Access Token">
            <input type="password" value={config.integrations.shopifyToken} onChange={e => upd('shopifyToken', e.target.value)}
              className={iCls} placeholder="Cole seu token aqui" />
          </Field>
        </div>
        <div className="mt-3 p-3 bg-black/40 rounded-sm text-xs text-gray-400">
          <strong className="text-white block mb-1">Como obter o token:</strong>
          Shopify Admin → Settings → Apps → Develop apps → Create app → Configure Storefront API → copie o access token.
          Permissões necessárias: <code className="text-amber-400">read_products</code>, <code className="text-amber-400">read_inventory</code>.
        </div>
      </div>

      {/* Cloudinary */}
      <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image size={16} className="text-blue-400" />
            <span className="font-black">Cloudinary (Upload de Imagens)</span>
          </div>
          {config.integrations.cloudinaryCloud && config.integrations.cloudinaryPreset && (
            <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check size={12} /> Configurado</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cloud Name">
            <input value={config.integrations.cloudinaryCloud} onChange={e => upd('cloudinaryCloud', e.target.value)}
              className={iCls} placeholder="seu-cloud-name" />
          </Field>
          <Field label="Upload Preset (unsigned)">
            <input value={config.integrations.cloudinaryPreset} onChange={e => upd('cloudinaryPreset', e.target.value)}
              className={iCls} placeholder="retromundial_uploads" />
          </Field>
        </div>
        <div className="mt-3 p-3 bg-black/40 rounded-sm text-xs text-gray-400">
          <strong className="text-white block mb-1">Como configurar (grátis):</strong>
          1. Crie conta em <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-amber-400">cloudinary.com</a>
          {' '}2. Settings → Upload → Add upload preset → Signing mode: <strong>Unsigned</strong> → Salve o preset name.
        </div>
      </div>

      {/* Meta Pixel */}
      <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-blue-500" />
          <span className="font-black">Meta Pixel</span>
        </div>
        <Field label="Pixel ID">
          <input value={config.integrations.pixelId} onChange={e => upd('pixelId', e.target.value)}
            className={iCls} placeholder="2187595858447389" />
        </Field>
        <p className="text-gray-500 text-xs mt-2">Rastreia PageView, ViewContent, AddToCart e Lead automaticamente.</p>
      </div>

      {/* Klaviyo */}
      <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-green-500" />
          <span className="font-black">Klaviyo</span>
        </div>
        <Field label="Form ID do popup">
          <input value={config.integrations.klaviyoFormId} onChange={e => upd('klaviyoFormId', e.target.value)}
            className={iCls} placeholder="XxXxXx" />
        </Field>
        <p className="text-gray-500 text-xs mt-2">Klaviyo → Forms → seu form → Embed → copie o ID. Deixe vazio para usar o form interno.</p>
      </div>

      {/* Claude API */}
      <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 size={16} className="text-purple-400" />
          <span className="font-black">Claude API (Copywriting IA)</span>
        </div>
        <Field label="Anthropic API Key">
          <input type="password" value={config.integrations.anthropicKey || ''} onChange={e => upd('anthropicKey', e.target.value)}
            className={iCls} placeholder="sk-ant-..." />
        </Field>
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-xs text-amber-400 flex gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>Em produção, a API key não deve ficar no browser. Use um backend (ex: Vercel Edge Function) como proxy. Funciona em desenvolvimento sem restrições.</span>
        </div>
      </div>
    </div>
  );
}

// ─── GERAL ────────────────────────────────────────────────────────────────────

function GeneralTab({ config, setConfig }) {
  return (
    <div className="max-w-xl space-y-5">
      <h3 className="text-xl font-black mb-2">Configurações Gerais</h3>

      <Field label="Logo do Navbar (imagem)">
        <ImageUpload
          value={config.site?.logoUrl || ''}
          onChange={v => setConfig(p => ({ ...p, site: { ...p.site, logoUrl: v } }))}
          config={config}
          label=""
        />
        <p className="text-gray-600 text-xs mt-1">Upload ou URL. Altura ideal: 40px. Deixar vazio usa texto "RETRO MUNDIAL".</p>
      </Field>

      <Field label="Subtítulo do Logo (só aparece quando não há imagem)">
        <input value={config.site?.logoSubtitle || ''}
          onChange={e => setConfig(p => ({ ...p, site: { ...p.site, logoSubtitle: e.target.value } }))}
          placeholder="Moments That Matter"
          className={iCls} />
      </Field>

      <Field label="Barra de Anúncio (topo da página)">
        <input value={config.site.announcementBar}
          onChange={e => setConfig(p => ({ ...p, site: { ...p.site, announcementBar: e.target.value } }))}
          className={iCls} />
      </Field>

      <Field label="Atraso do Pop-up de E-mail (segundos)">
        <input type="number" min="3" max="60" value={config.site.popupDelaySecs}
          onChange={e => setConfig(p => ({ ...p, site: { ...p.site, popupDelaySecs: parseInt(e.target.value) } }))}
          className={iCls} />
        <p className="text-gray-600 text-xs mt-1">Recomendado: 8-10s. Aparece 1× por sessão.</p>
      </Field>

      <Field label="Limite para Frete Grátis (€)">
        <input type="number" step="0.01" value={config.site.freeShippingThreshold}
          onChange={e => setConfig(p => ({ ...p, site: { ...p.site, freeShippingThreshold: parseFloat(e.target.value) } }))}
          className={iCls} />
      </Field>

      <Field label="Senha do Admin">
        <input type="password" value={config.adminPassword}
          onChange={e => setConfig(p => ({ ...p, adminPassword: e.target.value }))}
          className={iCls} />
      </Field>

      <div className="bg-gray-900 border border-gray-800 p-4 rounded-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-sm">Números de Prova Social</p>
            <p className="text-gray-500 text-xs mt-0.5">"2,400+ vendidos", "50k colecionadores", etc.</p>
          </div>
          <Toggle
            value={config.socialProof?.enabled}
            onChange={v => setConfig(p => ({ ...p, socialProof: { ...p.socialProof, enabled: v } }))}
          />
        </div>
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-xs text-red-400 flex gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>Ative apenas com dados reais. Números fabricados violam a legislação de consumidor da UE e podem reprovar anúncios no Meta.</span>
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

function fmt(n, decimals = 0) {
  if (n === undefined || n === null) return '—';
  return Number(n).toLocaleString('pt-PT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtEur(n) { return '€' + fmt(n, 2); }
function fmtK(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : fmt(n); }

const PERIODS = [
  { label: '7 dias',  days: 7  },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
];

function daysAgoStr(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ─── CAMPAIGN DRAWER ──────────────────────────────────────────────────────────

function CampaignDrawer({ campaign, period, onClose }) {
  const [daily,    setDaily]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [aiText,   setAiText]  = useState('');
  const [aiLoad,   setAiLoad]  = useState(false);
  const [metric,   setMetric]  = useState('spend'); // spend | impressions | clicks | conversions

  const since = daysAgoStr(period);
  const until = new Date().toISOString().slice(0,10);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setDaily([]);
      setAiText('');
      const source = campaign.platform === 'meta' ? 'meta-daily' : 'tiktok-daily';
      const r = await fetch(`/api/analytics?source=${source}&campaign_id=${campaign.id}&since=${since}&until=${until}`)
        .then(x => x.json()).catch(() => null);
      const days = r?.daily || [];
      setDaily(days);
      setLoading(false);
      if (days.length > 0) runAI(days);
    }
    load();
  }, [campaign.id, period]);

  async function runAI(days) {
    setAiLoad(true);
    const totalSpend = days.reduce((s,d) => s + d.spend, 0);
    const totalRev   = days.reduce((s,d) => s + d.revenue, 0);
    const totalConv  = days.reduce((s,d) => s + d.conversions, 0);
    const totalClk   = days.reduce((s,d) => s + d.clicks, 0);
    const totalImpr  = days.reduce((s,d) => s + d.impressions, 0);
    const roas = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : 0;
    const ctr  = totalImpr  > 0 ? ((totalClk / totalImpr)*100).toFixed(2) : 0;
    const cvr  = totalClk   > 0 ? ((totalConv / totalClk)*100).toFixed(2) : 0;
    const cpa  = totalConv  > 0 ? (totalSpend / totalConv).toFixed(2) : 0;

    // últimos 3 vs primeiros 3 para detectar tendência
    const trend = days.length >= 6 ? (() => {
      const first3 = days.slice(0,3).reduce((s,d) => s+d.spend,0);
      const last3  = days.slice(-3).reduce((s,d) => s+d.spend,0);
      return last3 > first3 ? 'crescendo' : 'diminuindo';
    })() : 'estável';

    const prompt = `Analisa esta campanha de Facebook/Meta Ads da Retro Mundial (camisetas de futebol premium):

Campanha: "${campaign.name}"
Período: últimos ${period} dias
Métricas:
- Ad Spend: €${totalSpend.toFixed(2)}
- Receita: €${totalRev.toFixed(2)}
- ROAS: ${roas}x
- Impressões: ${totalImpr.toLocaleString()}
- Cliques: ${totalClk.toLocaleString()}
- CTR: ${ctr}%
- Conversões: ${totalConv}
- CVR (click→compra): ${cvr}%
- CPA: €${cpa}
- Tendência de spend: ${trend}

Dá uma análise direta e acionável em português. Responde em 3 partes:
1. DIAGNÓSTICO: está indo bem, mal ou ok? (1-2 frases)
2. PROBLEMAS: o que está fraco (máx 2 pontos)
3. AÇÕES: o que fazer agora (máx 2 pontos concretos)

Sê direto, específico e usa números. Máx 120 palavras total.`;

    try {
      const r = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      });
      const d = await r.json();
      setAiText(d.content || d.error || 'Erro na análise.');
    } catch { setAiText('Erro ao conectar com IA.'); }
    setAiLoad(false);
  }

  const roas = campaign.spend > 0 ? campaign.revenue / campaign.spend : 0;
  const ctr  = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions)*100) : 0;
  const cvr  = campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks)*100) : 0;

  // SVG line chart
  const chartW = 600; const chartH = 120;
  const vals = daily.map(d => d[metric] ?? 0);
  const maxV = Math.max(...vals, 1);
  const pts  = vals.map((v, i) => {
    const x = vals.length > 1 ? (i / (vals.length - 1)) * chartW : chartW / 2;
    const y = chartH - (v / maxV) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const metricColors = { spend: '#F59E0B', impressions: '#60a5fa', clicks: '#34d399', conversions: '#a78bfa' };
  const metricLabels = { spend: 'Spend (€)', impressions: 'Impressões', clicks: 'Cliques', conversions: 'Conversões' };

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/60" onClick={onClose} />
      {/* drawer */}
      <div className="w-full max-w-2xl bg-gray-950 border-l border-gray-800 flex flex-col overflow-y-auto">
        {/* header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-800 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${campaign.platform === 'meta' ? 'bg-blue-900/60 text-blue-300' : 'bg-pink-900/60 text-pink-300'}`}>
                {campaign.platform === 'meta' ? 'Meta' : 'TikTok'}
              </span>
              {campaign.mock && <span className="text-xs text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded">dados simulados</span>}
            </div>
            <h3 className="font-black text-lg text-white leading-tight">{campaign.name}</h3>
            <p className="text-gray-500 text-xs mt-0.5">Últimos {period} dias · {daily.length} pontos de dados</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* KPI GRID */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Ad Spend',    value: fmtEur(campaign.spend),       color: 'text-white' },
              { label: 'Receita',     value: fmtEur(campaign.revenue),     color: 'text-amber-400' },
              { label: 'ROAS',        value: roas > 0 ? roas.toFixed(1)+'x' : '—', color: roas >= 3 ? 'text-green-400' : roas >= 1 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Impressões',  value: fmtK(campaign.impressions),   color: 'text-blue-400' },
              { label: 'CTR',         value: ctr.toFixed(2)+'%',           color: ctr >= 1.5 ? 'text-green-400' : ctr >= 0.8 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Conversões',  value: fmt(campaign.conversions),    color: 'text-purple-400' },
              { label: 'Cliques',     value: fmtK(campaign.clicks),        color: 'text-teal-400' },
              { label: 'CVR',         value: cvr.toFixed(2)+'%',           color: cvr >= 2 ? 'text-green-400' : cvr >= 0.5 ? 'text-amber-400' : 'text-red-400' },
              { label: 'CPC',         value: fmtEur(campaign.cpc),         color: 'text-white' },
            ].map((k, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-sm p-3">
                <p className="text-xs text-gray-500 mb-0.5">{k.label}</p>
                <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* GRÁFICO DE TEMPO */}
          <div className="bg-gray-900 border border-gray-800 rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm">Performance ao Longo do Tempo</h4>
              <div className="flex gap-1">
                {Object.entries(metricLabels).map(([key, label]) => (
                  <button key={key} onClick={() => setMetric(key)}
                    className={`text-xs px-2 py-1 rounded transition-colors font-semibold ${metric === key ? 'text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    style={metric === key ? { background: metricColors[key] } : {}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
                <RefreshCw size={16} className="animate-spin mr-2" /> Carregando...
              </div>
            ) : daily.length > 1 ? (
              <>
                <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full" style={{ height: 140 }}>
                  {/* grade horizontal */}
                  {[0.25, 0.5, 0.75, 1].map(r => (
                    <line key={r} x1="0" y1={(chartH * (1-r)).toFixed(1)} x2={chartW} y2={(chartH * (1-r)).toFixed(1)}
                      stroke="#1f2937" strokeWidth="1" />
                  ))}
                  {/* área preenchida */}
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={metricColors[metric]} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={metricColors[metric]} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {vals.length > 1 && (
                    <polygon
                      points={`0,${chartH} ${pts} ${chartW},${chartH}`}
                      fill="url(#lineGrad)"
                    />
                  )}
                  {/* linha */}
                  <polyline points={pts} fill="none" stroke={metricColors[metric]} strokeWidth="2" strokeLinejoin="round" />
                  {/* pontos */}
                  {vals.map((v, i) => {
                    const x = vals.length > 1 ? (i / (vals.length - 1)) * chartW : chartW / 2;
                    const y = chartH - (v / maxV) * chartH;
                    return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill={metricColors[metric]} opacity="0.8" />;
                  })}
                  {/* datas */}
                  {daily.length > 0 && (
                    <>
                      <text x="0"      y={chartH+16} fontSize="10" fill="#6b7280">{daily[0]?.date?.slice(5)}</text>
                      <text x={chartW} y={chartH+16} fontSize="10" fill="#6b7280" textAnchor="end">{daily[daily.length-1]?.date?.slice(5)}</text>
                    </>
                  )}
                </svg>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Mín: <strong style={{ color: metricColors[metric] }}>{metric === 'spend' || metric === 'revenue' ? fmtEur(Math.min(...vals)) : fmt(Math.min(...vals))}</strong></span>
                  <span>Méd: <strong style={{ color: metricColors[metric] }}>{metric === 'spend' || metric === 'revenue' ? fmtEur(vals.reduce((a,b)=>a+b,0)/vals.length) : fmt(Math.round(vals.reduce((a,b)=>a+b,0)/vals.length))}</strong></span>
                  <span>Máx: <strong style={{ color: metricColors[metric] }}>{metric === 'spend' || metric === 'revenue' ? fmtEur(Math.max(...vals)) : fmt(Math.max(...vals))}</strong></span>
                </div>
              </>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-600 text-sm">Sem dados suficientes</div>
            )}
          </div>

          {/* ANÁLISE IA */}
          <div className="bg-gray-900 border border-gray-800 rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="text-amber-500" />
              <h4 className="font-bold text-sm">Análise IA</h4>
              {aiLoad && <RefreshCw size={12} className="animate-spin text-gray-500" />}
              {!aiLoad && !aiText && (
                <button onClick={() => runAI(daily)} className="text-xs text-amber-500 hover:text-amber-400 ml-auto">Analisar</button>
              )}
              {!aiLoad && aiText && (
                <button onClick={() => runAI(daily)} className="text-xs text-gray-500 hover:text-gray-400 ml-auto flex items-center gap-1">
                  <RefreshCw size={10} /> Reanalisar
                </button>
              )}
            </div>
            {aiLoad ? (
              <div className="text-gray-500 text-sm italic">A IA está analisando a campanha...</div>
            ) : aiText ? (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{aiText}</div>
            ) : (
              <div className="text-gray-600 text-sm">Aguardando dados para análise...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FUNNEL TAB ───────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  ok:       { bar: 'bg-green-500',  text: 'text-green-400',  label: 'OK' },
  warning:  { bar: 'bg-amber-500',  text: 'text-amber-400',  label: 'Atenção' },
  critical: { bar: 'bg-red-500',    text: 'text-red-400',    label: 'Crítico' },
  warming:  { bar: 'bg-blue-500',   text: 'text-blue-400',   label: 'A aquecer' },
  nodata:   { bar: 'bg-gray-700',   text: 'text-gray-500',   label: 'Sem dados' },
};

function FunnelTab() {
  const [days, setDays] = useState(7);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsModel, setInsightsModel] = useState(null);

  useEffect(() => { loadFunnel(); }, [days]);

  async function loadFunnel() {
    setLoading(true);
    try {
      const r = await fetch(`/api/funnel?days=${days}`);
      const data = await r.json();
      setFunnel(data.success ? data : null);
    } catch {
      setFunnel(null);
    }
    setLoading(false);
  }

  async function analyze(deep) {
    if (!funnel) return;
    setInsightsLoading(true);
    setInsights(null);
    try {
      const r = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnel, deep }),
      });
      const data = await r.json();
      if (data.success) {
        setInsights(data.insights);
        setInsightsModel(data.model);
      } else {
        setInsights(`Erro: ${data.error}`);
      }
    } catch (e) {
      setInsights(`Erro: ${e.message}`);
    }
    setInsightsLoading(false);
  }

  const stages = funnel?.current || [];
  const prevByKey = Object.fromEntries((funnel?.previous || []).map(s => [s.key, s]));
  const maxVal = Math.max(...stages.map(s => s.value), 1);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black">FUNIL DE VENDAS</h2>
          <p className="text-gray-500 text-sm">Impressões → Compra · {funnel?.period ? `${funnel.period.since} a ${funnel.period.until}` : ''}</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                days === d ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {d}d
            </button>
          ))}
          <button onClick={loadFunnel} className="px-3 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Aviso de tracking a aquecer */}
      {funnel?.data_note && (
        <div className="mb-4 bg-blue-950/40 border border-blue-800/50 rounded-sm p-3 flex gap-2">
          <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-200 text-xs leading-relaxed">
            <span className="font-bold">Tracking a aquecer ({Math.round((funnel.tracking_coverage || 0) * 100)}% do período):</span>{' '}
            os estágios de pixel ainda estão subcontados porque o rastreamento ligou há pouco. Não é o pixel quebrado — normaliza nos próximos dias.
          </p>
        </div>
      )}

      {/* KPIs do topo */}
      {funnel && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-sm">
            <div className="text-xs text-gray-500 uppercase font-bold">Gasto Ads</div>
            <div className="text-xl font-black mt-1">€{(funnel.spend ?? 0).toFixed(2)}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-sm">
            <div className="text-xs text-gray-500 uppercase font-bold">Receita</div>
            <div className="text-xl font-black mt-1 text-green-400">€{(funnel.revenue ?? 0).toFixed(2)}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-sm">
            <div className="text-xs text-gray-500 uppercase font-bold">ROAS</div>
            <div className={`text-xl font-black mt-1 ${funnel.roas >= 2 ? 'text-green-400' : funnel.roas >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
              {funnel.roas != null ? funnel.roas.toFixed(2) : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Funil */}
      {loading && !funnel ? (
        <div className="text-gray-500 py-12 text-center">A carregar funil…</div>
      ) : stages.length === 0 ? (
        <div className="text-gray-500 py-12 text-center">Sem dados — verifica META_ACCESS_TOKEN e a tabela funnel_events no Supabase.</div>
      ) : (
        <div className="space-y-1.5 mb-8">
          {stages.map((s, i) => {
            const st = STATUS_STYLES[s.status] || STATUS_STYLES.nodata;
            const prev = prevByKey[s.key];
            const delta = prev && prev.value > 0 ? ((s.value - prev.value) / prev.value) * 100 : null;
            return (
              <div key={s.key} className="bg-gray-900 border border-gray-800 rounded-sm p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{s.label}</span>
                    <span className="text-[10px] text-gray-600 uppercase">{s.source}</span>
                    {i > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-black/40 ${st.text}`}>
                        {s.rate != null ? `${(s.rate * 100).toFixed(1)}%` : '—'}
                        {s.benchmark != null && ` / meta ${(s.benchmark * 100).toFixed(0)}%`}
                        {' · '}{st.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {delta != null && (
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(delta).toFixed(0)}%
                      </span>
                    )}
                    <span className="font-black text-sm">{s.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full ${st.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max((s.value / maxVal) * 100, s.value > 0 ? 2 : 0)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Análise IA */}
      <div className="border-t border-gray-800 pt-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-amber-500" />
            <h3 className="font-black text-sm uppercase tracking-widest">Análise com IA</h3>
            {insightsModel && <span className="text-[10px] text-gray-600">({insightsModel})</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => analyze(false)} disabled={insightsLoading || !funnel}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase rounded-sm transition-colors">
              {insightsLoading ? 'A analisar…' : 'Análise rápida'}
            </button>
            <button onClick={() => analyze(true)} disabled={insightsLoading || !funnel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-xs font-black uppercase rounded-sm transition-colors border border-gray-700">
              Análise profunda
            </button>
          </div>
        </div>
        {insights && (
          <div className="bg-gray-900 border border-gray-800 rounded-sm p-5 text-sm leading-relaxed">
            {insights.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h4 key={i} className="font-black text-amber-500 uppercase tracking-wide text-xs mt-4 mb-2 first:mt-0">{line.slice(3)}</h4>;
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="text-gray-300">{line}</p>;
            })}
          </div>
        )}
        {!insights && !insightsLoading && (
          <p className="text-gray-600 text-xs">Clica em "Análise rápida" para o Claude diagnosticar o funil e sugerir ações.</p>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [period, setPeriod]   = useState(30);
  const [platform, setPlatform] = useState('all');
  const [sales, setSales]     = useState(null);
  const [meta, setMeta]       = useState(null);
  const [tiktok, setTiktok]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => { loadAll(); }, [period]);

  async function loadAll() {
    setLoading(true);
    const since = daysAgoStr(period);
    const until = new Date().toISOString().slice(0, 10);
    const qs    = `?since=${since}&until=${until}`;
    const [s, m, t] = await Promise.all([
      fetch(`/api/analytics?source=sales${qs.replace('?','&')}`).then(r => r.json()).catch(() => null),
      fetch(`/api/analytics?source=meta${qs.replace('?','&')}`).then(r => r.json()).catch(() => null),
      fetch(`/api/analytics?source=tiktok${qs.replace('?','&')}`).then(r => r.json()).catch(() => null),
    ]);
    setSales(s);
    setMeta(m);
    setTiktok(t);
    setLoading(false);
  }

  // ── cálculos agregados ─────────────────────────────────────────────────────
  const allCampaigns = [
    ...(meta?.campaigns   || []),
    ...(tiktok?.campaigns || []),
  ];
  const filtered = platform === 'all' ? allCampaigns : allCampaigns.filter(c => c.platform === platform);

  const totalSpend  = filtered.reduce((s, c) => s + c.spend, 0);
  const totalConv   = filtered.reduce((s, c) => s + c.conversions, 0);
  const totalImpr   = filtered.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = filtered.reduce((s, c) => s + c.clicks, 0);
  const adRevenue   = filtered.reduce((s, c) => s + c.revenue, 0);
  const roas        = totalSpend > 0 ? adRevenue / totalSpend : 0;
  const cpa         = totalConv > 0  ? totalSpend / totalConv : 0;

  const metaCampaigns   = allCampaigns.filter(c => c.platform === 'meta');
  const tiktokCampaigns = allCampaigns.filter(c => c.platform === 'tiktok');

  function platformFunnel(campaigns) {
    const impr  = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clk   = campaigns.reduce((s, c) => s + c.clicks, 0);
    const conv  = campaigns.reduce((s, c) => s + c.conversions, 0);
    const spend = campaigns.reduce((s, c) => s + c.spend, 0);
    const rev   = campaigns.reduce((s, c) => s + c.revenue, 0);
    return { impr, clk, conv, spend, rev, roas: spend > 0 ? rev / spend : 0 };
  }

  const metaF   = platformFunnel(metaCampaigns);
  const tiktokF = platformFunnel(tiktokCampaigns);

  // ── gráfico SVG ────────────────────────────────────────────────────────────
  const daily     = sales?.daily || [];
  const maxRev    = Math.max(...daily.map(d => d.revenue), 1);
  const chartW    = 520;
  const chartH    = 100;
  const barW      = daily.length > 0 ? Math.max(2, (chartW / daily.length) - 1) : 8;

  const isMock = meta?.mock && tiktok?.mock && sales?.mock;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-black">Analytics Dashboard</h3>
          <p className="text-gray-400 text-sm mt-0.5">
            {isMock && <span className="text-amber-400 mr-2">⚠ Dados simulados — conecta as APIs para ver dados reais</span>}
            Últimos {period} dias
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Período */}
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button key={p.days} onClick={() => setPeriod(p.days)}
                className={`text-xs px-3 py-1.5 rounded-sm font-semibold transition-colors ${period === p.days ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={loadAll} disabled={loading}
            className="text-gray-500 hover:text-white p-1.5 transition">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Receita', value: fmtEur(sales?.totalRevenue), sub: `${fmt(sales?.totalOrders)} pedidos`, color: 'text-amber-400' },
          { label: 'Ticket Médio', value: fmtEur(sales?.avgOrder), sub: 'por pedido', color: 'text-white' },
          { label: 'Ad Spend', value: fmtEur(totalSpend), sub: 'Meta + TikTok', color: 'text-white' },
          { label: 'ROAS', value: roas > 0 ? roas.toFixed(1) + 'x' : '—', sub: `CPA ${fmtEur(cpa)}`, color: roas >= 3 ? 'text-green-400' : 'text-red-400' },
          { label: 'Novos Clientes', value: fmt(sales?.newCustomers), sub: `${totalConv} via ads`, color: 'text-white' },
        ].map((k, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-600 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* FUNIL + GRÁFICO */}
      <div className="grid grid-cols-2 gap-4 mb-5">

        {/* FUNIL POR PLATAFORMA */}
        <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
          <h4 className="font-black text-sm mb-4">Funil de Vendas por Plataforma</h4>
          {[
            { name: 'Meta', color: '#1877f2', badge: 'bg-blue-900/50 text-blue-300', f: metaF },
            { name: 'TikTok', color: '#ff2d55', badge: 'bg-pink-900/50 text-pink-300', f: tiktokF, mock: tiktok?.mock },
          ].map(({ name, color, badge, f, mock }) => (
            <div key={name} className="mb-5 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${badge}`}>{name}</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Spend: <strong className="text-white">{fmtEur(f.spend)}</strong></span>
                  <span>ROAS: <strong className={f.roas >= 3 ? 'text-green-400' : 'text-white'}>{f.roas > 0 ? f.roas.toFixed(1) + 'x' : '—'}</strong></span>
                  {mock && <span className="text-amber-500/70 text-xs">simulado</span>}
                </div>
              </div>
              {[
                { label: 'Impressões', value: f.impr, pct: 100 },
                { label: 'Cliques',    value: f.clk,  pct: f.impr > 0 ? (f.clk / f.impr) * 100 : 0, rate: f.impr > 0 ? ((f.clk / f.impr)*100).toFixed(1)+'% CTR' : '' },
                { label: 'Conversões', value: f.conv, pct: f.clk > 0 ? (f.conv / f.clk) * 100 : 0, rate: f.clk > 0 ? ((f.conv / f.clk)*100).toFixed(2)+'% CVR' : '' },
                { label: 'Receita',    value: '€'+fmt(f.rev, 0), pct: f.conv > 0 ? Math.min((f.conv / f.clk) * 200, 100) : 0 },
              ].map((step, si) => (
                <div key={si} className="flex items-center gap-2 mb-1.5">
                  <div className="w-20 text-xs text-gray-500 text-right flex-shrink-0">{step.label}</div>
                  <div className="flex-1 bg-gray-800 rounded-sm h-5 relative overflow-hidden">
                    <div className="h-full rounded-sm transition-all" style={{ width: `${Math.max(step.pct, 2)}%`, background: color, opacity: 0.3 + (si * 0.2) }} />
                  </div>
                  <div className="w-20 text-xs text-right flex-shrink-0">
                    <span className="text-white font-semibold">{typeof step.value === 'number' ? fmtK(step.value) : step.value}</span>
                    {step.rate && <span className="text-gray-600 ml-1">{step.rate}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* GRÁFICO DE RECEITA */}
        <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-sm">Receita Diária</h4>
            <span className="text-xs text-gray-500">{daily.length} dias</span>
          </div>
          {daily.length > 0 ? (
            <>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: 120 }}>
                {daily.map((d, i) => {
                  const h = Math.max(2, (d.revenue / maxRev) * chartH);
                  const x = i * (chartW / daily.length);
                  return (
                    <g key={i}>
                      <rect x={x} y={chartH - h} width={barW} height={h} fill="#F59E0B" opacity="0.8" rx="1" />
                    </g>
                  );
                })}
              </svg>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>{daily[0]?.date?.slice(5)}</span>
                <span className="text-amber-400 font-bold">Total: {fmtEur(sales?.totalRevenue)}</span>
                <span>{daily[daily.length-1]?.date?.slice(5)}</span>
              </div>
            </>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
              {loading ? 'Carregando...' : 'Sem dados no período'}
            </div>
          )}

          {/* PIPELINE DE CLIENTES */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs font-bold text-gray-400 mb-3">Pipeline de Clientes</p>
            <div className="space-y-1.5">
              {[
                { key: 'visitor',       label: 'Visitantes',   color: 'bg-gray-600' },
                { key: 'cart_abandoned',label: 'Abandonaram',  color: 'bg-red-700' },
                { key: 'purchased',     label: 'Compraram',    color: 'bg-amber-600' },
                { key: 'completed',     label: 'Entregue',     color: 'bg-green-700' },
                { key: 'cancelled',     label: 'Cancelado',    color: 'bg-gray-700' },
              ].map(s => {
                const val  = sales?.pipeline?.[s.key] || 0;
                const total = Object.values(sales?.pipeline || {}).reduce((a, b) => a + b, 0) || 1;
                const pct  = Math.round((val / total) * 100);
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className="w-20 text-xs text-gray-500">{s.label}</div>
                    <div className="flex-1 bg-gray-800 rounded-sm h-3">
                      <div className={`h-full rounded-sm ${s.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-10 text-xs text-right text-gray-400">{fmt(val)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TABELA DE CAMPANHAS */}
      <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-black text-sm">Campanhas — {filtered.length} ativas</h4>
            <p className="text-xs text-gray-600 mt-0.5">Clique numa campanha para ver detalhes e análise IA</p>
          </div>
          <div className="flex gap-1.5">
            {[['all','Todas'],['meta','Meta'],['tiktok','TikTok']].map(([v,l]) => (
              <button key={v} onClick={() => setPlatform(v)}
                className={`text-xs px-3 py-1 rounded-full transition-colors font-semibold ${platform === v ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500">
                <th className="text-left pb-2 pr-4 font-semibold">Campanha</th>
                <th className="text-right pb-2 px-3 font-semibold">Spend</th>
                <th className="text-right pb-2 px-3 font-semibold">Impressões</th>
                <th className="text-right pb-2 px-3 font-semibold">Cliques</th>
                <th className="text-right pb-2 px-3 font-semibold">CTR</th>
                <th className="text-right pb-2 px-3 font-semibold">CPC</th>
                <th className="text-right pb-2 px-3 font-semibold">Conv.</th>
                <th className="text-right pb-2 px-3 font-semibold">Receita</th>
                <th className="text-right pb-2 pl-3 font-semibold">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-6 text-gray-600">Sem campanhas no período</td></tr>
              ) : (
                filtered.sort((a, b) => b.spend - a.spend).map(c => {
                  const r = c.spend > 0 ? c.revenue / c.spend : 0;
                  return (
                    <tr key={c.id} onClick={() => setSelectedCampaign(c)}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
                      <td className="py-2.5 pr-4">
                        <span className={`inline-block text-xs px-1.5 py-0.5 rounded mr-2 font-bold ${c.platform === 'meta' ? 'bg-blue-900/60 text-blue-300' : 'bg-pink-900/60 text-pink-300'}`}>
                          {c.platform === 'meta' ? 'Meta' : 'TikTok'}
                        </span>
                        <span className="text-white">{c.name}</span>
                      </td>
                      <td className="text-right py-2.5 px-3 text-white font-semibold">{fmtEur(c.spend)}</td>
                      <td className="text-right py-2.5 px-3 text-gray-400">{fmtK(c.impressions)}</td>
                      <td className="text-right py-2.5 px-3 text-gray-400">{fmtK(c.clicks)}</td>
                      <td className="text-right py-2.5 px-3 text-gray-400">{c.ctr.toFixed(1)}%</td>
                      <td className="text-right py-2.5 px-3 text-gray-400">{fmtEur(c.cpc)}</td>
                      <td className="text-right py-2.5 px-3 text-white">{fmt(c.conversions)}</td>
                      <td className="text-right py-2.5 px-3 text-amber-400 font-semibold">{fmtEur(c.revenue)}</td>
                      <td className={`text-right py-2.5 pl-3 font-black ${r >= 4 ? 'text-green-400' : r >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                        {r > 0 ? r.toFixed(1) + 'x' : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td className="pt-2.5 pr-4 text-gray-400 font-semibold">Total</td>
                  <td className="text-right pt-2.5 px-3 text-white font-black">{fmtEur(totalSpend)}</td>
                  <td className="text-right pt-2.5 px-3 text-gray-400">{fmtK(totalImpr)}</td>
                  <td className="text-right pt-2.5 px-3 text-gray-400">{fmtK(totalClicks)}</td>
                  <td className="text-right pt-2.5 px-3 text-gray-400">{totalImpr > 0 ? ((totalClicks/totalImpr)*100).toFixed(1)+'%' : '—'}</td>
                  <td className="text-right pt-2.5 px-3 text-gray-400">{totalClicks > 0 ? fmtEur(totalSpend/totalClicks) : '—'}</td>
                  <td className="text-right pt-2.5 px-3 text-white font-black">{fmt(totalConv)}</td>
                  <td className="text-right pt-2.5 px-3 text-amber-400 font-black">{fmtEur(adRevenue)}</td>
                  <td className={`text-right pt-2.5 pl-3 font-black ${roas >= 4 ? 'text-green-400' : roas >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                    {roas > 0 ? roas.toFixed(1) + 'x' : '—'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* NOTA DE CONEXÃO */}
        {(meta?.mock || tiktok?.mock) && (
          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-sm text-xs text-amber-500/70">
            {meta?.mock && <span>Meta: adiciona META_ACCESS_TOKEN e META_AD_ACCOUNT_ID no Vercel. </span>}
            {tiktok?.mock && <span>TikTok: adiciona TIKTOK_ACCESS_TOKEN e TIKTOK_ADVERTISER_ID quando disponível.</span>}
          </div>
        )}
      </div>

      {selectedCampaign && (
        <CampaignDrawer
          campaign={selectedCampaign}
          period={period}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}

// ─── KLAVIYO ──────────────────────────────────────────────────────────────────

const COMPANY_CONTEXT = `
Empresa: Retro Mundial
Produto: Camisetas oversized premium com temática de Copa do Mundo. Também bolsas retro.
Público-alvo: Homens e mulheres de 25-45 anos, fãs de futebol e colecionadores.
Preço: €36.99 por camiseta. Edição limitada de 500 unidades por design.
Produtos: Brazil 2026, Argentina Legacy, Germany Precision, England Tradition, France Elegance, Spain Passion.
Tom de voz: Premium, apaixonado, inclusivo e narrativo (storytelling). Tagline: "Moments That Matter".
Cupons: RETRO15 (15% primeira compra), AGORA10 (10% carrinho abandonado), VOLTAAQUI20 (20% recompra).
Site: retromundial.com
`.trim();

const STATIC_TEMPLATES = [
  { id: 'T3AQbE', name: 'Retro Mundial - Welcome Email' },
  { id: 'U2Fqhu', name: 'Retro Mundial - Abandoned Cart' },
  { id: 'T9LACF', name: 'Retro Mundial - Post Purchase' },
];

const BLANK_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#000;padding:32px 40px;text-align:center;border-bottom:3px solid #F59E0B;">
        <div style="font-size:22px;font-weight:900;color:#fff;">RETRO MUNDIAL</div>
        <div style="font-size:11px;color:#F59E0B;letter-spacing:4px;margin-top:4px;">MOMENTS THAT MATTER</div>
      </td></tr>
      <tr><td style="background:#111;padding:48px 40px;text-align:center;">
        <h1 style="font-size:32px;font-weight:900;color:#fff;margin:0 0 16px;">Título do Email</h1>
        <p style="font-size:16px;color:#9ca3af;line-height:1.6;margin:0 0 32px;">Escreva o conteúdo aqui.</p>
        <a href="https://retromundial.com/shop" style="display:inline-block;background:#F59E0B;color:#000;font-weight:900;font-size:14px;padding:16px 40px;text-decoration:none;letter-spacing:2px;text-transform:uppercase;">VER COLEÇÃO →</a>
      </td></tr>
      <tr><td style="background:#000;padding:24px 40px;text-align:center;border-top:1px solid #1f2937;">
        <div style="font-size:11px;color:#6b7280;">© 2026 Retro Mundial · {% unsubscribe 'Cancelar subscrição' %}</div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

function getTemplateIcon(name) {
  if (name.includes('Welcome')) return '👋';
  if (name.includes('Abandoned') || name.includes('Cart')) return '🛒';
  if (name.includes('Post') || name.includes('Purchase')) return '🏆';
  if (name.includes('Re-engagement') || name.includes('Winback')) return '🔁';
  return '📧';
}

function KlaviyoTab({ config }) {
  const [templates, setTemplates] = useState(STATIC_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  // modal de criar/editar
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', id?, name, html }

  // painel de revisão IA
  const [chatTemplate, setChatTemplate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── sync com Klaviyo ───────────────────────────────────────────────────────
  async function syncTemplates() {
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/klaviyo?action=list');
      const json = await res.json();
      if (json.success && json.templates?.length > 0) setTemplates(json.templates);
      else if (!json.success) setApiError(json.error || 'Erro ao buscar templates.');
    } catch {
      setApiError('Sem conexão com a API. Mostrando templates locais.');
    }
    setLoading(false);
  }

  // ── abrir modal de edição (busca HTML do Klaviyo) ──────────────────────────
  async function openEdit(t) {
    setModal({ mode: 'edit', id: t.id, name: t.name, html: '<!-- carregando... -->' });
    try {
      const res = await fetch(`/api/klaviyo?action=get&id=${t.id}`);
      const json = await res.json();
      if (json.success) setModal({ mode: 'edit', id: t.id, name: t.name, html: json.html });
      else setModal(m => ({ ...m, html: BLANK_HTML }));
    } catch {
      setModal(m => ({ ...m, html: BLANK_HTML }));
    }
  }

  // ── salvar (criar ou editar) ───────────────────────────────────────────────
  async function saveTemplate() {
    if (!modal?.name.trim() || !modal?.html.trim()) return;
    setSaving(true);
    try {
      const isEdit = modal.mode === 'edit';
      const res = await fetch('/api/klaviyo', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modal.id, name: modal.name, html: modal.html }),
      });
      const json = await res.json();
      if (json.success) {
        if (isEdit) {
          setTemplates(prev => prev.map(t => t.id === modal.id ? { ...t, name: modal.name } : t));
        } else {
          setTemplates(prev => [...prev, { id: json.id, name: modal.name }]);
        }
        setModal(null);
      } else {
        alert('Erro: ' + (json.error || 'Falha ao salvar.'));
      }
    } catch {
      alert('Erro de rede.');
    }
    setSaving(false);
  }

  // ── excluir ────────────────────────────────────────────────────────────────
  async function deleteTemplate(t) {
    if (!window.confirm(`Excluir "${t.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/klaviyo?id=${t.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) setTemplates(prev => prev.filter(x => x.id !== t.id));
      else alert('Erro ao excluir: ' + json.error);
    } catch {
      alert('Erro de rede.');
    }
  }

  // ── chat IA ────────────────────────────────────────────────────────────────
  function openReview(t) {
    setChatTemplate(t);
    setMessages([{
      role: 'assistant',
      content: `Olá! Vou revisar **"${t.name}"** com base no contexto da Retro Mundial.\n\nDigite **/revisar** para análise completa, ou faça uma pergunta específica sobre assunto, CTA, urgência ou copywriting.`,
    }]);
  }

  async function sendMessage() {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setThinking(true);
    try {
      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          system: `Você é especialista em email marketing premium para e-commerce de moda/esporte.
Ajude a equipe da Retro Mundial a melhorar templates de email no Klaviyo.

${COMPANY_CONTEXT}

TEMPLATE: ${chatTemplate?.name}

Responda sempre em português. Seja específico — mostre versão original e melhorada. Foque em: assunto, pré-header, CTA, urgência, personalização. Máximo 3-4 sugestões por vez.`,
          anthropicKey: config.integrations?.anthropicKey,
        }),
      });
      const json = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: json.content || '❌ Erro: verifique a Claude API Key em Integrações.',
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro de rede.' }]);
    }
    setThinking(false);
  }

  const hasKlaviyo = !!process.env.KLAVIYO_API_KEY; // sempre false no browser — só indicativo

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-black">Klaviyo — Email Templates</h3>
          <p className="text-gray-400 text-sm mt-0.5">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={syncTemplates} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-sm transition-colors disabled:opacity-40">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sincronizar
          </button>
          <button onClick={() => setModal({ mode: 'create', name: '', html: BLANK_HTML })}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-3 py-1.5 rounded-sm transition-colors">
            <Plus size={13} /> Novo Template
          </button>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-xs text-red-400">{apiError}</div>
      )}
      {!config.integrations?.anthropicKey && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-xs text-amber-400 flex gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>Adicione a <strong>Claude API Key</strong> em Integrações para usar a revisão com IA.</span>
        </div>
      )}

      {/* ── LAYOUT SPLIT: lista + chat ── */}
      <div className="flex gap-5">
        {/* LISTA */}
        <div className={chatTemplate ? 'w-80 flex-shrink-0' : 'flex-1 max-w-2xl'}>
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id}
                className={`bg-gray-900 border rounded-sm p-4 transition-colors ${chatTemplate?.id === t.id ? 'border-purple-600' : 'border-gray-800'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{getTemplateIcon(t.name)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{t.name}</div>
                    <div className="text-gray-600 text-xs mt-0.5">ID: {t.id}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(t)}
                      title="Editar HTML"
                      className="text-gray-500 hover:text-amber-400 p-1.5 transition rounded-sm hover:bg-gray-800">
                      <Wand2 size={14} />
                    </button>
                    <button onClick={() => openReview(t)}
                      title="Revisar com IA"
                      className="text-gray-500 hover:text-purple-400 p-1.5 transition rounded-sm hover:bg-gray-800">
                      <Bot size={14} />
                    </button>
                    <button onClick={() => deleteTemplate(t)}
                      title="Excluir"
                      className="text-gray-500 hover:text-red-400 p-1.5 transition rounded-sm hover:bg-gray-800">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-900 border border-gray-800 rounded-sm text-xs text-gray-500">
            <p className="font-bold text-gray-400 mb-1.5">Flows recomendados no Klaviyo:</p>
            <ul className="space-y-1">
              <li>• <strong className="text-gray-300">Welcome Series</strong> → trigger: List joined</li>
              <li>• <strong className="text-gray-300">Abandoned Cart</strong> → trigger: Started Checkout</li>
              <li>• <strong className="text-gray-300">Post Purchase</strong> → trigger: Placed Order</li>
            </ul>
          </div>
        </div>

        {/* CHAT IA */}
        {chatTemplate && (
          <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-sm overflow-hidden" style={{ height: 520 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={15} className="text-purple-400" />
                <span className="font-bold text-sm truncate">Revisão IA — {chatTemplate.name}</span>
              </div>
              <button onClick={() => { setChatTemplate(null); setMessages([]); }} className="text-gray-500 hover:text-white">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${msg.role === 'user' ? 'bg-amber-500 text-black' : 'bg-purple-600 text-white'}`}>
                    {msg.role === 'user' ? 'A' : <Bot size={12} />}
                  </div>
                  <div className={`max-w-[85%] text-xs rounded-sm px-3 py-2 leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-amber-500/20 text-white' : 'bg-gray-800 text-gray-200'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center"><Bot size={12} className="text-white" /></div>
                  <div className="bg-gray-800 text-gray-400 text-xs px-3 py-2 rounded-sm">Analisando...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="px-3 pt-2 flex gap-1.5 flex-wrap border-t border-gray-800 flex-shrink-0">
              {['/revisar', 'Melhore o assunto', 'Melhore o CTA', 'Adicione urgência'].map(p => (
                <button key={p} onClick={() => setInput(p)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-sm transition-colors">
                  {p}
                </button>
              ))}
            </div>
            <div className="p-3 pt-2 flex gap-2 flex-shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Pergunte sobre o template... (Enter)" className={iCls + ' flex-1 text-xs'} disabled={thinking} />
              <button onClick={sendMessage} disabled={thinking || !input.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-2 rounded-sm transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL CRIAR / EDITAR ── */}
      {modal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-sm w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
              <h3 className="font-black text-lg">{modal.mode === 'create' ? 'Novo Template' : 'Editar Template'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-4">
              <Field label="Nome do Template">
                <input value={modal.name} onChange={e => setModal(m => ({ ...m, name: e.target.value }))}
                  className={iCls} placeholder="Ex: Retro Mundial - Newsletter Junho" />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={lCls}>HTML do Email</label>
                  <span className="text-xs text-gray-600">{modal.html.length} chars</span>
                </div>
                <textarea
                  value={modal.html}
                  onChange={e => setModal(m => ({ ...m, html: e.target.value }))}
                  className={iCls + ' font-mono text-xs leading-relaxed resize-none'}
                  style={{ height: 380 }}
                  spellCheck={false}
                />
                <p className="text-gray-600 text-xs mt-1">
                  Use variáveis Klaviyo: <code className="text-amber-400">{'{{ first_name }}'}</code>, <code className="text-amber-400">{'{% unsubscribe %}'}</code>
                </p>
              </div>
            </div>

            {/* modal footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800 flex-shrink-0">
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white text-sm font-semibold">Cancelar</button>
              <button onClick={saveTemplate} disabled={saving || !modal.name.trim()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black text-sm px-5 py-2 rounded-sm transition-colors">
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Salvando...' : modal.mode === 'create' ? 'Criar Template' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit, offset: page * limit, ...(search && { search }), ...(stage !== 'all' && { stage }) });
        const res = await fetch(`/api/customers?${params}`);
        const json = await res.json();
        if (json.success) { setCustomers(json.data); setTotal(json.pagination.total); }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [page, search, stage]);

  const loadDetail = async (email) => {
    try {
      const res = await fetch(`/api/customers?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.success) setSelected(json);
    } catch (e) { console.error(e); }
  };

  const stageColors = { visitor: 'bg-gray-700 text-gray-300', cart_abandoned: 'bg-red-900/60 text-red-300', purchased: 'bg-green-900/60 text-green-300', completed: 'bg-blue-900/60 text-blue-300', cancelled: 'bg-gray-700 text-gray-400' };
  const stageLabels = { visitor: 'Visitante', cart_abandoned: '🛒 Abandonou', purchased: '💳 Comprou', completed: '📦 Entregue', cancelled: '❌ Cancelado' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black">Clientes</h3>
          <p className="text-gray-400 text-sm">{total} registados</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar email ou nome..." className={iCls + ' pl-8'} />
        </div>
        <select value={stage} onChange={e => { setStage(e.target.value); setPage(0); }} className={iCls + ' w-44'}>
          <option value="all">Todos</option>
          <option value="visitor">Visitante</option>
          <option value="cart_abandoned">Abandonou Carrinho</option>
          <option value="purchased">Comprou</option>
          <option value="completed">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="flex gap-4 h-[500px]">
        {/* LISTA */}
        <div className="w-64 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-sm overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">Carregando...</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Nenhum cliente encontrado</div>
          ) : (
            customers.map(c => (
              <button key={c.email} onClick={() => loadDetail(c.email)}
                className={`w-full text-left p-3 border-b border-gray-800 hover:bg-gray-800 transition text-sm ${selected?.customer?.email === c.email ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : ''}`}>
                <div className="font-semibold text-white truncate">{c.name || c.email}</div>
                <div className="text-gray-500 text-xs truncate">{c.email}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${stageColors[c.stage] || 'bg-gray-700 text-gray-300'}`}>{stageLabels[c.stage] || c.stage}</span>
                  <span className="text-amber-500 text-xs font-bold">€{parseFloat(c.total_spent || 0).toFixed(2)}</span>
                </div>
              </button>
            ))
          )}
          <div className="p-2 flex gap-2 border-t border-gray-800">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="flex-1 py-1.5 bg-gray-800 rounded text-xs disabled:opacity-40">← Ant.</button>
            <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / limit) - 1} className="flex-1 py-1.5 bg-amber-500 text-black rounded text-xs font-bold disabled:opacity-40">Próx. →</button>
          </div>
        </div>

        {/* DETALHE */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-gray-600 text-sm">← Selecione um cliente</div>
          ) : (
            <>
              {/* INFO */}
              <div className="bg-gray-900 border border-gray-800 rounded-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-lg">{selected.customer.name}</div>
                    <div className="text-gray-400 text-sm">{selected.customer.email}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${stageColors[selected.customer.stage]}`}>{stageLabels[selected.customer.stage]}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-800 rounded-sm p-2">
                    <div className="text-amber-500 font-black text-lg">€{selected.totalSpent.toFixed(2)}</div>
                    <div className="text-gray-500 text-xs">Total Gasto</div>
                  </div>
                  <div className="bg-gray-800 rounded-sm p-2">
                    <div className="text-white font-black text-lg">{selected.totalOrders}</div>
                    <div className="text-gray-500 text-xs">Pedidos</div>
                  </div>
                  <div className="bg-gray-800 rounded-sm p-2">
                    <div className="text-white font-bold text-sm">{selected.customer.first_purchase_at ? new Date(selected.customer.first_purchase_at).toLocaleDateString('pt-BR') : '—'}</div>
                    <div className="text-gray-500 text-xs">1ª Compra</div>
                  </div>
                </div>
              </div>

              {/* PEDIDOS */}
              {selected.orders.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-sm p-4">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Package size={14} className="text-amber-500" /> Pedidos ({selected.orders.length})</h4>
                  <div className="space-y-3">
                    {selected.orders.map(order => (
                      <div key={order.id} className="bg-gray-800 rounded-sm p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs text-gray-400">#{order.shopify_order_id} · {new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${order.status === 'completed' ? 'bg-green-900/60 text-green-300' : order.status === 'cancelled' ? 'bg-red-900/60 text-red-300' : 'bg-yellow-900/60 text-yellow-300'}`}>{order.status}</span>
                        </div>
                        {order.items.map(item => (
                          <div key={item.id} className="text-sm flex justify-between text-gray-300">
                            <span>{item.product_title} {item.variant_title ? `(${item.variant_title})` : ''} ×{item.quantity}</span>
                            <span className="text-amber-400">€{parseFloat(item.price).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between text-sm font-bold">
                          <span>Total</span><span className="text-amber-500">€{parseFloat(order.total_price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TIMELINE */}
              {selected.events.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-sm p-4">
                  <h4 className="font-bold text-sm mb-3">📅 Timeline</h4>
                  <div className="space-y-2">
                    {selected.events.map(ev => (
                      <div key={ev.id} className="flex gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-white">{ev.event_type}</span>
                          <span className="text-gray-500 ml-2">{new Date(ev.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
