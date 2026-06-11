import { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, Package, Mail, Calendar } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 20;

  // ─── CARREGAR LISTA DE CLIENTES ────────────────────────────────────────────
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit,
          offset: page * limit,
          ...(search && { search }),
          ...(stage !== 'all' && { stage }),
        });

        const res = await fetch(`/api/customers?${params}`);
        const json = await res.json();

        if (json.success) {
          setCustomers(json.data);
          setTotal(json.pagination.total);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, [page, search, stage]);

  // ─── CARREGAR DETALHE DO CLIENTE ───────────────────────────────────────────
  const loadCustomerDetail = async (email) => {
    try {
      const res = await fetch(`/api/customers/${email}`);
      const json = await res.json();
      if (json.success) {
        setSelectedCustomer(json);
      }
    } catch (err) {
      console.error('Failed to fetch customer detail:', err);
    }
  };

  const stageColors = {
    visitor: 'bg-gray-100 text-gray-800',
    cart_abandoned: 'bg-red-100 text-red-800',
    purchased: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const stageLabels = {
    visitor: '👤 Visitante',
    cart_abandoned: '🛒 Carrinho Abandonado',
    purchased: '💳 Comprou',
    completed: '📦 Entregue',
    cancelled: '❌ Cancelado',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Clientes</h1>
          <p className="text-gray-600">
            {total} clientes registrados · {customers.length} exibindo
          </p>
        </div>

        {/* FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar email ou nome..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setPage(0);
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os estágios</option>
            <option value="visitor">Visitante</option>
            <option value="cart_abandoned">Carrinho Abandonado</option>
            <option value="purchased">Comprou</option>
            <option value="completed">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <div className="text-right pt-3 text-sm text-gray-600">
            Página {page + 1} de {Math.ceil(total / limit)}
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LISTA DE CLIENTES */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Carregando...</div>
              ) : customers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Nenhum cliente encontrado</div>
              ) : (
                <div className="divide-y">
                  {customers.map((customer) => (
                    <button
                      key={customer.email}
                      onClick={() => loadCustomerDetail(customer.email)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedCustomer?.customer.email === customer.email ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                      }`}
                    >
                      <div className="font-semibold text-black truncate">{customer.name || customer.email}</div>
                      <div className="text-sm text-gray-600 truncate">{customer.email}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            stageColors[customer.stage] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {stageLabels[customer.stage] || customer.stage}
                        </span>
                        <span className="text-xs text-amber-600 font-semibold">
                          €{parseFloat(customer.total_spent || 0).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* PAGINAÇÃO */}
              <div className="p-4 border-t flex justify-between">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm font-semibold"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit) - 1}
                  className="px-4 py-2 bg-amber-500 text-white rounded disabled:opacity-50 text-sm font-semibold"
                >
                  Próximo →
                </button>
              </div>
            </div>
          </div>

          {/* DETALHE DO CLIENTE */}
          <div className="lg:col-span-2">
            {selectedCustomer ? (
              <div className="space-y-6">
                {/* CARD PRINCIPAL */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-black">{selectedCustomer.customer.name}</h2>
                      <p className="text-gray-600">{selectedCustomer.customer.email}</p>
                    </div>
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-semibold ${
                        stageColors[selectedCustomer.customer.stage]
                      }`}
                    >
                      {stageLabels[selectedCustomer.customer.stage]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Gasto</p>
                      <p className="text-2xl font-bold text-amber-600">€{selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total de Pedidos</p>
                      <p className="text-2xl font-bold text-black">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Primeira Compra</p>
                      <p className="text-sm font-semibold text-black">
                        {selectedCustomer.customer.first_purchase_at
                          ? new Date(selectedCustomer.customer.first_purchase_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cliente Desde</p>
                      <p className="text-sm font-semibold text-black">
                        {new Date(selectedCustomer.customer.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PEDIDOS */}
                {selectedCustomer.orders.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" /> Pedidos ({selectedCustomer.orders.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-black">Pedido #{order.shopify_order_id}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded font-semibold ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          {/* ITEMS DO PEDIDO */}
                          <div className="mb-3 space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="text-sm text-gray-700 flex justify-between">
                                <span>
                                  {item.product_title} {item.variant_title ? `(${item.variant_title})` : ''}
                                </span>
                                <span className="font-semibold">
                                  {item.quantity}x €{parseFloat(item.price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t pt-3 flex justify-between font-semibold">
                            <span>Total do Pedido</span>
                            <span className="text-amber-600">€{parseFloat(order.total_price).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TIMELINE DE EVENTOS */}
                {selectedCustomer.events.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> Timeline ({selectedCustomer.events.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedCustomer.events.map((event, idx) => (
                        <div key={event.id} className="flex gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <div className="flex-grow">
                            <p className="font-semibold text-black">{event.event_type}</p>
                            <p className="text-gray-600 text-xs">
                              {new Date(event.created_at).toLocaleString('pt-BR')}
                            </p>
                            {event.event_data && (
                              <p className="text-gray-700 mt-1">
                                {JSON.stringify(event.event_data, null, 2).substring(0, 100)}...
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Selecione um cliente para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
