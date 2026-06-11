// ─── API: CLIENTES ────────────────────────────────────────────────────────────
// GET /api/customers?stage=purchased&limit=50&offset=0&search=email@example.com
// GET /api/customers/:email

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email: emailParam, stage, limit = '50', offset = '0', search } = req.query;

    // ─── DETALHE DE UM CLIENTE ─────────────────────────────────────────────────
    if (emailParam) {
      const customerEmail = Array.isArray(emailParam) ? emailParam[0] : emailParam;

      // 1. Dados do cliente
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (customerError || !customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // 2. Pedidos do cliente
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });

      // 3. Items dos pedidos
      const orderIds = orders?.map(o => o.id) || [];
      let orderItems = [];
      if (orderIds.length > 0) {
        const { data } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        orderItems = data || [];
      }

      // 4. Timeline de eventos
      const { data: events } = await supabase
        .from('customer_events')
        .select('*')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false })
        .limit(50);

      // 5. Juntar orders com seus items
      const ordersWithItems = orders?.map(order => ({
        ...order,
        items: orderItems.filter(item => item.order_id === order.id),
      })) || [];

      return res.status(200).json({
        success: true,
        customer,
        orders: ordersWithItems,
        events: events || [],
        totalOrders: orders?.length || 0,
        totalSpent: orders?.reduce((sum, o) => sum + parseFloat(o.total_price), 0) || 0,
      });
    }

    // ─── LISTA DE CLIENTES COM FILTROS ────────────────────────────────────────
    let query = supabase.from('customers').select('*', { count: 'exact' });

    // Filtrar por stage
    if (stage && stage !== 'all') {
      query = query.eq('stage', stage);
    }

    // Busca por email ou nome
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Paginação
    const skip = parseInt(offset) || 0;
    const take = Math.min(parseInt(limit) || 50, 100); // Max 100

    const { data: customers, count, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total: count,
        limit: take,
        offset: skip,
        hasMore: skip + take < (count || 0),
      },
    });
  } catch (error) {
    console.error('[CUSTOMERS API]', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
