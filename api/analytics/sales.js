// GET /api/analytics/sales?since=YYYY-MM-DD&until=YYYY-MM-DD

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { since, until } = req.query;
  const startDate = since || (() => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString(); })();
  const endDate   = until ? new Date(until + 'T23:59:59Z').toISOString() : new Date().toISOString();

  try {
    // Pedidos no período
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_price, status, created_at, customer_email')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Novos clientes no período
    const { count: newCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Pipeline de clientes
    const { data: pipeline } = await supabase
      .from('customers')
      .select('stage')
      .not('stage', 'is', null);

    const stages = { visitor: 0, cart_abandoned: 0, purchased: 0, completed: 0, cancelled: 0 };
    (pipeline || []).forEach(c => { if (stages[c.stage] !== undefined) stages[c.stage]++; });

    // Receita por dia (para o gráfico)
    const dailyMap = {};
    (orders || []).forEach(o => {
      const day = o.created_at.slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { date: day, revenue: 0, orders: 0 };
      dailyMap[day].revenue += parseFloat(o.total_price || 0);
      dailyMap[day].orders++;
    });
    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = (orders || []).reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
    const totalOrders  = (orders || []).length;
    const avgOrder     = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return res.status(200).json({
      success: true,
      totalRevenue,
      totalOrders,
      avgOrder,
      newCustomers: newCustomers || 0,
      pipeline: stages,
      daily,
    });
  } catch (e) {
    console.error('[SALES API]', e.message);
    // fallback mock
    return res.status(200).json({
      success: true,
      mock: true,
      totalRevenue: 6102,
      totalOrders: 138,
      avgOrder: 44.2,
      newCustomers: 104,
      pipeline: { visitor: 340, cart_abandoned: 87, purchased: 138, completed: 95, cancelled: 12 },
      daily: Array.from({ length: 30 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i));
        return { date: d.toISOString().slice(0,10), revenue: Math.round(100 + Math.random() * 350), orders: Math.round(2 + Math.random() * 8) };
      }),
    });
  }
}
