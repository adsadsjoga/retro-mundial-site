// ─── WEBHOOK: RASTREAMENTO DE VENDAS ──────────────────────────────────────────
// POST /api/shopify/orders
// Recebe pedidos do Shopify e rastreia customer pipeline
// Eventos: orders/create, orders/updated, orders/cancelled, orders/fulfilled

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || '';

const supabase = createClient(supabaseUrl, supabaseKey);

function verifyWebhookSignature(req, secret) {
  if (!secret) return true; // Skip em desenvolvimento

  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  if (!hmacHeader) return false;

  const body = req.rawBody || JSON.stringify(req.body);
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  return hash === hmacHeader;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar assinatura
    if (!verifyWebhookSignature(req, webhookSecret)) {
      console.warn('[WEBHOOK] Assinatura inválida');
      // Continuar mesmo assim em desenvolvimento
    }

    const topic = req.headers['x-shopify-topic'];
    const order = req.body;

    console.log(`[ORDERS WEBHOOK] ${topic} — Order #${order.name} (${order.customer?.email})`);

    // ─── UPSERT CUSTOMER ───────────────────────────────────────────────────────
    if (order.customer) {
      const { email, first_name, last_name } = order.customer;

      const { error: customerError } = await supabase.from('customers').upsert({
        email,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        // stage será atualizado abaixo
        updated_at: new Date(),
      }, { onConflict: 'email' });

      if (customerError) console.error('Customer upsert error:', customerError);
    }

    // ─── RASTREAR PIPELINE ─────────────────────────────────────────────────────
    if (topic === 'orders/create') {
      // Nova venda!
      const email = order.customer?.email;
      const totalPrice = parseFloat(order.total_price);

      // 1. Criar registro de order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          shopify_order_id: order.id.toString(),
          customer_email: email,
          total_price: totalPrice,
          status: 'pending',
          financial_status: order.financial_status,
          fulfillment_status: order.fulfillment_status,
          created_at: order.created_at,
          updated_at: new Date(),
        })
        .select();

      if (orderError) console.error('Order insert error:', orderError);
      const orderId = orderData?.[0]?.id;

      // 2. Inserir items do pedido
      if (orderId && order.line_items.length > 0) {
        const items = order.line_items.map(item => ({
          order_id: orderId,
          product_id: item.product_id?.toString(),
          product_title: item.title,
          variant_title: item.variant_title,
          quantity: item.quantity,
          price: parseFloat(item.price),
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(items);
        if (itemsError) console.error('Order items error:', itemsError);
      }

      // 3. Registrar evento
      await supabase.from('customer_events').insert({
        customer_email: email,
        event_type: 'purchase',
        event_data: {
          order_id: order.id,
          total: totalPrice,
          items_count: order.line_items.length,
        },
      });

      // 4. Atualizar stage do customer para "purchased"
      const { error: updateError } = await supabase.from('customers').update({
        stage: 'purchased',
        first_purchase_at: order.created_at,
        total_spent: totalPrice,
        last_order_date: order.created_at,
        updated_at: new Date(),
      }).eq('email', email);

      if (updateError) console.error('Customer update error:', updateError);

      console.log(`✅ VENDA REGISTRADA: ${email} — €${totalPrice} — ${order.line_items.length} items`);
    }

    if (topic === 'orders/cancelled') {
      const email = order.customer?.email;

      // Marcar como "cancelled"
      await supabase.from('customers').update({
        stage: 'cancelled',
        updated_at: new Date(),
      }).eq('email', email);

      console.log(`⚠️ Pedido cancelado: ${email}`);
    }

    if (topic === 'orders/fulfilled') {
      const email = order.customer?.email;

      // Atualizar para "completed"
      await supabase.from('customers').update({
        stage: 'completed',
        updated_at: new Date(),
      }).eq('email', email);

      console.log(`📦 Pedido entregue: ${email}`);
    }

    return res.status(200).json({
      success: true,
      webhook: topic,
      orderId: order.id,
      email: order.customer?.email,
    });
  } catch (error) {
    console.error('[ORDERS WEBHOOK ERROR]', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/*
SETUP SHOPIFY WEBHOOKS:

1. Shopify Admin → Settings → Webhooks
2. Create webhook:
   - Event: Order created
   - URL: https://retro-mundial-site.vercel.app/api/shopify/orders
   - API version: 2024-01
   - Format: JSON

3. Repeat para: orders/updated, orders/cancelled, orders/fulfilled

CUSTOMER PIPELINE STAGES:
- "cart_abandoned" (via checkout webhook — implementar depois)
- "purchased" (order criado)
- "completed" (order fulfillido)
- "cancelled" (order cancelado)

DATABASE: customers table com fields
- email (primary key)
- name
- stage
- first_purchase_at
- total_spent
- last_order_id
- cart_abandoned_at
- updated_at
*/
