-- ─── SCHEMA PHASE 2: ORDERS + CUSTOMER EVENTS ──────────────────────────────────
-- Execute este arquivo no Supabase Console (SQL Editor) para atualizar o banco
-- Cria as novas tabelas para rastreamento de vendas e eventos de clientes

-- ─── TABELA: ORDERS ───────────────────────────────────────────────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled, refunded, fulfilled
  financial_status TEXT DEFAULT 'pending', -- authorized, captured, refunded, voided, pending
  fulfillment_status TEXT DEFAULT 'unshipped', -- unshipped, partial, shipped, delivered, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  fulfilled_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── TABELA: ORDER ITEMS ──────────────────────────────────────────────────────
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_title TEXT NOT NULL,
  variant_title TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── TABELA: CUSTOMER EVENTS ──────────────────────────────────────────────────
CREATE TABLE customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- visit, add_to_cart, cart_abandoned, purchase, checkout_started, email_sent, email_opened, email_clicked, fulfilled, cancelled
  event_data JSONB, -- dados extras: product_id, cart_value, email_campaign_id, etc
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── ÍNDICES (PERFORMANCE) ────────────────────────────────────────────────────
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_shopify_order_id ON orders(shopify_order_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_customer_events_email ON customer_events(customer_email);
CREATE INDEX idx_customer_events_type ON customer_events(event_type);
CREATE INDEX idx_customer_events_created ON customer_events(created_at);

-- ✅ Pronto! As novas tabelas foram criadas.
-- Dashboard de clientes já funciona!
