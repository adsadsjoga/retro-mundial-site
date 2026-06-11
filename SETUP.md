# 🚀 SETUP PASSO-A-PASSO

## ANTES DE COMEÇAR

Você precisa de contas nesses serviços (todas grátis):
- ✅ **GitHub** (já tem)
- ✅ **Vercel** (já tem)
- 🆕 **Supabase** (grátis)

---

## FASE 1: SETUP SUPABASE (5 min)

### 1.1 Criar conta e projeto

1. Vá em [supabase.com](https://supabase.com)
2. Clique "Start your project"
3. Faça login com GitHub (adsadsjoga)
4. Clique "New project"
5. Preencha:
   - **Project name:** `retro-mundial` (ou qualquer nome)
   - **Database password:** crie uma senha forte
   - **Region:** eu-west (Europa, mais rápido)
6. Clique "Create new project" → aguarde (leva ~2 min)

### 1.2 Obter as chaves de API

Quando terminar (verá um botão "Connecting..." → "Connected"):

1. Clique em "Settings" (engrenagem no canto inferior esquerdo)
2. Clique em "API" na sidebar
3. Você verá:
   ```
   Project URL: https://ysjszbbndltnyvaevwrh.supabase.co
   anon public key: sb_publishable_...
   service_role key: eyJhbGc...
   ```

**Salve esses valores** em um bloco de notas temporário.

### 1.3 Executar o schema SQL

1. Clique em "SQL Editor" na sidebar
2. Clique "New query"
3. Copie o conteúdo de `api/supabase/schema.sql` (do projeto)
4. Cole no editor
5. Clique "Run" (ou Cmd+Enter)

✅ Pronto! Suas tabelas (products, faq, reviews, customers) foram criadas.

---

## FASE 2: SETUP SHOPIFY (5 min)

### 2.1 Obter Storefront API Token

1. Acesse [shop.retromundial.com/admin](https://shop.retromundial.com/admin)
2. Vá em **Settings** → **Apps and integrations**
3. Clique **Develop apps**
4. Se não tiver "Retro Mundial" app, clique "Create an app"
   - Nome: "Retro Mundial"
   - Clique "Create app"
5. Abra "Configuration" da app
6. Em **Admin API scopes**, certifique-se que essas estão habilitadas:
   - `read_products`
   - `read_inventory`
7. Em **Storefront API access scopes**, habilite:
   - `read_products`
   - `read_inventory`
8. Clique "Save"
9. Clique em "Storefront API access tokens"
10. Copie o **access token** (long string começando com `shpat_`)

✅ Token copiado!

### 2.2 Obter domínio Shopify

Seu domínio é: **shop.retromundial.com**

---

## FASE 3: SETUP LOCAL (5 min)

### 3.1 Clonar o repositório

```bash
cd ~/Documentos  # ou qualquer pasta
git clone https://github.com/adsadsjoga/retro-mundial-site.git
cd retro-mundial-site
```

### 3.2 Instalar dependências

```bash
npm install
```

### 3.3 Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Agora abra `.env.local` em um editor e preencha:

```env
# Shopify (obtenha na fase 2 acima)
VITE_SHOPIFY_DOMAIN=shop.retromundial.com
VITE_SHOPIFY_TOKEN=shpat_seu_token_aqui

# Supabase (obtenha na fase 1 acima)
VITE_SUPABASE_URL=https://ysjszbbndltnyvaevwrh.supabase.co
VITE_SUPABASE_KEY=sb_publishable_...

# ⚠️ IMPORTANTE: Essas vão APENAS em Vercel, não aqui
# (deixe em branco ou comente)
# SUPABASE_URL=
# SUPABASE_KEY=
```

**Salve o arquivo.**

### 3.4 Testar localmente

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

**Teste a conexão Shopify:**
Abra [http://localhost:5173/api/shopify/test](http://localhost:5173/api/shopify/test)

Deve retornar:
```json
{
  "success": true,
  "productsFound": 6,
  "sampleProducts": [...]
}
```

Se vir erro ou `"success": false`, volte à **Fase 2** e verifique o token.

---

## FASE 4: PUSH PARA GITHUB E DEPLOY NA VERCEL (10 min)

### 4.1 Commit local

```bash
git add .
git commit -m "Setup: Shopify + Supabase + Vercel backend"
git push origin main
```

### 4.2 Conectar Vercel

1. Acesse [vercel.com](https://vercel.com/dashboard)
2. Clique "Add New" → "Project"
3. Selecione o repositório `retro-mundial-site`
4. **Framework:** Vite
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. Clique "Deploy"

Aguarde ~3 min...

### 4.3 Adicionar variáveis de ambiente em Vercel

Quando o deploy terminar:

1. Volte ao painel Vercel
2. Seu projeto → **Settings** → **Environment Variables**
3. Adicione:

| Nome | Valor |
|------|-------|
| `VITE_SHOPIFY_DOMAIN` | `shop.retromundial.com` |
| `VITE_SHOPIFY_TOKEN` | Seu token do Shopify |
| `VITE_SUPABASE_URL` | URL do Supabase |
| `VITE_SUPABASE_KEY` | Chave pública do Supabase |
| `SUPABASE_URL` | URL do Supabase (mesmo valor) |
| `SUPABASE_KEY` | **Service role key** do Supabase (⚠️ PRIVADA) |
| `ANTHROPIC_API_KEY` | (Opcional) Chave Claude IA |

4. Clique "Save"
5. Volte à aba "Deployments"
6. Clique nos três pontinhos → "Redeploy"

✅ Seu site está online! Verifique a URL (será algo como `retro-mundial-site-adsadsjoga.vercel.app`)

---

## FASE 5: WEBHOOKS SHOPIFY (5 min) — OPCIONAL AGORA

Quando você quer que estoque/produtos se atualizem automaticamente:

1. Shopify Admin → **Settings** → **Webhooks**
2. Clique "Create webhook"
3. Preencha:
   - **Event:** `products/update` e depois `inventory_levels/update` (faça 2 webhooks)
   - **URL:** `https://seu-dominio-vercel.vercel.app/api/shopify/webhook`
   - **API version:** `2024-01`
4. Clique "Save"

Pronto! Agora quando você muda estoque no Shopify, sincroniza automaticamente.

---

## ✅ CHECKLIST FINAL

- [ ] Supabase projeto criado
- [ ] Supabase schema.sql executado (tabelas criadas)
- [ ] Shopify token obtido
- [ ] .env.local configurado
- [ ] Teste local funciona (`/api/shopify/test`)
- [ ] GitHub push feito
- [ ] Vercel projeto criado
- [ ] Variáveis de ambiente em Vercel
- [ ] Vercel redeploy feito
- [ ] Site online (teste a URL)
- [ ] (Opcional) Webhooks Shopify configurados

---

## 🎉 PRONTO!

Seu site está online com:
- ✅ Produtos sincronizados do Shopify
- ✅ FAQ dinâmico
- ✅ Carrinho persistente
- ✅ Página "Quem Somos"
- ✅ Backend pronto para Stripe, Facebook, etc.

---

## 📞 PROBLEMAS?

Teste o link do webhook:
```bash
https://seu-dominio-vercel.vercel.app/api/shopify/test
```

Se retorna erro 401 ou 403:
- Chave Shopify expirou (gere nova em Shopify Admin)
- Domínio está errado (use `shop.retromundial.com`)

**Sempre verifique as variáveis de ambiente:**
```bash
# Localmente
cat .env.local

# Em Vercel
Seu projeto → Settings → Environment Variables
```
