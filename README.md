# Retro Mundial — E-commerce Premium de Futebol

Site de camisetas oversized premium com temática de Copa do Mundo. Integração full-stack com Shopify, Supabase, Stripe e Claude IA.

---

## 🚀 QUICKSTART

### 1️⃣ Setup Local (5 min)

```bash
# Clone o repositório
git clone https://github.com/adsadsjoga/retro-mundial-site.git
cd retro-mundial-site

# Instale dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas chaves (veja seção abaixo)
nano .env.local

# Rodando em desenvolvimento
npm run dev
```

Abra http://localhost:5173 no navegador.

---

## 🔑 VARIÁVEIS DE AMBIENTE

Você precisa configurar:

| Variável | Onde obter | Urgência |
|----------|-----------|----------|
| **VITE_SHOPIFY_DOMAIN** | Shopify Admin → Configurações | ✅ Agora |
| **VITE_SHOPIFY_TOKEN** | Shopify Admin → Apps → Storefront API | ✅ Agora |
| **VITE_SUPABASE_URL** | Supabase → Settings → API | ✅ Agora |
| **VITE_SUPABASE_KEY** | Supabase → Settings → API (publicável) | ✅ Agora |
| **SUPABASE_KEY** (privada) | Supabase → Settings → API (service role) | ⚠️ Backend só |
| **ANTHROPIC_API_KEY** | console.anthropic.com → API Keys | ⚠️ Opcional (para gerar copy com IA) |
| **VITE_META_PIXEL_ID** | Seu Pixel ID do Facebook | ⚠️ Opcional (rastreamento) |

### Setup Supabase (2 min)

1. Crie conta grátis em [supabase.com](https://supabase.com)
2. Novo projeto → complete os dados
3. Settings → API → copie `Project URL` e `anon key` (publicável)
4. Copie também a `service_role_key` (privada — só para .env backend)
5. SQL Editor → cole o conteúdo de `api/supabase/schema.sql` → Execute
   - Isso cria todas as tabelas (products, faq, reviews, customers)

### Setup Shopify

1. Shopify Admin → Settings → Apps → Develop apps
2. Create app → nome "Retro Mundial" → Create
3. Configuration → Admin API scopes → habilite:
   - `read_products`
   - `read_inventory`
4. Storefront API access scopes → habilite:
   - `read_products`
   - `read_inventory`
5. Copie o **Storefront API access token** → `VITE_SHOPIFY_TOKEN`
6. Copie seu domínio Shopify (ex: `shop.retromundial.com`) → `VITE_SHOPIFY_DOMAIN`

### Testar Conexão Shopify

```bash
# Localmente
curl http://localhost:5173/api/shopify/test

# Ou abra no navegador
http://localhost:5173/api/shopify/test
```

Você deve ver:
```json
{
  "success": true,
  "productsFound": 3,
  "sampleProducts": [...]
}
```

---

## 🏗️ ESTRUTURA DO PROJETO

```
retromundial-site/
├── src/
│   ├── App.jsx              — Componente raiz
│   ├── config.js            — Configuração (localStorage)
│   ├── shopify.js           — API do Shopify
│   ├── hooks/
│   │   ├── useLocalStorage  — Carrinho persistente
│   │   └── useFAQ           — Perguntas frequentes
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── Product.jsx
│   │   └── About.jsx        — Quem Somos (novo!)
│   └── components/
│       ├── Admin.jsx
│       ├── Cart.jsx
│       └── ...
│
├── api/
│   ├── shopify/
│   │   ├── webhook.js       — Recebe updates do Shopify
│   │   └── test.js          — Testa conexão
│   ├── supabase/
│   │   ├── client.js        — Conexão BD
│   │   └── schema.sql       — SQL das tabelas
│   ├── faq.js               — API de FAQ
│   └── generate-copy.js     — Claude IA para copywriting
│
├── vercel.json              — Configuração Vercel
├── .env.example
└── README.md
```

---

## 📦 DEPLOY NA VERCEL

### 1. Push ao GitHub

```bash
git add .
git commit -m "Setup inicial com Supabase e backend"
git push origin main
```

### 2. Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. New Project → Import from Git → selecione `retro-mundial-site`
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Clique em Deploy

### 3. Adicionar Variáveis de Ambiente

No painel Vercel:
1. Settings → Environment Variables
2. Adicione todas as variáveis do `.env.example` (veja seção acima)
3. ⚠️ **IMPORTANTE:** As variáveis **SUPABASE_KEY** (privada) e **ANTHROPIC_API_KEY** só serão visíveis para Vercel Functions — não chegam no frontend

---

## 🔄 SINCRONIZAÇÃO SHOPIFY

Quando você atualiza estoque ou produtos no Shopify, o site sincroniza automaticamente:

1. **Configurar webhook no Shopify:**
   - Shopify Admin → Settings → Webhooks
   - Create webhook → Topic: `products/update`, `inventory_levels/update`
   - URL: `https://seu-dominio-vercel.vercel.app/api/shopify/webhook`
   - API version: `2024-01`

2. **Como funciona:**
   - Shopify envia POST para `/api/shopify/webhook`
   - Vercel recebe e atualiza Supabase
   - Frontend faz polling a cada 30s → busca dados frescos

---

## ✨ FEATURES IMPLEMENTADAS

- ✅ **Carrinho persistente** (localStorage — salva entre abas)
- ✅ **FAQ dinâmico** por produto (admin pode adicionar/editar)
- ✅ **Página "Quem Somos"** (gerada com Claude IA)
- ✅ **Sincronização Shopify** (webhooks + pooling)
- ✅ **Meta Pixel** integrado
- ⏳ **Stripe integration** (próxima fase)
- ⏳ **Dashboard de análise** (Facebook, TikTok, etc — próxima fase)

---

## 🚨 CHECKLIST PRÉ-PRODUÇÃO

- [ ] Domínio Shopify configurado
- [ ] Token Shopify com permissões corretas
- [ ] Supabase tabelas criadas (execute schema.sql)
- [ ] Variáveis de ambiente no .env.local
- [ ] Testar `/api/shopify/test` retorna produtos
- [ ] Vercel conectada e variáveis configuradas lá também
- [ ] Webhook Shopify apontando para Vercel
- [ ] Email Klaviyo sincronizando
- [ ] Meta Pixel rastreando corretamente

---

## 🆘 TROUBLESHOOTING

### "Shopify token invalid"
- Verifique se copiou o **Storefront API** access token (não o Admin token)
- Verifique se as permissões estão habilitadas

### "Supabase connection error"
- Confira que a URL tem formato `https://...supabase.co`
- Verifique se a `VITE_SUPABASE_KEY` está correta (deve ser a **anonButton**, publicável)

### "Products não aparecem no site"
- Verifique em `/api/shopify/test` se a conexão está funcionando
- Se test passar mas products não aparecem, o admin pode ter deletado os produtos

### "FAQ não salva"
- Confira se `SUPABASE_KEY` (privada) está em `.env` (não em `.env.local`)
- Verifique se a tabela `faq` foi criada no Supabase (execute schema.sql)

---

## 📞 SUPORTE

- GitHub Issues: [adsadsjoga/retro-mundial-site/issues](https://github.com/adsadsjoga/retro-mundial-site/issues)
- Email: [seu-email aqui]

---

**Made with ❤️ for football culture.**
