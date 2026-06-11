// GET /api/analytics/tiktok?since=YYYY-MM-DD&until=YYYY-MM-DD

function getMock() {
  return { mock: true, campaigns: [
    { id:'t1', name:'Brazil 2026 — TopView', platform:'tiktok', impressions:320000, reach:210000, clicks:4160, spend:312, ctr:1.3, cpc:0.075, conversions:39, revenue:1442 },
    { id:'t2', name:'Argentina Legacy — Spark Ads', platform:'tiktok', impressions:185000, reach:142000, clicks:2590, spend:198, ctr:1.4, cpc:0.076, conversions:24, revenue:887 },
    { id:'t3', name:'Coleção Mundial — In-Feed', platform:'tiktok', impressions:385000, reach:290000, clicks:3080, spend:268, ctr:0.8, cpc:0.087, conversions:28, revenue:1035 },
  ]};
}

export default async function handler(req, res) {
  const token      = process.env.TIKTOK_ACCESS_TOKEN;
  const advertiserId = process.env.TIKTOK_ADVERTISER_ID;

  if (!token || !advertiserId) {
    return res.status(200).json({ success: true, ...getMock() });
  }

  const { since, until } = req.query;
  const startDate = since || (() => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().slice(0,10); })();
  const endDate   = until || new Date().toISOString().slice(0,10);

  try {
    const params = new URLSearchParams({
      advertiser_id: advertiserId,
      report_type:   'BASIC',
      dimensions:    JSON.stringify(['campaign_id', 'campaign_name']),
      metrics:       JSON.stringify(['spend','impressions','reach','clicks','ctr','cpc','conversion','value_per_conversion']),
      start_date:    startDate,
      end_date:      endDate,
      page_size:     50,
    });

    const r = await fetch(`https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${params}`, {
      headers: {
        'Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await r.json();

    if (data.code !== 0) {
      console.error('[TIKTOK API]', data.message);
      return res.status(200).json({ success: true, ...getMock() });
    }

    const campaigns = (data.data?.list || []).map(c => ({
      id:          c.dimensions?.campaign_id,
      name:        c.dimensions?.campaign_name,
      platform:    'tiktok',
      impressions: +c.metrics?.impressions  || 0,
      reach:       +c.metrics?.reach        || 0,
      clicks:      +c.metrics?.clicks       || 0,
      spend:       +c.metrics?.spend        || 0,
      ctr:         +c.metrics?.ctr          || 0,
      cpc:         +c.metrics?.cpc          || 0,
      conversions: +c.metrics?.conversion   || 0,
      revenue:     +c.metrics?.value_per_conversion * (+c.metrics?.conversion || 0) || 0,
    }));

    return res.status(200).json({ success: true, mock: false, campaigns });
  } catch (e) {
    console.error('[TIKTOK API]', e.message);
    return res.status(200).json({ success: true, ...getMock() });
  }
}
