// ─── WEBHOOK SHOPIFY ──────────────────────────────────────────────────────────
// POST /api/shopify/webhook
// Recebe updates de produtos/estoque do Shopify e sincroniza no Supabase

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || 'test-secret';

const supabase = createClient(supabaseUrl, supabaseKey);

function verifyWebhookSignature(req, secret) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  if (!hmacHeader) return false;

  const body = req.rawBody || JSON.stringify(req.body);
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  return hash === hmacHeader;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verificar assinatura (opcional em desenvolvimento)
  // if (!verifyWebhookSignature(req, webhookSecret)) {
  //   return res.status(401).json({ error: 'Invalid signature' });
  // }

  try {
    const topic = req.headers['x-shopify-topic'];
    const body = req.body;

    console.log(`[WEBHOOK] Recebido: ${topic}`);

    // Casos de uso:
    // 1. products/create — novo produto adicionado
    // 2. products/update — produto atualizado
    // 3. products/delete — produto deletado
    // 4. inventory_levels/update — estoque mudou
    // 5. orders/create — novo pedido (para Meta Pixel Purchase event)

    if (topic === 'products/create' || topic === 'products/update') {
      const { id: productId, handle, title } = body;
      const { error } = await supabase.from('products').upsert(
        {
          shopify_id: productId,
          handle,
          title,
          updated_at: new Date(),
        },
        { onConflict: 'shopify_id' }
      );

      if (error) throw error;
      console.log(`✅ Produto ${handle} sincronizado`);
    }

    if (topic === 'inventory_levels/update') {
      const { error } = await supabase.from('products').update({ updated_at: new Date() }).eq('shopify_id', body.id);
      if (error) throw error;
      console.log(`✅ Estoque atualizado`);
    }

    // Meta Pixel — Purchase event quando uma encomenda é criada
    if (topic === 'orders/create') {
      const { id: orderId, total_price, currency, line_items, created_at, email } = body;
      const totalValue = parseFloat(total_price);
      const contentIds = line_items.map(item => item.product_id.toString());
      const contentNames = line_items.map(item => item.title).join(', ');

      await sendMetaPixelPurchase({
        orderId,
        value: totalValue,
        currency: currency || 'EUR',
        content_name: contentNames,
        content_ids: contentIds,
        num_items: line_items.length,
        email,
      });

      console.log(`✅ Pedido ${orderId} enviado ao Meta Pixel`);
    }

    return res.status(200).json({ success: true, webhook: topic });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return res.status(500).json({ error: error.message });
  }
}

// Importante: Shopify precisa que a resposta seja enviada em < 5s.
// Se processar algo pesado, use job queue (Redis, etc).

async function sendMetaPixelPurchase(orderData) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[META] Pixel ID ou Access Token não configurados');
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const event = {
    event_name: 'Purchase',
    event_time: timestamp,
    event_id: `order_${orderData.orderId}`,
    event_source_url: 'https://www.retromundial.com',
    user_data: {
      em: orderData.email ? hashEmail(orderData.email) : undefined,
    },
    custom_data: {
      value: orderData.value,
      currency: orderData.currency,
      content_name: orderData.content_name,
      content_ids: orderData.content_ids,
      num_items: orderData.num_items,
      content_type: 'product',
    },
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [event],
        access_token: accessToken,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[META ERROR] ${res.status}: ${err}`);
    } else {
      console.log('[META] ✅ Purchase event enviado');
    }
  } catch (err) {
    console.error('[META ERROR]', err);
  }
}

function hashEmail(email) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}
