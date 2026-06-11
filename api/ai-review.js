// POST /api/ai-review — proxy para Claude API (evita expor key no browser)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, system, anthropicKey } = req.body;

  const apiKey = process.env.ANTHROPIC_API_KEY || anthropicKey;
  if (!apiKey) {
    return res.status(400).json({ error: 'Claude API key não configurada.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Claude API error' });
    }

    return res.status(200).json({ content: data.content?.[0]?.text || '' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
