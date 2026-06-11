// Klaviyo consolidated endpoint
// GET    /api/klaviyo?action=list               — lista templates
// GET    /api/klaviyo?action=get&id=xxx         — busca HTML do template
// POST   /api/klaviyo                           — cria template { name, html }
// PATCH  /api/klaviyo                           — atualiza { id, name, html }
// DELETE /api/klaviyo?id=xxx                    — exclui template

const STATIC = [
  { id: 'T3AQbE', name: 'Retro Mundial - Welcome Email' },
  { id: 'U2Fqhu', name: 'Retro Mundial - Abandoned Cart' },
  { id: 'T9LACF', name: 'Retro Mundial - Post Purchase' },
];

export default async function handler(req, res) {
  const apiKey = process.env.KLAVIYO_API_KEY;
  const base   = 'https://a.klaviyo.com/api';
  const kHeaders = {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: '2024-02-15',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { action, id } = req.query;

    // list
    if (!action || action === 'list') {
      if (!apiKey) return res.status(200).json({ success: true, templates: STATIC });
      try {
        const r    = await fetch(`${base}/templates/?page[size]=50`, { headers: kHeaders });
        const data = await r.json();
        const templates = (data.data || []).map(t => ({ id: t.id, name: t.attributes.name, updated: t.attributes.updated }));
        return res.status(200).json({ success: true, templates: templates.length > 0 ? templates : STATIC });
      } catch { return res.status(200).json({ success: true, templates: STATIC }); }
    }

    // get single
    if (action === 'get') {
      if (!id) return res.status(400).json({ error: 'id obrigatório' });
      if (!apiKey) return res.status(400).json({ error: 'KLAVIYO_API_KEY não configurada.' });
      const r    = await fetch(`${base}/templates/${id}/`, { headers: kHeaders });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });
      return res.status(200).json({ success: true, id: data.data.id, name: data.data.attributes.name, html: data.data.attributes.html });
    }
  }

  if (!apiKey) return res.status(400).json({ error: 'KLAVIYO_API_KEY não configurada no Vercel.' });

  // ── POST: criar ───────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, html } = req.body;
    if (!name || !html) return res.status(400).json({ error: 'name e html obrigatórios' });
    const r    = await fetch(`${base}/templates/`, { method: 'POST', headers: kHeaders, body: JSON.stringify({ data: { type: 'template', attributes: { name, editor_type: 'CODE', html } } }) });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });
    return res.status(201).json({ success: true, id: data.data.id, name: data.data.attributes.name });
  }

  // ── PATCH: atualizar ──────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, name, html } = req.body;
    if (!id) return res.status(400).json({ error: 'id obrigatório' });
    const attrs = {};
    if (name) attrs.name = name;
    if (html) attrs.html = html;
    const r    = await fetch(`${base}/templates/${id}/`, { method: 'PATCH', headers: kHeaders, body: JSON.stringify({ data: { type: 'template', id, attributes: attrs } }) });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });
    return res.status(200).json({ success: true, id: data.data.id });
  }

  // ── DELETE: excluir ───────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id obrigatório' });
    const r = await fetch(`${base}/templates/${id}/`, { method: 'DELETE', headers: kHeaders });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
