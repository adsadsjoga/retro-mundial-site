// GET    /api/klaviyo/template?id=xxx  — busca HTML do template
// POST   /api/klaviyo/template         — cria template { name, html }
// PATCH  /api/klaviyo/template         — atualiza { id, name, html }
// DELETE /api/klaviyo/template?id=xxx  — exclui template

export default async function handler(req, res) {
  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'KLAVIYO_API_KEY não configurada no Vercel.' });

  const base = 'https://a.klaviyo.com/api';
  const headers = {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: '2024-02-15',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // ── GET: busca template por ID ────────────────────────────────────────────
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id obrigatório' });

    const r = await fetch(`${base}/templates/${id}/`, { headers });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });

    return res.status(200).json({
      success: true,
      id: data.data.id,
      name: data.data.attributes.name,
      html: data.data.attributes.html,
    });
  }

  // ── POST: cria template ───────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, html } = req.body;
    if (!name || !html) return res.status(400).json({ error: 'name e html obrigatórios' });

    const r = await fetch(`${base}/templates/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'template',
          attributes: { name, editor_type: 'CODE', html },
        },
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });

    return res.status(201).json({
      success: true,
      id: data.data.id,
      name: data.data.attributes.name,
    });
  }

  // ── PATCH: atualiza template ──────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, name, html } = req.body;
    if (!id) return res.status(400).json({ error: 'id obrigatório' });

    const attrs = {};
    if (name) attrs.name = name;
    if (html) attrs.html = html;

    const r = await fetch(`${base}/templates/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        data: { type: 'template', id, attributes: attrs },
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });

    return res.status(200).json({ success: true, id: data.data.id });
  }

  // ── DELETE: exclui template ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id obrigatório' });

    const r = await fetch(`${base}/templates/${id}/`, { method: 'DELETE', headers });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: data.errors?.[0]?.detail || 'Erro Klaviyo' });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
