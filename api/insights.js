// ─── INSIGHTS DE FUNIL (Claude) ───────────────────────────────────────────────
// POST /api/insights  body: { funnel: <resposta de /api/funnel>, deep?: boolean }
// Analisa o funil com o Claude e retorna diagnóstico + recomendações.
// deep=false → claude-sonnet-4-6 (análise diária, rápida e barata)
// deep=true  → claude-opus-4-8  (análise semanal profunda)

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

let supabase = null;
function getSupabase() {
  if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
  return supabase;
}

const SYSTEM_PROMPT = `Você é um analista sênior de funil de vendas e tráfego pago para a Retro Mundial — loja de camisas oversized inspiradas em Copas do Mundo (ticket ~€37, mercado europeu, Meta Ads + TikTok orgânico).

Você recebe o funil de 7 estágios (Impressões → Cliques → PageView → ViewContent → AddToCart → InitiateCheckout → Purchase) do período atual e do anterior, com taxas de conversão e benchmarks.

Metodologia VTSD da marca (4 tipos de anúncio): Descoberta (alcance, CTA siga/comente), Relacionamento (públicos mornos), Conversão (frias+mornas, CTA saiba mais), Remarketing (quem entrou na página, CTA compre, urgência).

Diagnósticos típicos por vazamento:
- Impressão→Clique baixo: criativo/gancho fraco → trocar criativo
- Clique→PageView baixo: site lento ou link errado → problema técnico
- PageView→ViewContent baixo: homepage não direciona → UX/oferta
- ViewContent→AddToCart baixo: página de produto/preço → copy, fotos, prova social
- AddToCart→Checkout/Purchase baixo: fricção no checkout/frete → oferta de frete, recuperação de carrinho

Responda SEMPRE em português, neste formato markdown:
## Resumo
(2-3 frases: estado geral do funil e a mudança mais importante vs período anterior)
## Vazamentos
(para cada estágio warning/critical: o que está acontecendo, causa provável, impacto)
## Recomendações
(3-5 ações priorizadas, numeradas, concretas e executáveis — diga exatamente o que fazer)

REGRA IMPORTANTE sobre o pixel: se houver um "CONTEXTO DE DADOS" avisando que o rastreamento é parcial/recente, NÃO diagnostique "pixel quebrado", "URL errada" ou "consentimento GDPR" para o estágio PageView. Nesse caso o baixo PageView é apenas a janela de dados a alinhar — diga explicitamente que é técnico-temporal e que vai normalizar. Estágios com status "warming" significam exatamente isto: aguardando dados, não é problema.

Se houver poucos dados (valores zerados) E nenhum aviso de cobertura parcial, aí sim avalie problemas reais. Seja direto e prático, sem enrolação.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });

  try {
    const { funnel, deep = false } = req.body || {};
    if (!funnel?.current) return res.status(400).json({ error: 'funnel obrigatório (resposta de /api/funnel)' });

    const client = new Anthropic({ apiKey });
    const model = deep ? 'claude-opus-4-8' : 'claude-sonnet-4-6';

    const userContent = `${funnel.data_note ? `⚠️ CONTEXTO DE DADOS (lê primeiro): ${funnel.data_note}\n\n` : ''}Período: últimos ${funnel.days} dias (${funnel.period?.since} a ${funnel.period?.until})
Gasto em ads: €${(funnel.spend ?? 0).toFixed(2)} · Receita: €${(funnel.revenue ?? 0).toFixed(2)} · ROAS: ${funnel.roas != null ? funnel.roas.toFixed(2) : 'n/d'}

FUNIL ATUAL:
${JSON.stringify(funnel.current, null, 2)}

FUNIL PERÍODO ANTERIOR:
${JSON.stringify(funnel.previous, null, 2)}

${deep ? 'Esta é a análise semanal PROFUNDA — compare os períodos em detalhe, identifique tendências e seja mais completo nas recomendações.' : 'Esta é a análise diária rápida — foque no vazamento mais importante.'}`;

    const response = await client.messages.create({
      model,
      max_tokens: deep ? 3000 : 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    // Guarda o insight no Supabase (histórico — sync para Obsidian depois)
    try {
      const sb = getSupabase();
      if (sb) {
        await sb.from('funnel_insights').insert({
          model,
          deep,
          days: funnel.days,
          period_since: funnel.period?.since,
          period_until: funnel.period?.until,
          spend: funnel.spend,
          revenue: funnel.revenue,
          insights: text,
        });
      }
    } catch (e) {
      console.warn('[INSIGHTS SAVE]', e.message);
    }

    return res.status(200).json({
      success: true,
      model,
      insights: text,
      usage: {
        input_tokens: response.usage?.input_tokens,
        output_tokens: response.usage?.output_tokens,
      },
    });
  } catch (error) {
    console.error('[INSIGHTS ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
