// ─── META CONVERSIONS API ─────────────────────────────────────────────────────
// POST /api/capi
// Espelha eventos do navegador (ViewContent, AddToCart, InitiateCheckout, etc.)
// para o Meta server-side, com deduplicação via event_id e dados de usuário
// (fbp, fbc, IP, user agent). Melhora o "data quality score" do Pixel.

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase para registrar eventos do funil (análise interna)
let supabase = null;
function getSupabase() {
  if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
  return supabase;
}

// Grava o evento na tabela funnel_events — falha silenciosa, nunca bloqueia o CAPI
async function logFunnelEvent({ event_name, event_id, event_source_url, custom_data }) {
  try {
    const sb = getSupabase();
    if (!sb) return { skipped: 'no-supabase' };
    const { error } = await sb.from('funnel_events').insert({
      event_name,
      event_id,
      url: event_source_url || null,
      value: custom_data?.value ?? null,
      currency: custom_data?.currency ?? null,
      content_name: custom_data?.content_name ?? null,
    });
    if (error) {
      console.warn('[FUNNEL LOG]', error.message);
      return { error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.warn('[FUNNEL LOG]', e.message);
    return { error: e.message };
  }
}

function sha256(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || undefined;
}

export default async function handler(req, res) {
  // CORS — permite chamadas do site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn('[CAPI] META_PIXEL_ID ou META_ACCESS_TOKEN não configurados');
    return res.status(200).json({ skipped: true });
  }

  try {
    const {
      event_name,
      event_id,
      event_source_url,
      custom_data = {},
      fbp,
      fbc,
      email,
    } = req.body || {};

    if (!event_name || !event_id) {
      return res.status(400).json({ error: 'event_name e event_id obrigatórios' });
    }

    const event = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id, // mesmo ID do evento do navegador → deduplicação
      action_source: 'website',
      event_source_url: event_source_url || 'https://www.retromundial.com',
      user_data: {
        client_ip_address: getClientIp(req),
        client_user_agent: req.headers['user-agent'],
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        em: email ? sha256(email) : undefined,
      },
      custom_data,
    };

    // Grava no Supabase E envia ao Meta em paralelo — ambos AGUARDADOS,
    // senão a função serverless pode encerrar antes da inserção terminar.
    const [logResult, fbRes] = await Promise.all([
      logFunnelEvent({ event_name, event_id, event_source_url, custom_data }),
      fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [event], access_token: accessToken }),
      }),
    ]);

    if (!fbRes.ok) {
      const err = await fbRes.text();
      console.error(`[CAPI ERROR] ${fbRes.status}: ${err}`);
    }

    // ?debug=1 expõe o resultado da gravação no funil (diagnóstico)
    if (req.query.debug === '1') {
      return res.status(200).json({ ok: fbRes.ok, log: logResult });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[CAPI ERROR]', error);
    return res.status(200).json({ ok: false, error: error.message });
  }
}
