import { useState } from 'react';
import {
  X, Lock, Settings, Save, Check, Package, Image, Percent,
  Zap, Globe, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw,
  Wand2, ChevronDown, ChevronUp, AlertCircle, ExternalLink, Users,
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

export default function AdminPanel({ config, setConfig, resetConfig, onClose }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [tab, setTab] = useState('products');
  const [saved, setSaved] = useState(false);

  function login() {
    if (pw === config.adminPassword) setAuthed(true);
    else setPwErr('Senha incorreta.');
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: 'products',     icon: Package, label: 'Produtos' },
    { id: 'banner',       icon: Image,   label: 'Banner' },
    { id: 'discounts',    icon: Percent, label: 'Descontos' },
    { id: 'customers',    icon: Users,   label: 'Clientes' },
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
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}>
            {saved ? <><Check size={14} /> Salvo!</> : <><Save size={14} /> Salvar</>}
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
          {tab === 'products'     && <ProductsTab     config={config} setConfig={setConfig} />}
          {tab === 'banner'       && <BannerTab        config={config} setConfig={setConfig} />}
          {tab === 'discounts'    && <DiscountsTab     config={config} setConfig={setConfig} />}
          {tab === 'customers'    && <CustomersTab     onClose={onClose} />}
          {tab === 'integrations' && <IntegrationsTab  config={config} setConfig={setConfig} />}
          {tab === 'general'      && <GeneralTab       config={config} setConfig={setConfig} />}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────

function ProductsTab({ config, setConfig }) {
  const [openId, setOpenId] = useState(config.products[0]?.id);

  function updateProduct(id, field, value) {
    setConfig(p => ({ ...p, products: p.products.map(pr => pr.id === id ? { ...pr, [field]: value } : pr) }));
  }

  function updateCopy(id, field, value) {
    setConfig(p => ({ ...p, products: p.products.map(pr => pr.id === id ? { ...pr, copy: { ...pr.copy, [field]: value } } : pr) }));
  }

  function updateVariant(productId, variantId, field, value) {
    setConfig(p => ({
      ...p,
      products: p.products.map(pr => pr.id === productId ? {
        ...pr,
        variants: pr.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
      } : pr),
    }));
  }

  function addVariant(productId) {
    const newV = { id: `v${Date.now()}`, name: 'Nova Cor', hex: '#888888', imageUrl: '', shopifyVariantId: '', inStock: true };
    setConfig(p => ({
      ...p,
      products: p.products.map(pr => pr.id === productId ? { ...pr, variants: [...pr.variants, newV] } : pr),
    }));
  }

  function removeVariant(productId, variantId) {
    setConfig(p => ({
      ...p,
      products: p.products.map(pr => pr.id === productId ? {
        ...pr, variants: pr.variants.filter(v => v.id !== variantId)
      } : pr),
    }));
  }

  async function handleGenerateCopy(product) {
    const copy = await generateCopy(product, config.integrations?.anthropicKey);
    setConfig(p => ({ ...p, products: p.products.map(pr => pr.id === product.id ? { ...pr, copy } : pr) }));
  }

  return (
    <div>
      <h3 className="text-xl font-black mb-2">Produtos</h3>
      <p className="text-gray-400 text-sm mb-6">
        Configure imagens, preços, variantes de cor e copywriting de cada produto.
        <br />
        <span className="text-amber-500">Preço Riscado</span> = campo "De:" que aparece como ~~€49,99~~ <strong>€36,99</strong> — cria percepção de desconto sem alterar o preço real.
      </p>

      <div className="space-y-3">
        {config.products.map(product => (
          <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-sm overflow-hidden">
            {/* Cabeçalho do produto */}
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => setOpenId(openId === product.id ? null : product.id)}>
              <div className="flex items-center gap-3">
                {product.variants?.[0]?.imageUrl ? (
                  <img src={product.variants[0].imageUrl} className="w-10 h-10 object-cover rounded-sm" alt="" />
                ) : (
                  <div className="w-10 h-10 bg-gray-700 rounded-sm flex items-center justify-center text-lg">
                    {{'Brazil':'🇧🇷','Argentina':'🇦🇷','Germany':'🇩🇪','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','France':'🇫🇷','Spain':'🇪🇸'}[product.country]}
                  </div>
                )}
                <div>
                  <p className="font-black text-sm">{product.name}</p>
                  <p className="text-gray-500 text-xs">€{product.price} {product.compareAtPrice ? `· De: €${product.compareAtPrice}` : ''} · {product.variants?.length} {product.variants?.length === 1 ? 'cor' : 'cores'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Toggle value={product.active} onChange={v => updateProduct(product.id, 'active', v)} />
                {openId === product.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>

            {/* Conteúdo expandido */}
            {openId === product.id && (
              <div className="p-5 border-t border-gray-800 space-y-6">

                {/* Preços */}
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-amber-500">Preços</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Preço de Venda (€)">
                      <input type="number" step="0.01" value={product.price}
                        onChange={e => updateProduct(product.id, 'price', parseFloat(e.target.value))} className={iCls} />
                    </Field>
                    <Field label="Preço Riscado / De: (€) — opcional">
                      <input type="number" step="0.01" value={product.compareAtPrice || ''}
                        onChange={e => updateProduct(product.id, 'compareAtPrice', e.target.value ? parseFloat(e.target.value) : null)}
                        className={iCls} placeholder="Ex: 49.99 (aparece riscado)" />
                      <p className="text-gray-600 text-xs mt-1">Deixe vazio para não mostrar desconto visual.</p>
                    </Field>
                    <Field label="Estoque">
                      <input type="number" value={product.stock}
                        onChange={e => updateProduct(product.id, 'stock', parseInt(e.target.value))} className={iCls} />
                    </Field>
                    <Field label="Badge">
                      <input value={product.badge} onChange={e => updateProduct(product.id, 'badge', e.target.value)} className={iCls} />
                    </Field>
                  </div>
                </div>

                {/* Variantes de cor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black text-sm uppercase tracking-wide text-amber-500">Variantes de Cor</h4>
                    <button onClick={() => addVariant(product.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-500 transition-colors">
                      <Plus size={12} /> Adicionar cor
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">Cada cor tem sua foto. Quando o cliente seleciona a cor, a foto muda — e o ID do Shopify garante que o checkout abra com a variante correta.</p>
                  <div className="space-y-4">
                    {product.variants?.map(v => (
                      <div key={v.id} className="bg-gray-800/60 p-4 rounded-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border border-gray-600" style={{ backgroundColor: v.hex }} />
                            <span className="font-bold text-sm">{v.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Toggle value={v.inStock} onChange={val => updateVariant(product.id, v.id, 'inStock', val)} label={v.inStock ? 'Em estoque' : 'Esgotado'} />
                            <button onClick={() => removeVariant(product.id, v.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Nome da cor">
                            <input value={v.name} onChange={e => updateVariant(product.id, v.id, 'name', e.target.value)} className={iCls} />
                          </Field>
                          <Field label="Cor Hex">
                            <div className="flex gap-2">
                              <input type="color" value={v.hex}
                                onChange={e => updateVariant(product.id, v.id, 'hex', e.target.value)}
                                className="w-12 h-9 rounded-sm border border-gray-700 bg-gray-900 cursor-pointer" />
                              <input value={v.hex} onChange={e => updateVariant(product.id, v.id, 'hex', e.target.value)} className={iCls} />
                            </div>
                          </Field>
                          <div className="sm:col-span-2">
                            <ImageUpload
                              label="Foto desta cor (camisa)"
                              value={v.imageUrl}
                              onChange={url => updateVariant(product.id, v.id, 'imageUrl', url)}
                              config={config}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Shopify Variant ID (para checkout direto)">
                              <input value={v.shopifyVariantId} onChange={e => updateVariant(product.id, v.id, 'shopifyVariantId', e.target.value)}
                                className={iCls} placeholder="gid://shopify/ProductVariant/123456789" />
                              <p className="text-gray-600 text-xs mt-1">Shopify Admin → Produto → clique na variante → copie o ID da URL.</p>
                            </Field>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Imagens extras */}
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3 text-amber-500">Imagens Extras (Galeria)</h4>
                  {(product.images || []).map((img, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <ImageUpload value={img} onChange={url => {
                        const imgs = [...(product.images || [])];
                        imgs[i] = url;
                        updateProduct(product.id, 'images', imgs);
                      }} config={config} />
                      <button onClick={() => {
                        const imgs = (product.images || []).filter((_, j) => j !== i);
                        updateProduct(product.id, 'images', imgs);
                      }} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => updateProduct(product.id, 'images', [...(product.images || []), ''])}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-500 mt-2 transition-colors">
                    <Plus size={12} /> Adicionar imagem
                  </button>
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
                      <input value={product.copy?.headline || ''} onChange={e => updateCopy(product.id, 'headline', e.target.value)} className={iCls} />
                    </Field>
                    <Field label="Subtítulo">
                      <input value={product.copy?.subtitle || ''} onChange={e => updateCopy(product.id, 'subtitle', e.target.value)} className={iCls} />
                    </Field>
                    <Field label="Descrição">
                      <textarea value={product.copy?.description || ''} onChange={e => updateCopy(product.id, 'description', e.target.value)} className={iCls} rows={4} />
                    </Field>
                    <Field label="Bullet 1">
                      <input value={product.copy?.bullets?.[0] || ''} onChange={e => updateCopy(product.id, 'bullets', [e.target.value, product.copy?.bullets?.[1]||'', product.copy?.bullets?.[2]||''])} className={iCls} />
                    </Field>
                    <Field label="Bullet 2">
                      <input value={product.copy?.bullets?.[1] || ''} onChange={e => updateCopy(product.id, 'bullets', [product.copy?.bullets?.[0]||'', e.target.value, product.copy?.bullets?.[2]||''])} className={iCls} />
                    </Field>
                    <Field label="Bullet 3">
                      <input value={product.copy?.bullets?.[2] || ''} onChange={e => updateCopy(product.id, 'bullets', [product.copy?.bullets?.[0]||'', product.copy?.bullets?.[1]||'', e.target.value])} className={iCls} />
                    </Field>
                    <Field label="Texto do Botão de Compra">
                      <input value={product.copy?.cta || ''} onChange={e => updateCopy(product.id, 'cta', e.target.value)} className={iCls} placeholder="Comprar Agora" />
                    </Field>
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}
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

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

function CustomersTab({ onClose }) {
  return (
    <div>
      <h3 className="text-xl font-black mb-2">Dashboard de Clientes</h3>
      <p className="text-gray-400 text-sm mb-6">
        Visualize todos os clientes, pedidos, eventos e rastreie o customer pipeline (visitante → comprou → entregue).
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-sm p-8 text-center">
        <Users size={40} className="text-amber-500 mx-auto mb-4" />
        <h4 className="text-lg font-bold mb-2">Clientes Registrados</h4>
        <p className="text-gray-400 text-sm mb-6">Visualize pedidos, itens comprados, eventos e RFM analysis.</p>

        <button
          onClick={() => {
            window.open(window.location.origin + '/?page=customers', '_blank');
          }}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-sm transition-colors"
        >
          <ExternalLink size={16} />
          Abrir Dashboard
        </button>

        <p className="text-gray-600 text-xs mt-6">O dashboard abre em uma nova aba para melhor visualização.</p>
      </div>
    </div>
  );
}
