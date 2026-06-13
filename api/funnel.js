// ─── FUNIL UNIFICADO ──────────────────────────────────────────────────────────
// GET /api/funnel?days=7
// Monta os 7 estágios do funil combinando:
//   1-2. Impressões + Cliques  → Meta Ads API
//   3-6. PageView, ViewContent, AddToCart, InitiateCheckout → Supabase funnel_events
//   7.   Purchase → Supabase orders
// Retorna período atual + período anterior (para comparação) + taxas de conversão.

import { createClient } from '@supabase/supabase-js';

let supabase = null;
function getSupabase() {
  if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
  return supabase;
}

// Benchmarks de e-commerce (taxa mínima saudável entre estágios)
const BENCHMARKS = {
  'impressions→clicks':        0.01,   // CTR 1%
  'clicks→pageviews':          0.70,   // 70% dos cliques carregam a página
  'pageviews→viewcontent':     0.30,   // 30% veem um produto
  'viewcontent→addtocart':     0.08,   // 8% adicionam ao carrinho
  'addtocart→checkout':        0.40,   // 40% iniciam checkout
  'checkout→purchase':         0.30,   // 30% completam a compra
};

async function metaTotals(since, until) {
  const token   = process.env.META_ACCESS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID;
  const version = process.env.META_API_VERSION || 'v19.0';
  if (!token || !account) return { impressions: 0, clicks: 0, spend: 0 };
  try {
    const url = `https://graph.facebook.com/${version}/${account}/insights`
      + `?level=account&fields=impressions,clicks,spend`
      + `&time_range={"since":"${since}","until":"${until}"}&access_token=${token}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.error || !data.data?.[0]) return { impressions: 0, clicks: 0, spend: 0 };
    const d = data.data[0];
    return { impressions: +d.impressions || 0, clicks: +d.clicks || 0, spend: +d.spend || 0 };
  } catch {
    return { impressions: 0, clicks: 0, spend: 0 };
  }
}

async function eventCounts(sb, startISO, endISO) {
  const counts = { PageView: 0, ViewContent: 0, AddToCart: 0, InitiateCheckout: 0 };
  if (!sb) return counts;
  try {
    const { data, error } = await sb
      .from('funnel_events')
      .select('event_name')
      .gte('created_at', startISO)
      .lte('created_at', endISO);
    if (error) throw error;
    (data || []).forEach(e => {
      if (counts[e.event_name] !== undefined) counts[e.event_name]++;
    });
  } catch (e) {
    console.warn('[FUNNEL] funnel_events:', e.message);
  }
  return counts;
}

// Quando começou o tracking de eventos? (1ª linha em funnel_events)
async function trackingSince(sb) {
  if (!sb) return null;
  try {
    const { data } = await sb
      .from('funnel_events')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1);
    return data?.[0]?.created_at || null;
  } catch {
    return null;
  }
}

async function purchaseTotals(sb, startISO, endISO) {
  if (!sb) return { purchases: 0, revenue: 0 };
  try {
    const { data, error } = await sb
      .from('orders')
      .select('total_price')
      .gte('created_at', startISO)
      .lte('created_at', endISO);
    if (error) throw error;
    const purchases = (data || []).length;
    const revenue = (data || []).reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
    return { purchases, revenue };
  } catch {
    return { purchases: 0, revenue: 0 };
  }
}

function buildStages(meta, events, orders) {
  return [
    { key: 'impressions', label: 'Impressões',        value: meta.impressions, source: 'meta' },
    { key: 'clicks',      label: 'Cliques',            value: meta.clicks,      source: 'meta' },
    { key: 'pageviews',   label: 'PageView',           value: events.PageView,  source: 'pixel' },
    { key: 'viewcontent', label: 'ViewContent',        value: events.ViewContent, source: 'pixel' },
    { key: 'addtocart',   label: 'AddToCart',          value: events.AddToCart, source: 'pixel' },
    { key: 'checkout',    label: 'InitiateCheckout',   value: events.InitiateCheckout, source: 'pixel' },
    { key: 'purchase',    label: 'Purchase',           value: orders.purchases, source: 'shopify' },
  ];
}

// Calcula taxas entre estágios + status vs benchmark.
// pixelPartial=true quando o tracking começou DEPOIS do início do período —
// nesse caso os estágios de pixel estão subcontados e não devem virar "crítico"
// (vira "warming" = a aquecer), evitando falsos alarmes na análise da IA.
function withRates(stages, pixelPartial) {
  return stages.map((s, i) => {
    if (i === 0) return { ...s, rate: null, benchmark: null, status: 'ok' };
    const prev = stages[i - 1].value;
    const rate = prev > 0 ? s.value / prev : null;
    const benchKey = `${stages[i - 1].key}→${s.key}`;
    const benchmark = BENCHMARKS[benchKey] ?? null;
    let status = 'ok';
    if (rate !== null && benchmark !== null) {
      if (rate < benchmark * 0.6) status = 'critical';
      else if (rate < benchmark) status = 'warning';
    }
    if (rate === null) status = 'nodata';
    // Tracking ainda a aquecer: pixel subcontado → não alarmar
    if (pixelPartial && s.source === 'pixel' && (status === 'critical' || status === 'warning')) {
      status = 'warming';
    }
    return { ...s, rate, benchmark, status };
  });
}

function fmtDate(d) { return d.toISOString().slice(0, 10); }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const days = Math.min(parseInt(req.query.days) || 7, 90);
  const now = new Date();

  // Período atual
  const curStart = new Date(now.getTime() - days * 86400000);
  // Período anterior (mesma duração, imediatamente antes)
  const prevStart = new Date(curStart.getTime() - days * 86400000);

  const sb = getSupabase();

  try {
    const [curMeta, prevMeta, curEvents, prevEvents, curOrders, prevOrders, trackStart] = await Promise.all([
      metaTotals(fmtDate(curStart), fmtDate(now)),
      metaTotals(fmtDate(prevStart), fmtDate(curStart)),
      eventCounts(sb, curStart.toISOString(), now.toISOString()),
      eventCounts(sb, prevStart.toISOString(), curStart.toISOString()),
      purchaseTotals(sb, curStart.toISOString(), now.toISOString()),
      purchaseTotals(sb, prevStart.toISOString(), curStart.toISOString()),
      trackingSince(sb),
    ]);

    // O tracking de pixel cobre o período todo? Se começou depois de curStart,
    // os estágios de pixel estão subcontados (warming).
    const trackStartDate = trackStart ? new Date(trackStart) : null;
    const curPartial  = !trackStartDate || trackStartDate > curStart;
    const prevPartial = !trackStartDate || trackStartDate > prevStart;
    // % do período atual coberto pelo tracking (para a IA calibrar a leitura)
    const coverage = trackStartDate
      ? Math.min(1, Math.max(0, (now - Math.max(trackStartDate, curStart)) / (now - curStart)))
      : 0;

    const current = withRates(buildStages(curMeta, curEvents, curOrders), curPartial);
    const previous = withRates(buildStages(prevMeta, prevEvents, prevOrders), prevPartial);

    const dataNote = curPartial
      ? `O rastreamento de eventos do pixel começou em ${trackStart ? trackStart.slice(0,10) : 'recentemente'} e cobre apenas ~${Math.round(coverage*100)}% deste período. Os estágios de pixel (PageView em diante) estão SUBCONTADOS por motivo técnico (janela de dados), NÃO porque o pixel está quebrado. Cliques vêm de 7 dias de histórico Meta; PageView só conta desde que o tracking ligou. NÃO conclua que o pixel está quebrado — aguarde a janela alinhar. Foque a análise no topo (criativo/CTR) e na progressão vs período anterior.`
      : null;

    // Snapshot semanal (cron de segunda 06:00 ou chamada manual ?snapshot=1)
    // Guarda a foto da semana na tabela funnel_snapshots para ver a progressão.
    if (req.query.snapshot === '1' && sb) {
      const weekStart = fmtDate(curStart);
      const snapshot = {
        week_start: weekStart,
        days,
        spend: curMeta.spend,
        revenue: curOrders.revenue,
        roas: curMeta.spend > 0 ? curOrders.revenue / curMeta.spend : null,
        stages: current,
      };
      const { error: snapErr } = await sb
        .from('funnel_snapshots')
        .upsert(snapshot, { onConflict: 'week_start' });
      if (snapErr) console.warn('[FUNNEL SNAPSHOT]', snapErr.message);
    }

    // Histórico de snapshots para o gráfico de progressão
    let history = [];
    if (req.query.history === '1' && sb) {
      const { data } = await sb
        .from('funnel_snapshots')
        .select('*')
        .order('week_start', { ascending: true })
        .limit(26); // ~6 meses
      history = data || [];
    }

    return res.status(200).json({
      history: req.query.history === '1' ? history : undefined,
      success: true,
      days,
      period: { since: fmtDate(curStart), until: fmtDate(now) },
      spend: curMeta.spend,
      revenue: curOrders.revenue,
      roas: curMeta.spend > 0 ? curOrders.revenue / curMeta.spend : null,
      tracking_since: trackStart,
      tracking_coverage: coverage,
      data_note: dataNote,
      current,
      previous,
    });
  } catch (error) {
    console.error('[FUNNEL ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
