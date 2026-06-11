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
    const { id, handle, title, variants } = req.body;

    console.log(`[WEBHOOK] Recebido: ${topic} para produto ${handle}`);

    // Casos de uso:
    // 1. products/create — novo produto adicionado
    // 2. products/update — produto atualizado
    // 3. products/delete — produto deletado
    // 4. inventory_levels/update — estoque mudou

    if (topic === 'products/create' || topic === 'products/update') {
      // Atualiza/insere produto no Supabase
      const { error } = await supabase.from('products').upsert(
        {
          shopify_id: id,
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
      // Atualiza estoque
      // req.body tem: { inventory_item_id, available_adjustment, updated_at, ...}
      const { error } = await supabase.from('products').update({ updated_at: new Date() }).eq('shopify_id', id);
      if (error) throw error;
      console.log(`✅ Estoque atualizado para ${handle}`);
    }

    return res.status(200).json({ success: true, webhook: topic });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return res.status(500).json({ error: error.message });
  }
}

// Importante: Shopify precisa que a resposta seja enviada em < 5s.
// Se processar algo pesado, use job queue (Redis, etc).
