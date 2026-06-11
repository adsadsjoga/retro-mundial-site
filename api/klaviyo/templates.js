// GET /api/klaviyo/templates — lista templates do Klaviyo

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      templates: [
        { id: 'T3AQbE', name: 'Retro Mundial - Welcome Email', updated: new Date().toISOString() },
        { id: 'U2Fqhu', name: 'Retro Mundial - Abandoned Cart', updated: new Date().toISOString() },
        { id: 'T9LACF', name: 'Retro Mundial - Post Purchase', updated: new Date().toISOString() },
      ],
    });
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/templates/?page[size]=50', {
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        revision: '2024-02-15',
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    const templates = (data.data || []).map(t => ({
      id: t.id,
      name: t.attributes.name,
      updated: t.attributes.updated,
    }));

    return res.status(200).json({ success: true, templates });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
