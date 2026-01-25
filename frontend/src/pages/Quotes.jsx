import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import QuotePDF from "../components/QuotePDF";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  ArrowPathIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function Quotes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [clientType, setClientType] = useState('registered'); // 'registered' o 'new'
  const [formData, setFormData] = useState({
    customerId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    items: [{ productId: '', quantity: 1, discount: 0 }],
    validUntil: '',
    notes: '',
    discount: 0,
    currency: 'DOP' // Moneda por defecto
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      loadQuotes();
      loadCustomers();
      loadProducts();
      loadCompanyInfo();
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const loadQuotes = async () => {
    try {
      const res = await api.get("/quotes");
      setQuotes(res.data);
    } catch (err) {
      console.error("Error al cargar cotizaciones:", err);
      toast.error("Error al cargar cotizaciones");
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

  const loadCompanyInfo = async () => {
    try {
      const res = await api.get("/quotes/company/info");
      setCompany(res.data);
    } catch (err) {
      console.error("Error al cargar información de la empresa:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuote) {
        await api.put(`/quotes/${editingQuote.id}`, formData);
        toast.success("Cotización actualizada exitosamente");
      } else {
        await api.post("/quotes", formData);
        toast.success("Cotización creada exitosamente");
      }
      setShowModal(false);
      setEditingQuote(null);
      resetForm();
      loadQuotes();
    } catch (err) {
      console.error("Error al guardar cotización:", err);
      toast.error("Error al guardar cotización");
    }
  };

  const handleConvertToOrder = async (quoteId) => {
    if (!confirm('¿Estás seguro de convertir esta cotización en orden?')) return;

    try {
      await api.post(`/quotes/${quoteId}/convert-to-order`);
      toast.success("Cotización convertida a orden exitosamente");
      loadQuotes();
    } catch (err) {
      console.error("Error al convertir cotización a pedido:", err);
      toast.error("Error al convertir cotización");
    }
  };

  const handleDelete = async (quoteId) => {
    if (!confirm('¿Estás seguro de eliminar esta cotización? Esta acción no se puede deshacer.')) return;

    try {
      await api.delete(`/quotes/${quoteId}`);
      toast.success("Cotización eliminada exitosamente");
      if (selectedQuote?.id === quoteId) {
        setShowDetailPanel(false);
        setSelectedQuote(null);
      }
      loadQuotes();
    } catch (err) {
      console.error("Error al eliminar cotización:", err);
      toast.error("Error al eliminar cotización");
    }
  };

  const viewQuoteDetails = (quote) => {
    setSelectedQuote(quote);
    setShowDetailPanel(true);
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setFormData({
      customerId: quote.customer_id,
      items: quote.QuoteItems || [],
      validUntil: quote.validUntil,
      notes: quote.notes || '',
      discount: quote.discount || 0
    });
    setShowModal(true);
    setShowDetailPanel(false);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientCompany: '',
      items: [{ productId: '', quantity: 1, discount: 0 }],
      validUntil: '',
      notes: '',
      discount: 0
    });
    setClientType('registered');
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, discount: 0 }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? 'US$' : 'RD$';
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Cotizaciones
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona cotizaciones y conviértelas en órdenes
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nueva Cotización
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {quotes.map((quote) => {
                const hasDiscount = quote.discount > 0 || quote.QuoteItems?.some(item => item.discount > 0);
                
                return (
                  <li key={quote.id} className="px-6 py-4 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 cursor-pointer" onClick={() => viewQuoteDetails(quote)}>
                        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {quote.quoteNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {quote.Customer?.name || quote.clientName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-indigo-600">${Number(quote.total).toFixed(2)}</span>
                            {hasDiscount && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Con descuento
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            Válida hasta: {formatDate(quote.validUntil)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuote(quote);
                          setShowPDF(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Ver cotización en PDF"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(quote);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Editar cotización"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {quote.status === 'approved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToOrder(quote.id);
                          }}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Convertir a orden"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(quote.id);
                        }}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar cotización"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar cotización */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingQuote ? 'Editar Cotización' : 'Nueva Cotización'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selección de tipo de cliente */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">¿Cómo deseas agregar el cliente?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="registered"
                        checked={clientType === 'registered'}
                        onChange={(e) => {
                          setClientType(e.target.value);
                          setFormData({ ...formData, customerId: '', clientName: '', clientEmail: '', clientPhone: '', clientCompany: '' });
                        }}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Cliente Registrado</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="new"
                        checked={clientType === 'new'}
                        onChange={(e) => {
                          setClientType(e.target.value);
                          setFormData({ ...formData, customerId: '' });
                        }}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Cliente Nuevo (No registrado)</span>
                    </label>
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientType === 'registered' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cliente Registrado</label>
                      <select
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Seleccionar cliente</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>{customer.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                        <input
                          type="text"
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Empresa (Opcional)</label>
                        <input
                          type="text"
                          value={formData.clientCompany}
                          onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Válida hasta</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Seleccionar producto</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>{product.name} - ${product.price}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Cant."
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value))}
                        className="w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Desc.%"
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    + Agregar producto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descuento general (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Moneda</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="DOP">RD$ - Pesos Dominicanos</option>
                      <option value="USD">US$ - Dólares Americanos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingQuote(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingQuote ? 'Actualizar' : 'Crear'} Cotización
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cotización - Vista de Impresión */}
      {showDetailPanel && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-lg max-h-[95vh] overflow-hidden flex flex-col">
            
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
                onClick={() => setShowDetailPanel(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg"
                title="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content scrollable - FORMATO PROFESIONAL PARA IMPRESIÓN */}
            <div className="flex-1 overflow-y-auto p-8 bg-white print-content">
              {/* Header de Cotización */}
              <div className="mb-8 pb-6 border-b-4 border-blue-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">COTIZACIÓN</h1>
                    <p className="text-lg font-semibold text-blue-600">{selectedQuote.quoteNumber}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{company?.name || 'Tu Empresa'}</h2>
                    <p className="text-sm text-gray-600">
                      {company?.address && typeof company.address === 'object'
                        ? `${company.address.street || ''}, ${company.address.city || ''}, ${company.address.country || 'República Dominicana'}`
                        : company?.address || 'República Dominicana'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Tel: {company?.phone || '(809) 000-0000'}</p>
                    <p className="text-sm text-gray-600">{company?.email || 'email@empresa.com'}</p>
                  </div>
                </div>
                
                {/* Badge de Estado */}
                <div className="mt-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedQuote.status)}`}>
                    {selectedQuote.status}
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
                        {new Date(selectedQuote.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Válida Hasta:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(selectedQuote.validUntil).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
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
                    {selectedQuote.Customer ? (
                      <>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Nombre</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedQuote.Customer.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Email</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedQuote.Customer.email}</p>
                        </div>
                        {selectedQuote.Customer.phone && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedQuote.Customer.phone}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Nombre</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedQuote.clientName}</p>
                        </div>
                        {selectedQuote.clientEmail && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Email</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedQuote.clientEmail}</p>
                          </div>
                        )}
                        {selectedQuote.clientPhone && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedQuote.clientPhone}</p>
                          </div>
                        )}
                        {selectedQuote.clientCompany && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Empresa</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedQuote.clientCompany}</p>
                          </div>
                        )}
                      </>
                    )}
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
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide w-24">
                        Desc.
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide w-32">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.QuoteItems?.map((item, idx) => {
                      const itemSubtotal = item.price * item.quantity;
                      const itemDiscountAmount = (itemSubtotal * (item.discount || 0)) / 100;
                      const itemTotal = itemSubtotal - itemDiscountAmount;
                      
                      return (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="text-sm font-semibold text-gray-900">{item.Product?.name}</p>
                            {item.Product?.sku && (
                              <p className="text-xs text-gray-500 mt-1">SKU: {item.Product.sku}</p>
                            )}
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="text-right py-4 px-4 text-sm font-medium text-gray-900">
                            {getCurrencySymbol(selectedQuote.currency || 'DOP')} {parseFloat(item.price).toFixed(2)}
                          </td>
                          <td className="text-center py-4 px-4">
                            {item.discount > 0 ? (
                              <span className="text-xs text-red-600 font-semibold">{item.discount}%</span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right py-4 px-4 text-sm font-bold text-gray-900">
                            {getCurrencySymbol(selectedQuote.currency || 'DOP')} {itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
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
                    {(() => {
                      const subtotal = selectedQuote.QuoteItems?.reduce((sum, item) => {
                        return sum + (item.price * item.quantity);
                      }, 0) || 0;

                      const itemDiscounts = selectedQuote.QuoteItems?.reduce((sum, item) => {
                        const itemSubtotal = item.price * item.quantity;
                        const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
                        return sum + itemDiscount;
                      }, 0) || 0;

                      const subtotalAfterItemDiscounts = subtotal - itemDiscounts;
                      const generalDiscount = (subtotalAfterItemDiscounts * (selectedQuote.discount || 0)) / 100;
                      const total = subtotalAfterItemDiscounts - generalDiscount;

                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Subtotal:</span>
                            <span className="font-semibold text-gray-900">{getCurrencySymbol(selectedQuote.currency || 'DOP')} {subtotal.toFixed(2)}</span>
                          </div>
                          
                          {itemDiscounts > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Desc. por producto:</span>
                              <span className="font-semibold text-red-600">-{getCurrencySymbol(selectedQuote.currency || 'DOP')} {itemDiscounts.toFixed(2)}</span>
                            </div>
                          )}

                          {selectedQuote.discount > 0 && (
                            <>
                              <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                                <span className="text-gray-700">Subtotal c/desc:</span>
                                <span className="font-semibold text-gray-900">{getCurrencySymbol(selectedQuote.currency || 'DOP')} {subtotalAfterItemDiscounts.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Desc. general ({selectedQuote.discount}%):</span>
                                <span className="font-semibold text-red-600">-{getCurrencySymbol(selectedQuote.currency || 'DOP')} {generalDiscount.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                          
                          <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">TOTAL:</span>
                            <span className="text-2xl font-bold text-blue-600">{getCurrencySymbol(selectedQuote.currency || 'DOP')} {total.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedQuote.notes && (
                <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
                    <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Notas Adicionales
                  </h3>
                  <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">{selectedQuote.notes}</p>
                </div>
              )}

              {/* Términos y Condiciones */}
              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Términos y Condiciones
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Esta cotización es válida hasta la fecha indicada.</p>
                  <p>• Los precios están sujetos a cambios sin previo aviso.</p>
                  <p>• El pago debe realizarse según los términos acordados.</p>
                  <p>• Esta cotización no representa una factura fiscal.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                <p className="text-xs text-gray-500">
                  Gracias por su preferencia | © {new Date().getFullYear()} {company?.name || 'Tu Empresa'} | República Dominicana
                </p>
              </div>

              {/* Botones de acción - Solo visibles en pantalla, NO en impresión */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 space-y-3 no-print">
                <button
                  onClick={() => {
                    handleEdit(selectedQuote);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar Cotización
                </button>
                {selectedQuote.status === 'approved' && (
                  <button
                    onClick={() => {
                      handleConvertToOrder(selectedQuote.id);
                      setShowDetailPanel(false);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Convertir a Orden
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedQuote.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Eliminar Cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* PDF View */}
      {showPDF && selectedQuote && company && (
        <QuotePDF 
          quote={selectedQuote} 
          company={company}
          onClose={() => setShowPDF(false)}
        />
      )}
    </div>
  );
}