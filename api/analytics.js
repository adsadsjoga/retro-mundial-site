// GET /api/analytics?source=meta|tiktok|sales&since=YYYY-MM-DD&until=YYYY-MM-DD

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { source, since, until } = req.query;
  if (source === 'meta')        return handleMeta(req, res, since, until);
  if (source === 'meta-daily')  return handleMetaDaily(req, res, req.query.campaign_id, since, until);
  if (source === 'tiktok')      return handleTikTok(req, res, since, until);
  if (source === 'sales')       return handleSales(req, res, since, until);
  return res.status(400).json({ error: 'source param required: meta|tiktok|sales|meta-daily' });
}

// ── META ─────────────────────────────────────────────────────────────────────
function getAction(actions, type) { return +(actions?.find(a => a.action_type === type)?.value || 0); }
function getActionValue(vals, type) { return +(vals?.find(a => a.action_type === type)?.value || 0); }

function metaMock() {
  return { mock: true, campaigns: [
    { id:'m1', name:'Brazil 2026 — Lookalike',      platform:'meta', impressions:142000, reach:98000,  clicks:3840, spend:284, ctr:2.7, cpc:0.074, conversions:47, revenue:1738 },
    { id:'m2', name:'Argentina Legacy — Retargeting',platform:'meta', impressions:67000,  reach:45000,  clicks:2210, spend:148, ctr:3.3, cpc:0.067, conversions:31, revenue:1146 },
    { id:'m3', name:'Germany Precision — Interest',  platform:'meta', impressions:89000,  reach:61000,  clicks:1980, spend:196, ctr:2.2, cpc:0.099, conversions:22, revenue:813  },
    { id:'m4', name:'Coleção Completa — TOF',        platform:'meta', impressions:215000, reach:180000, clicks:4320, spend:410, ctr:2.0, cpc:0.095, conversions:38, revenue:1405 },
  ]};
}

async function handleMeta(req, res, since, until) {
  const token   = process.env.META_ACCESS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID;
  const version = process.env.META_API_VERSION || 'v19.0';
  if (!token || !account) return res.status(200).json({ success: true, ...metaMock() });

  const s = since || daysAgo(30);
  const u = until || today();
  const fields = 'campaign_name,impressions,reach,clicks,spend,actions,action_values,ctr,cpc';
  try {
    const url = `https://graph.facebook.com/${version}/${account}/insights`
      + `?level=campaign&fields=${fields}&time_range={"since":"${s}","until":"${u}"}`
      + `&access_token=${token}&limit=50`;
    const r    = await fetch(url);
    const data = await r.json();
    if (data.error) return res.status(200).json({ success: true, ...metaMock() });
    const campaigns = (data.data || []).map(c => ({
      id: c.campaign_id, name: c.campaign_name, platform: 'meta',
      impressions: +c.impressions||0, reach: +c.reach||0, clicks: +c.clicks||0,
      spend: +c.spend||0, ctr: +c.ctr||0, cpc: +c.cpc||0,
      conversions: getAction(c.actions, 'purchase'),
      revenue:     getActionValue(c.action_values, 'purchase'),
    }));
    return res.status(200).json({ success: true, mock: false, campaigns });
  } catch { return res.status(200).json({ success: true, ...metaMock() }); }
}

// ── META DAILY (por campanha) ─────────────────────────────────────────────────
function metaDailyMock(campaignId, since, until) {
  const start = since ? new Date(since) : new Date(Date.now() - 30*86400000);
  const end   = until ? new Date(until) : new Date();
  const days  = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const base = 0.6 + Math.random() * 0.8;
    days.push({
      date:        d.toISOString().slice(0,10),
      impressions: Math.round(3000 + Math.random()*8000),
      clicks:      Math.round(80  + Math.random()*220),
      spend:       +(8  + Math.random()*22).toFixed(2),
      conversions: Math.round(base * (1 + Math.random())),
      revenue:     +(base * 37).toFixed(2),
    });
  }
  return days;
}

async function handleMetaDaily(req, res, campaignId, since, until) {
  const token   = process.env.META_ACCESS_TOKEN;
  const version = process.env.META_API_VERSION || 'v19.0';
  const s = since || daysAgo(30);
  const u = until || today();

  if (!token || !campaignId) {
    return res.status(200).json({ success: true, mock: !campaignId, daily: metaDailyMock(campaignId, s, u) });
  }
  try {
    const fields = 'date_start,impressions,reach,clicks,spend,actions,action_values,ctr,cpc';
    const url = `https://graph.facebook.com/${version}/${campaignId}/insights`
      + `?level=campaign&fields=${fields}&time_range={"since":"${s}","until":"${u}"}`
      + `&time_increment=1&access_token=${token}&limit=90`;
    const r    = await fetch(url);
    const data = await r.json();
    if (data.error) return res.status(200).json({ success: true, mock: true, daily: metaDailyMock(campaignId, s, u) });
    const daily = (data.data || []).map(d => ({
      date:        d.date_start,
      impressions: +d.impressions||0,
      clicks:      +d.clicks||0,
      spend:       +d.spend||0,
      ctr:         +d.ctr||0,
      cpc:         +d.cpc||0,
      conversions: getAction(d.actions, 'purchase'),
      revenue:     getActionValue(d.action_values, 'purchase'),
    }));
    return res.status(200).json({ success: true, mock: false, daily });
  } catch { return res.status(200).json({ success: true, mock: true, daily: metaDailyMock(campaignId, s, u) }); }
}

