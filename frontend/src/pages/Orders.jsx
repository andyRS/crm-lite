import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from "@heroicons/react/24/outline";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    items: [],
    notes: "",
    priority: "normal"
  });
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      toast.error("Error al cargar pedidos");
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

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === parseInt(orderId));
      if (order) {
        viewOrder(order);
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
    
    if (!form.customer_id) {
      toast.error("Selecciona un cliente");
      return;
    }
    
    if (form.items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", form);
      toast.success("Pedido creado exitosamente");
      setForm({
        customer_id: "",
        items: [],
        notes: "",
        priority: "normal"
      });
      setShowModal(false);
      loadOrders();
      loadProducts();
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error(err.response?.data?.msg || "Error al crear pedido");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      toast.success("Estado actualizado exitosamente");
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      toast.error("Error al actualizar estado");
    }
  };

  const editOrder = (order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const updateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/orders/${editingOrder.id}`, {
        status: editingOrder.status,
        notes: editingOrder.notes,
        deliveryDate: editingOrder.deliveryDate
      });
      toast.success("Pedido actualizado exitosamente");
      setShowEditModal(false);
      loadOrders();
    } catch (err) {
      console.error("Error al actualizar pedido:", err);
      toast.error("Error al actualizar pedido");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      toast.success("Pedido eliminado exitosamente");
      loadOrders();
      setShowOrderModal(false);
    } catch (err) {
      console.error("Error al eliminar pedido:", err);
      toast.error(err.response?.data?.msg || "Error al eliminar pedido");
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.Customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.Customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'processing':
        return <ShoppingBagIcon className="h-5 w-5" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <ShoppingBagIcon className="h-10 w-10 mr-3 text-indigo-600" />
                Gestión de Pedidos
              </h1>
              <p className="text-gray-600">Administra y realiza seguimiento de todos tus pedidos</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Pedido
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <ShoppingBagIcon className="h-12 w-12 text-blue-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-purple-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de pedido, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Cargando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No se encontraron pedidos</p>
              <p className="text-gray-500 mt-2">Crea tu primer pedido para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingBagIcon className="h-5 w-5 text-indigo-600 mr-2" />
                          <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.Customer?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.Customer?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{translateStatus(order.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-1" />
                          <span className="text-sm font-bold text-gray-900">${order.total?.toFixed(2) || '0.00'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(order.orderDate || order.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewOrder(order);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editOrder(order);
                            }}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOrder(order.id);
                            }}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Pedido */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <ShoppingBagIcon className="h-7 w-7 mr-2" />
                  Nuevo Pedido
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={submit} className="p-6">
              {/* Cliente y Prioridad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    value={form.customer_id}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Productos *
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Producto
                  </button>
                </div>

                {form.items.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No hay productos agregados</p>
                    <p className="text-sm text-gray-400 mt-1">Haz clic en "Agregar Producto" para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItem(index, "product_id", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          >
                            <option value="">Selecciona producto</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ${product.price} (Stock: {product.stock})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-28">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            placeholder="Cant."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Instrucciones especiales, observaciones..."
                />
              </div>

              {/* Total */}
              {form.items.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total estimado:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? "Creando..." : "Crear Pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <ShoppingBagIcon className="h-7 w-7 mr-2" />
                    Detalles del Pedido
                  </h2>
                  <p className="text-indigo-100 mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Estado y Acciones */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-700">Estado Actual:</span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-2">{translateStatus(selectedOrder.status)}</span>
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cambiar Estado:
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Información del Cliente
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Nombre:</span> {selectedOrder.Customer?.name || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.Customer?.email || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Teléfono:</span> {selectedOrder.Customer?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <ShoppingBagIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Productos
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Producto</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Cantidad</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Precio</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.OrderItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.Product?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">${item.price?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            ${(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total y Notas */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${selectedOrder.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notas:</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => deleteOrder(selectedOrder.id)}
                  className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Eliminar Pedido
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      editOrder(selectedOrder);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Pedido */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <PencilIcon className="h-7 w-7 mr-2" />
                  Editar Pedido
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={updateOrder} className="p-6">
              <div className="space-y-6">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="confirmed">Processing</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                {/* Fecha de Entrega */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha de Entrega (opcional)
                  </label>
                  <input
                    type="date"
                    value={editingOrder.deliveryDate ? new Date(editingOrder.deliveryDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, deliveryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={editingOrder.notes || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Instrucciones especiales, observaciones..."
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
