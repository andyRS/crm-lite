import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const NCF_TYPE_LABELS = {
  "01": "01 - Consumidor Final",
  "02": "02 - Crédito Fiscal",
  "03": "03 - Nota de Débito",
  "04": "04 - Nota de Crédito",
  "11": "11 - Registro Único de Ingresos",
  "14": "14 - Régimen Especial",
  "15": "15 - Gubernamental",
  "16": "16 - Exportaciones",
};

const emptySequenceForm = {
  ncfType: "01",
  prefix: "B",
  rangeStart: "",
  rangeEnd: "",
  expirationDate: "",
};

export default function Settings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [sequenceForm, setSequenceForm] = useState(emptySequenceForm);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Solo un administrador puede acceder a Configuración");
      navigate("/");
      return;
    }
    if (user) {
      loadCompany();
      loadSequences();
    }
  }, [user]);

  const loadCompany = async () => {
    try {
      const res = await api.get("/company");
      setCompany(res.data);
      setCompanyForm(res.data);
    } catch (err) {
      console.error("Error al cargar datos de la empresa:", err);
      toast.error("Error al cargar datos de la empresa");
    } finally {
      setLoading(false);
    }
  };

  const loadSequences = async () => {
    try {
      const res = await api.get("/ncf-sequences/status");
      setSequences(res.data);
    } catch (err) {
      console.error("Error al cargar secuencias NCF:", err);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/company", companyForm);
      setCompany(res.data);
      toast.success("Datos de la empresa actualizados");
    } catch (err) {
      console.error("Error al actualizar empresa:", err);
      toast.error(err.response?.data?.msg || "Error al actualizar datos de la empresa");
    }
  };

  const handleSequenceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/ncf-sequences", sequenceForm);
      toast.success("Rango NCF creado");
      setShowSequenceModal(false);
      setSequenceForm(emptySequenceForm);
      loadSequences();
    } catch (err) {
      console.error("Error al crear rango NCF:", err);
      toast.error(err.response?.data?.msg || "Error al crear rango NCF");
    }
  };

  if (!user || loading || !companyForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
          Configuración
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Datos fiscales de la empresa y secuencias de comprobantes NCF
        </p>

        {/* Datos de la empresa */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Datos de la Empresa</h3>
          </div>

          <form onSubmit={handleCompanySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la empresa</label>
              <input
                type="text"
                required
                value={companyForm.name || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">RNC / Cédula de negocio</label>
              <input
                type="text"
                required
                value={companyForm.rnc || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, rnc: e.target.value })}
                placeholder="9 o 11 dígitos"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={companyForm.email || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                value={companyForm.phone || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección fiscal</label>
              <textarea
                rows={2}
                value={companyForm.address || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Moneda por defecto</label>
              <select
                value={companyForm.defaultCurrency || "DOP"}
                onChange={(e) => setCompanyForm({ ...companyForm, defaultCurrency: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              >
                <option value="DOP">DOP - Peso Dominicano</option>
                <option value="USD">USD - Dólar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">% ITBIS por defecto</label>
              <input
                type="number"
                step="0.01"
                value={companyForm.defaultTaxRate ?? 18}
                onChange={(e) => setCompanyForm({ ...companyForm, defaultTaxRate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notas al pie de factura</label>
              <textarea
                rows={2}
                value={companyForm.invoiceFooterNotes || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, invoiceFooterNotes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* Secuencias NCF */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Secuencias de Comprobantes (NCF)</h3>
            </div>
            <button
              onClick={() => setShowSequenceModal(true)}
              className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar rango
            </button>
          </div>

          {sequences.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay rangos de NCF configurados. Agrega uno autorizado por DGII (o de prueba) para poder emitir facturas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rango</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disponibles</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vence</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sequences.map((seq) => (
                    <tr key={seq.id} className={seq.nearLimit ? "bg-yellow-50" : ""}>
                      <td className="px-3 py-2 text-sm text-gray-900">{NCF_TYPE_LABELS[seq.ncfType] || seq.ncfType}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {seq.prefix}{seq.ncfType}{String(seq.rangeStart).padStart(8, "0")} - {seq.prefix}{seq.ncfType}{String(seq.rangeEnd).padStart(8, "0")}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">{seq.remaining} / {seq.total}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{seq.expirationDate}</td>
                      <td className="px-3 py-2 text-sm">
                        {seq.expired || seq.exhausted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            {seq.expired ? "Vencido" : "Agotado"}
                          </span>
                        ) : seq.nearLimit ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            Por agotarse
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Activo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal nuevo rango NCF */}
      {showSequenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo rango de NCF</h3>
            <form onSubmit={handleSequenceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de comprobante</label>
                <select
                  value={sequenceForm.ncfType}
                  onChange={(e) => setSequenceForm({ ...sequenceForm, ncfType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2 text-sm"
                >
                  {Object.entries(NCF_TYPE_LABELS).map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Desde</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={sequenceForm.rangeStart}
                    onChange={(e) => setSequenceForm({ ...sequenceForm, rangeStart: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hasta</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={sequenceForm.rangeEnd}
                    onChange={(e) => setSequenceForm({ ...sequenceForm, rangeEnd: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de vencimiento del rango</label>
                <input
                  type="date"
                  required
                  value={sequenceForm.expirationDate}
                  onChange={(e) => setSequenceForm({ ...sequenceForm, expirationDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSequenceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Crear rango
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
