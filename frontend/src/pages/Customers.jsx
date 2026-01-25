import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ 
    id: null, 
    name: "", 
    lastName: "",
    cedula: "",
    email: "", 
    phone: "",
    address: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Los apellidos son obligatorios";
    }

    if (!form.cedula.trim()) {
      newErrors.cedula = "La cédula es obligatoria";
    } else if (!/^[0-9]{11}$/.test(form.cedula)) {
      newErrors.cedula = "La cédula debe tener exactamente 11 dígitos";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    }

    if (!form.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (form.id) {
        await api.put(`/customers/${form.id}`, form);
      } else {
        // No enviar el campo "id" cuando se crea un nuevo cliente
        const { id, ...customerData } = form;
        await api.post("/customers", customerData);
      }

      setForm({ id: null, name: "", lastName: "", cedula: "", email: "", phone: "", address: "" });
      setErrors({});
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      console.error("Datos de respuesta:", err.response?.data);
      console.error("Array de errores de respuesta:", err.response?.data?.errors);
      console.error("Estado de respuesta:", err.response?.status);
      
      // Mostrar errores de validación del backend
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const backendErrors = {};
        err.response.data.errors.forEach(e => {
          console.error("Campo con error:", e);
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
        alert(`Error de validación: ${err.response.data.errors.map(e => e.message).join(', ')}`);
      } else if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Error al guardar cliente. Por favor revisa los datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCedulaChange = (value) => {
    // Solo permitir números y limitar a 11 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 11);
    setForm({ ...form, cedula: numericValue });
    if (errors.cedula) {
      setErrors({ ...errors, cedula: '' });
    }
  };

  const viewCustomerDetails = (c) => {
    setSelectedCustomer(c);
    setShowDetailPanel(true);
  };

  const edit = (c) => {
    setForm({
      id: c.id,
      name: c.name,
      lastName: c.lastName || "",
      cedula: c.cedula || "",
      email: c.email,
      phone: c.phone || "",
      address: c.address || "",
    });
    setErrors({});
    setShowModal(true);
    setShowDetailPanel(false);
  };

  const remove = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await api.delete(`/customers/${id}`);
        loadCustomers();
      } catch (err) {
        console.error("Error al eliminar cliente:", err);
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra tu base de clientes</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
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
            Agregar Cliente
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando clientes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-indigo-50 cursor-pointer transition-colors" onClick={() => viewCustomerDetails(c)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                          <span className="text-sm font-semibold">{c.clientId || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{c.name} {c.lastName}</div>
                        {c.address && <div className="text-xs text-gray-500">{c.address.substring(0, 30)}...</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{c.cedula || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{c.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{c.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => edit(c)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => remove(c.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? "No se encontraron clientes con ese criterio de búsqueda." : "No hay clientes registrados."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {form.id ? "Editar Cliente" : "Agregar Cliente"}
              </h3>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      placeholder="Juan"
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      placeholder="Pérez García"
                      value={form.lastName}
                      onChange={(e) => {
                        setForm({ ...form, lastName: e.target.value });
                        if (errors.lastName) setErrors({ ...errors, lastName: '' });
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula * <span className="text-xs text-gray-500">(11 dígitos)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="00100000000"
                    value={form.cedula}
                    onChange={(e) => handleCedulaChange(e.target.value)}
                    maxLength="11"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.cedula ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.cedula && <p className="text-xs text-red-500 mt-1">{errors.cedula}</p>}
                  {!errors.cedula && form.cedula && <p className="text-xs text-green-600 mt-1">{form.cedula.length}/11 dígitos</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    placeholder="809-555-1234"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <textarea
                    placeholder="Calle, número, sector, ciudad..."
                    value={form.address}
                    onChange={(e) => {
                      setForm({ ...form, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    rows="2"
                    required
                  ></textarea>
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
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
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md transition-colors flex items-center"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {form.id ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {showDetailPanel && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto transition-transform">
            {/* Header */}
            <div className="sticky top-0 bg-indigo-600 text-white p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCustomer.name} {selectedCustomer.lastName}</h2>
                  <p className="text-indigo-100 text-sm mt-1">ID: {selectedCustomer.clientId}</p>
                </div>
                <button
                  onClick={() => setShowDetailPanel(false)}
                  className="text-indigo-100 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Cédula */}
              <div className="border-b pb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cédula</label>
                <p className="text-lg font-medium text-gray-900">{selectedCustomer.cedula}</p>
              </div>

              {/* Email */}
              <div className="border-b pb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Email</label>
                <p className="text-gray-900">{selectedCustomer.email}</p>
                <a href={`mailto:${selectedCustomer.email}`} className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block">
                  Enviar correo
                </a>
              </div>

              {/* Teléfono */}
              <div className="border-b pb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Teléfono</label>
                <p className="text-gray-900">{selectedCustomer.phone || "N/A"}</p>
                {selectedCustomer.phone && (
                  <a href={`tel:${selectedCustomer.phone}`} className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block">
                    Llamar
                  </a>
                )}
              </div>

              {/* Dirección */}
              <div className="border-b pb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Dirección</label>
                <p className="text-gray-900">{selectedCustomer.address || "N/A"}</p>
              </div>

              {/* Fecha de creación */}
              <div className="border-b pb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Registrado el</label>
                <p className="text-gray-600">
                  {new Date(selectedCustomer.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Acciones */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => edit(selectedCustomer)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar Cliente
                </button>
                <button
                  onClick={() => {
                    remove(selectedCustomer.id);
                    setShowDetailPanel(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Eliminar Cliente
                </button>
                <button
                  onClick={() => setShowDetailPanel(false)}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
