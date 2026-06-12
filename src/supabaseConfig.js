// ─── CONFIG COMPARTILHADA (SUPABASE) ──────────────────────────────────────────
// Guarda a config do site numa única linha da tabela `site_config`, para que
// imagens/textos editados no admin apareçam para TODOS os visitantes e
// dispositivos — não só no localStorage de quem editou.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

export const supabaseEnabled = !!(url && key);
const supabase = supabaseEnabled ? createClient(url, key) : null;

const CONFIG_ID = 'main';

// Carrega a config compartilhada. Retorna o objeto guardado ou null.
export async function loadRemoteConfig() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('data')
      .eq('id', CONFIG_ID)
      .maybeSingle();
    if (error) { console.error('[config] erro ao carregar do Supabase:', error.message); return null; }
    return data?.data ?? null;
  } catch (e) {
    console.error('[config] falha ao carregar do Supabase:', e);
    return null;
  }
}

// Grava a config compartilhada. Remove segredos antes de enviar, pois a
// linha é de leitura pública.
export async function saveRemoteConfig(config) {
  if (!supabase) return;
  try {
    const { adminPassword, ...rest } = config;
    const safe = {
      ...rest,
      integrations: { ...(rest.integrations || {}), anthropicKey: '' },
    };
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: CONFIG_ID, data: safe, updated_at: new Date().toISOString() });
    if (error) console.error('[config] erro ao salvar no Supabase:', error.message);
  } catch (e) {
    console.error('[config] falha ao salvar no Supabase:', e);
  }
}
