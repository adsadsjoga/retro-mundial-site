// GET /api/analytics/meta?since=YYYY-MM-DD&until=YYYY-MM-DD

function today() { return new Date().toISOString().slice(0,10); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
function getAction(actions, type) { return +(actions?.find(a => a.action_type === type)?.value || 0); }
function getActionValue(vals, type) { return +(vals?.find(a => a.action_type === type)?.value || 0); }

function getMock() {
  return { mock: true, campaigns: [
    { id:'m1', name:'Brazil 2026 — Lookalike', platform:'meta', impressions:142000, reach:98000, clicks:3840, spend:284, ctr:2.7, cpc:0.074, conversions:47, revenue:1738 },
    { id:'m2', name:'Argentina Legacy — Retargeting', platform:'meta', impressions:67000, reach:45000, clicks:2210, spend:148, ctr:3.3, cpc:0.067, conversions:31, revenue:1146 },
    { id:'m3', name:'Germany Precision — Interest', platform:'meta', impressions:89000, reach:61000, clicks:1980, spend:196, ctr:2.2, cpc:0.099, conversions:22, revenue:813 },
    { id:'m4', name:'Coleção Completa — TOF', platform:'meta', impressions:215000, reach:180000, clicks:4320, spend:410, ctr:2.0, cpc:0.095, conversions:38, revenue:1405 },
  ]};
}

export default async function handler(req, res) {
  const token   = process.env.META_ACCESS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID;
  const version = process.env.META_API_VERSION || 'v19.0';

  if (!token || !account) {
    return res.status(200).json({ success: true, ...getMock() });
  }

  const { since = daysAgo(30), until = today() } = req.query;
  const fields = 'campaign_name,impressions,reach,clicks,spend,actions,action_values,ctr,cpc';

  try {
    const url = `https://graph.facebook.com/${version}/${account}/insights`
      + `?level=campaign&fields=${fields}`
      + `&time_range={"since":"${since}","until":"${until}"}`
      + `&access_token=${token}&limit=50`;

    const r = await fetch(url);
    const data = await r.json();

    if (data.error) {
      console.error('[META API]', data.error.message);
      return res.status(200).json({ success: true, ...getMock() });
    }

    const campaigns = (data.data || []).map(c => ({
      id:          c.campaign_id,
      name:        c.campaign_name,
      platform:    'meta',
      impressions: +c.impressions || 0,
      reach:       +c.reach       || 0,
      clicks:      +c.clicks      || 0,
      spend:       +c.spend       || 0,
      ctr:         +c.ctr         || 0,
      cpc:         +c.cpc         || 0,
      conversions: getAction(c.actions, 'purchase'),
      revenue:     getActionValue(c.action_values, 'purchase'),
    }));

    return res.status(200).json({ success: true, mock: false, campaigns });
  } catch (e) {
    console.error('[META API]', e.message);
    return res.status(200).json({ success: true, ...getMock() });
  }
}
