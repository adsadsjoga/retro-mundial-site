// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
// Importar este arquivo em qualquer rota Vercel que precise de DB

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_KEY são obrigatórios em .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── FUNÇÕES HELPERS ──────────────────────────────────────────────────────────

export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').eq('active', true);
  if (error) throw error;
  return data;
}

export async function getProductByHandle(handle) {
  const { data, error } = await supabase.from('products').select('*').eq('handle', handle).single();
  if (error) throw error;
  return data;
}

export async function updateProductStock(shopifyId, newStock) {
  const { error } = await supabase.from('products').update({ stock: newStock }).eq('shopify_id', shopifyId);
  if (error) throw error;
}

export async function getFAQs(productId) {
  const { data, error } = await supabase.from('faq').select('*').eq('product_id', productId);
  if (error) throw error;
  return data || [];
}

export async function getReviews(productId) {
  const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId);
  if (error) throw error;
  return data || [];
}

export async function getCustomers() {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) throw error;
  return data || [];
}
