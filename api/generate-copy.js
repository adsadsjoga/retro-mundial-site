// ─── GENERATE COPY COM CLAUDE API ────────────────────────────────────────────
// POST /api/generate-copy
// Gera copywriting usando Claude API

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, brand, description } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY não configurado',
      hint: 'Adicione sua chave de API do Claude no .env da Vercel',
    });
  }

  try {
    const prompt = `Você é um copywriter especializado em e-commerce premium. Escreva um texto para a página de "${topic}" de uma marca chamada "${brand}".

Detalhes da marca: ${description}

Crie um JSON com esta estrutura:
{
  "title": "Título da página",
  "subtitle": "Subtítulo com gancho emocional",
  "sections": [
    { "heading": "Seção 1", "text": "Parágrafo descritivo..." },
    { "heading": "Seção 2", "text": "Parágrafo descritivo..." },
    { "heading": "Seção 3", "text": "Parágrafo descritivo..." }
  ]
}

Estilo: Premium, nostálgico, inspirador. Tom: conversacional mas sofisticado.
Responda APENAS com o JSON válido, sem explicações extras.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!content) {
      return res.status(500).json({ error: 'Nenhum conteúdo retornado pela IA' });
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error('[CLAUDE API ERROR]', error);
    return res.status(500).json({ error: error.message });
  }
}
