import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    items: [],
    notes: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
  }, []);

  // Check if there's an orderId parameter and open that order
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === parseInt(orderId));
      if (order) {
        viewOrder(order);
        // Remove the parameter from URL
        setSearchParams({});
      }
    }
  }, [searchParams, orders]);

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product_id: "", quantity: 1 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/orders", form);
      setForm({
        customer_id: "",
        items: [],
        notes: ""
      });
      setShowModal(false);
      loadOrders();
      loadProducts(); // Recargar productos para actualizar stock
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      loadOrders();
    } catch (err) {
      console.error("Error al actualizar estado del pedido:", err);
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.Customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.Customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <TruckIcon className="h-5 w-5 text-orange-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status) => {
    const translations = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return translations[status] || status;
  };

  const translatePaymentStatus = (status) => {
    const translations = {
      'paid': 'Pagado',
      'partial': 'Parcial',
      'unpaid': 'No pagado',
      'pending': 'Pendiente'
    };
    return translations[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pedidos</h1>
          <p className="text-gray-600">Administra pedidos y ventas</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Pedido
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando pedidos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => viewOrder(order)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.Customer?.name}</div>
                          <div className="text-sm text-gray-500">{order.Customer?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{translateStatus(order.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${order.total}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewOrder(order);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium mr-3 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1.5" />
                          Ver detalles
                        </button>
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="processing">Procesando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? "No se encontraron pedidos con ese criterio de búsqueda." : "No hay pedidos registrados."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Pedido</h3>
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    value={form.customer_id}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Productos *
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      + Agregar Producto
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                        <select
                          value={item.product_id}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Seleccionar producto</option>
                          {products.filter(p => p.active).map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price} (Stock: {product.stock})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="Cant."
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Notas adicionales del pedido..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || form.items.length === 0}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md transition-colors flex items-center"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    Crear Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal - Enhanced */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl shadow-2xl rounded-lg bg-white max-h-[95vh] overflow-hidden flex flex-col">
            {/* Botones de acción flotantes - NO SE IMPRIMEN */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg flex items-center gap-2"
                title="Imprimir cotización"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg"
                title="Cerrar"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content scrollable - FORMATO PROFESIONAL PARA IMPRESIÓN */}
            <div className="flex-1 overflow-y-auto p-8 bg-white print-content">
              {/* Header de Cotización */}
              <div className="mb-8 pb-6 border-b-4 border-blue-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">COTIZACIÓN</h1>
                    <p className="text-lg font-semibold text-blue-600">{selectedOrder.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Tu Empresa</h2>
                    <p className="text-sm text-gray-600">República Dominicana</p>
                    <p className="text-sm text-gray-600">Tel: (809) 000-0000</p>
                    <p className="text-sm text-gray-600">email@empresa.com</p>
                  </div>
                </div>
                
                {/* Badge de Estado */}
                <div className="mt-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    selectedOrder.status === 'processing' ? 'bg-orange-100 text-orange-800' :
                    selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-2">{translateStatus(selectedOrder.status)}</span>
                  </span>
                </div>
              </div>

              {/* Información de Fecha y Cliente - Layout en 2 columnas */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Información de la Cotización */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-2">
                    Información de la Cotización
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha de Emisión:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {selectedOrder.orderDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha del Pedido:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(selectedOrder.orderDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {selectedOrder.deliveryDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha de Entrega:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(selectedOrder.deliveryDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estado de Pago:</span>
                      <span className={`font-semibold ${
                        selectedOrder.paymentStatus === 'paid' ? 'text-green-600' :
                        selectedOrder.paymentStatus === 'partial' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {translatePaymentStatus(selectedOrder.paymentStatus || 'unpaid')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del Cliente */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-2">
                    Cliente
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Nombre</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedOrder.Customer?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedOrder.Customer?.email || 'N/A'}</p>
                    </div>
                    {selectedOrder.Customer?.phone && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedOrder.Customer.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 uppercase">ID Cliente</p>
                      <p className="text-sm font-semibold text-gray-900">CLI-{String(selectedOrder.customer_id).padStart(3, '0')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Productos - FORMATO PROFESIONAL */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Detalle de Productos y Servicios
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Producto
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide w-24">
                        Cantidad
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide w-32">
                        Precio Unit.
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide w-32">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.OrderItems?.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-gray-900">{item.Product?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">SKU: {item.Product?.sku}</p>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="text-right py-4 px-4 text-sm font-medium text-gray-900">
                          ${parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="text-right py-4 px-4 text-sm font-bold text-gray-900">
                          ${parseFloat(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales - Caja destacada a la derecha */}
              <div className="mb-8">
                <div className="ml-auto w-full md:w-80 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-blue-300">
                    Resumen de Totales
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold text-gray-900">
                        ${parseFloat(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}
                      </span>
                    </div>
                    
                    {selectedOrder.taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Impuestos:</span>
                        <span className="font-semibold text-gray-900">
                          ${parseFloat(selectedOrder.taxAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Descuento:</span>
                        <span className="font-semibold text-red-600">
                          -${parseFloat(selectedOrder.discountAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">TOTAL:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${parseFloat(selectedOrder.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedOrder.notes && (
                <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
                    <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Notas Adicionales
                  </h3>
                  <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Términos y Condiciones */}
              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Términos y Condiciones
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
                  <p>• Los precios están sujetos a cambios sin previo aviso.</p>
                  <p>• El pago debe realizarse según los términos acordados.</p>
                  <p>• Esta cotización no representa una factura fiscal.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                <p className="text-xs text-gray-500">
                  Gracias por su preferencia | © {new Date().getFullYear()} Tu Empresa | República Dominicana
                </p>
              </div>
            </div>
          </div>

          {/* CSS para impresión */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-content, .print-content * {
                visibility: visible;
              }
              .print-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20mm;
                background: white;
              }
              .no-print {
                display: none !important;
              }
              @page {
                size: A4;
                margin: 15mm 10mm;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}