// ── TIKTOK ───────────────────────────────────────────────────────────────────
function tiktokMock() {
  return { mock: true, campaigns: [
    { id:'t1', name:'Brazil 2026 — TopView',       platform:'tiktok', impressions:320000, reach:210000, clicks:4160, spend:312, ctr:1.3, cpc:0.075, conversions:39, revenue:1442 },
    { id:'t2', name:'Argentina Legacy — Spark Ads', platform:'tiktok', impressions:185000, reach:142000, clicks:2590, spend:198, ctr:1.4, cpc:0.076, conversions:24, revenue:887  },
    { id:'t3', name:'Coleção Mundial — In-Feed',    platform:'tiktok', impressions:385000, reach:290000, clicks:3080, spend:268, ctr:0.8, cpc:0.087, conversions:28, revenue:1035 },
  ]};
}

async function handleTikTok(req, res, since, until) {
  const token      = process.env.TIKTOK_ACCESS_TOKEN;
  const advertiserId = process.env.TIKTOK_ADVERTISER_ID;
  if (!token || !advertiserId) return res.status(200).json({ success: true, ...tiktokMock() });

  const startDate = since || daysAgo(30);
  const endDate   = until || today();
  try {
    const params = new URLSearchParams({
      advertiser_id: advertiserId, report_type: 'BASIC', page_size: 50,
      dimensions: JSON.stringify(['campaign_id','campaign_name']),
      metrics:    JSON.stringify(['spend','impressions','reach','clicks','ctr','cpc','conversion','value_per_conversion']),
      start_date: startDate, end_date: endDate,
    });
    const r    = await fetch(`https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${params}`, {
      headers: { 'Access-Token': token, 'Content-Type': 'application/json' },
    });
    const data = await r.json();
    if (data.code !== 0) return res.status(200).json({ success: true, ...tiktokMock() });
    const campaigns = (data.data?.list || []).map(c => ({
      id: c.dimensions?.campaign_id, name: c.dimensions?.campaign_name, platform: 'tiktok',
      impressions: +c.metrics?.impressions||0, reach: +c.metrics?.reach||0,
      clicks: +c.metrics?.clicks||0, spend: +c.metrics?.spend||0,
      ctr: +c.metrics?.ctr||0, cpc: +c.metrics?.cpc||0,
      conversions: +c.metrics?.conversion||0,
      revenue: (+c.metrics?.value_per_conversion||0) * (+c.metrics?.conversion||0),
    }));
    return res.status(200).json({ success: true, mock: false, campaigns });
  } catch { return res.status(200).json({ success: true, ...tiktokMock() }); }
}

// ── SALES (SUPABASE) ─────────────────────────────────────────────────────────
async function handleSales(req, res, since, until) {
  const startDate = since ? new Date(since).toISOString() : new Date(Date.now() - 30*86400000).toISOString();
  const endDate   = until ? new Date(until + 'T23:59:59Z').toISOString() : new Date().toISOString();
  try {
    const { data: orders, error } = await supabase
      .from('orders').select('id,total_price,status,created_at,customer_email')
      .gte('created_at', startDate).lte('created_at', endDate).order('created_at', { ascending: true });
    if (error) throw error;

    const { count: newCustomers } = await supabase
      .from('customers').select('*', { count: 'exact', head: true })
      .gte('created_at', startDate).lte('created_at', endDate);

    const { data: pipeline } = await supabase.from('customers').select('stage').not('stage', 'is', null);
    const stages = { visitor:0, cart_abandoned:0, purchased:0, completed:0, cancelled:0 };
    (pipeline||[]).forEach(c => { if (stages[c.stage]!==undefined) stages[c.stage]++; });

    const dailyMap = {};
    (orders||[]).forEach(o => {
      const day = o.created_at.slice(0,10);
      if (!dailyMap[day]) dailyMap[day] = { date:day, revenue:0, orders:0 };
      dailyMap[day].revenue += parseFloat(o.total_price||0);
      dailyMap[day].orders++;
    });
    const daily        = Object.values(dailyMap).sort((a,b) => a.date.localeCompare(b.date));
    const totalRevenue = (orders||[]).reduce((s,o) => s + parseFloat(o.total_price||0), 0);
    const totalOrders  = (orders||[]).length;
    return res.status(200).json({
      success: true, totalRevenue, totalOrders,
      avgOrder: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      newCustomers: newCustomers || 0, pipeline: stages, daily,
    });
  } catch {
    return res.status(200).json({
      success: true, mock: true, totalRevenue:6102, totalOrders:138, avgOrder:44.2, newCustomers:104,
      pipeline: { visitor:340, cart_abandoned:87, purchased:138, completed:95, cancelled:12 },
      daily: Array.from({length:30},(_,i) => {
        const d = new Date(); d.setDate(d.getDate()-(29-i));
        return { date:d.toISOString().slice(0,10), revenue:Math.round(100+Math.random()*350), orders:Math.round(2+Math.random()*8) };
      }),
    });
  }
}

function today()   { return new Date().toISOString().slice(0,10); }
function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
