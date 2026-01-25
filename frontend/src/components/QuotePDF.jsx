import React, { useEffect, useState } from 'react';
import { DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function QuotePDF({ quote, company, onClose }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSubtotal = () => {
    return quote.QuoteItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateItemDiscounts = () => {
    return quote.QuoteItems?.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
      return sum + itemDiscount;
    }, 0) || 0;
  };

  const calculateTax = (subtotal) => {
    return (subtotal * company.tax.taxPercentage) / 100;
  };

  const subtotal = calculateSubtotal();
  const itemDiscounts = calculateItemDiscounts();
  const subtotalAfterItemDiscounts = subtotal - itemDiscounts;
  const generalDiscountAmount = (subtotalAfterItemDiscounts * (quote.discount || 0)) / 100;
  const subtotalAfterAllDiscounts = subtotalAfterItemDiscounts - generalDiscountAmount;
  const tax = calculateTax(subtotalAfterAllDiscounts);
  const total = subtotalAfterAllDiscounts + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-indigo-600 text-white p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Cotización #{quote.quoteNumber}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
              title="Imprimir"
            >
              <PrinterIcon className="h-5 w-5" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-indigo-100 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-white">
          {/* Encabezado de la empresa */}
          <div className="mb-8 pb-6 border-b-2 border-indigo-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.displayName}</h1>
                <p className="text-gray-600 text-sm mt-1">{company.description}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>{company.address.street}</p>
                <p>{company.address.city}, {company.address.state}</p>
                <p>{company.address.postalCode} - {company.address.country}</p>
                <p className="mt-2">{company.contact.email}</p>
                <p>{company.contact.phone}</p>
              </div>
            </div>
          </div>

          {/* Información de cotización */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Datos de la Cotización</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número:</span>
                  <span className="font-medium">{quote.quoteNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">{formatDate(quote.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Válida hasta:</span>
                  <span className="font-medium">{formatDate(quote.validUntil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                    quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    quote.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {quote.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Información del Cliente</h3>
              <div className="space-y-2 text-sm">
                {quote.Customer ? (
                  <>
                    <div>
                      <span className="text-gray-600">Nombre:</span>
                      <p className="font-medium">{quote.Customer?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{quote.Customer?.email}</p>
                    </div>
                    {quote.Customer?.phone && (
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <p className="font-medium">{quote.Customer?.phone}</p>
                      </div>
                    )}
                    {quote.Customer?.address && (
                      <div>
                        <span className="text-gray-600">Dirección:</span>
                        <p className="font-medium">{quote.Customer?.address}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-600">Nombre:</span>
                      <p className="font-medium">{quote.clientName}</p>
                    </div>
                    {quote.clientEmail && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{quote.clientEmail}</p>
                      </div>
                    )}
                    {quote.clientPhone && (
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <p className="font-medium">{quote.clientPhone}</p>
                      </div>
                    )}
                    {quote.clientCompany && (
                      <div>
                        <span className="text-gray-600">Empresa:</span>
                        <p className="font-medium">{quote.clientCompany}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Detalles de Productos</h3>
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Producto</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-700">Cantidad</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Precio Unit.</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Subtotal</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Desc.</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.QuoteItems?.map((item, index) => {
                  const itemSubtotal = item.price * item.quantity;
                  const itemDiscountAmount = (itemSubtotal * (item.discount || 0)) / 100;
                  const itemTotal = itemSubtotal - itemDiscountAmount;
                  return (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-900">{item.Product?.name}</td>
                      <td className="py-3 px-3 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-gray-600">${Number(item.price).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-gray-700 font-medium">${itemSubtotal.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-red-600">
                        {item.discount > 0 ? (
                          <span>
                            {item.discount}%<br/>
                            <span className="text-xs">-${itemDiscountAmount.toFixed(2)}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-900 bg-gray-50">${itemTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumen de totales */}
          <div className="flex justify-end mb-8">
            <div className="w-96 space-y-2 text-sm bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b-2 border-gray-300">Resumen de Totales</h3>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              {itemDiscounts > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Descuentos por producto:</span>
                  <span className="font-medium text-red-600">-${itemDiscounts.toFixed(2)}</span>
                </div>
              )}
              
              {(quote.discount > 0 || itemDiscounts > 0) && (
                <div className="flex justify-between py-2 border-t border-gray-300">
                  <span className="text-gray-600">Subtotal con desc. productos:</span>
                  <span className="font-medium text-gray-900">${subtotalAfterItemDiscounts.toFixed(2)}</span>
                </div>
              )}
              
              {quote.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Descuento general ({quote.discount}%):</span>
                  <span className="font-medium text-red-600">-${generalDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-t border-gray-300">
                <span className="text-gray-600 font-medium">Base imponible:</span>
                <span className="font-medium text-gray-900">${subtotalAfterAllDiscounts.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">ITBIS ({company.tax.taxPercentage}%):</span>
                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-3 bg-indigo-600 text-white px-4 rounded-lg mt-3">
                <span className="font-bold text-lg">TOTAL A PAGAR:</span>
                <span className="font-bold text-2xl">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {quote.notes && (
            <div className="mb-8 pb-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notas</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Términos y condiciones */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Términos y Condiciones</h3>
            <p className="text-gray-700 text-xs whitespace-pre-wrap">{company.quotes.termsAndConditions}</p>
          </div>

          {/* Pie de página */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Gracias por su confianza en {company.displayName}</p>
            <p className="mt-1">Para consultas: {company.contact.email} | {company.contact.phone}</p>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
