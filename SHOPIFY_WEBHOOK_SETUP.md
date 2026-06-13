# Setup: Shopify Webhook para Meta Pixel Purchase Event

## O que faz

Quando um cliente coloca uma encomenda no Shopify, o webhook envia automaticamente um evento **Purchase** ao Meta Pixel.

## Passos para registar o webhook

1. **Shopify Admin** → **Settings** → **Apps and integrations** → **Webhooks**
2. Clica em **Create webhook**
3. Preenche:
   - **Topic:** `orders/create`
   - **Webhook URL:** `https://www.retromundial.com/api/shopify/webhook`
   - **API version:** 2024-01 (ou mais recente)
4. Clica **Save**

## Variáveis de Ambiente (Vercel)

Adiciona estas duas na Vercel → **Settings** → **Environment Variables**:

| Nome | Valor | Onde encontrar |
|------|-------|---|
| `META_PIXEL_ID` | `2187595858447389` | Shopify Admin → Marketing → Facebook (ou Meta Business Suite) |
| `META_ACCESS_TOKEN` | (token) | Meta Business Suite → Conversions API → Generate Token |

## Teste

1. Coloca uma encomenda no site (ou usa Shopify Admin para criar um pedido de teste)
2. Vai a **Meta Events Manager** → **Test events** → verifica que `Purchase` aparece
3. Aguarda 15-20 minutos (Meta pode demorar a processar)

## Se não funcionar

- Verifica logs na Vercel → **Deployments** → **Logs**
- Confirma que `META_PIXEL_ID` e `META_ACCESS_TOKEN` estão corretos
- Testa a URL do webhook em: `https://developers.facebook.com/docs/webhooks/test`
