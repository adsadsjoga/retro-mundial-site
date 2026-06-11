// ─── FAQ API ──────────────────────────────────────────────────────────────────
// GET /api/faq?productId=... — lista FAQs de um produto
// POST /api/faq — cria nova FAQ
// DELETE /api/faq/[id] — deleta FAQ

import { supabase } from './supabase/client.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { productId } = req.query;
      if (!productId) return res.status(400).json({ error: 'productId obrigatório' });

      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('product_id', productId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ faqs: data });
    }

    if (req.method === 'POST') {
      const { productId, question, answer } = req.body;
      if (!productId || !question || !answer) {
        return res.status(400).json({ error: 'productId, question, answer obrigatórios' });
      }

      const { data, error } = await supabase.from('faq').insert([{ product_id: productId, question, answer }]);

      if (error) throw error;
      return res.status(201).json({ faq: data?.[0] });
    }

    if (req.method === 'DELETE') {
      const faqId = req.query.id || req.body.id;
      if (!faqId) return res.status(400).json({ error: 'ID obrigatório' });

      const { error } = await supabase.from('faq').delete().eq('id', faqId);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[FAQ ERROR]', error);
    return res.status(500).json({ error: error.message });
  }
}
