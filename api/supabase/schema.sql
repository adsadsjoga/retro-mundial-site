-- ─── SCHEMA SUPABASE ──────────────────────────────────────────────────────────
-- Execute este arquivo no Supabase Console (SQL Editor)
-- Cria todas as tabelas necessárias

-- ─── TABELA: PRODUCTS ─────────────────────────────────────────────────────────
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  shopify_id TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── TABELA: FAQ ──────────────────────────────────────────────────────────────
CREATE TABLE faq (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(shopify_id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── TABELA: REVIEWS ──────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(shopify_id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── TABELA: CUSTOMERS ────────────────────────────────────────────────────────
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stage TEXT DEFAULT 'visitor', -- visitor, cart_abandoned, checkout_started, payment_processed, order_received
  cart_abandoned_at TIMESTAMP,
  first_purchase_at TIMESTAMP,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_order_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── TABELA: CAMPANHAS KLAVIYO ────────────────────────────────────────────────
CREATE TABLE campaigns_klaviyo (
  id BIGSERIAL PRIMARY KEY,
  klaviyo_id TEXT UNIQUE,
  name TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- ─── ÍNDICES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_shopify_id ON products(shopify_id);
CREATE INDEX idx_faq_product_id ON faq(product_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_stage ON customers(stage);

-- ✅ Pronto! Suas tabelas estão criadas.
-- Agora você pode:
-- 1. Adicionar produtos manualmente no Supabase
-- 2. Ou configurar webhook do Shopify para sincronizar automaticamente
