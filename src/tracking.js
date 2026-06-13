// ─── META TRACKING (Pixel + Conversions API com deduplicação) ──────────────────
// Dispara cada evento no navegador (fbq) E no servidor (/api/capi) usando o
// MESMO event_id, para que o Meta deduplique e conte 1 só evento — mas com
// cobertura da Conversions API (melhora o data quality score).

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
}

function genEventId() {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
}

// Captura fbclid da URL e gera o cookie _fbc se ainda não existir
function ensureFbc() {
  let fbc = getCookie('_fbc');
  if (fbc) return fbc;
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  if (fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  return fbc;
}

export function trackEvent(eventName, customData = {}, email) {
  const eventId = genEventId();

  // 1. Navegador (Pixel)
  if (window.fbq) {
    window.fbq('track', eventName, customData, { eventID: eventId });
  }

  // 2. Servidor (Conversions API) — mesmo event_id → deduplicação
  try {
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        custom_data: customData,
        fbp: getCookie('_fbp'),
        fbc: ensureFbc(),
        email,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // falha silenciosa — nunca quebra a UI
  }

  return eventId;
}
