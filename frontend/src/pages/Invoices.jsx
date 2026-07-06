import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PrinterIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
  XMarkIcon,
  EyeIcon,
  CreditCardIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

export default function Invoices() {
  const [view, setView] = useState("dashboard"); // dashboard, create, search, list
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    pendingAmount: 0
  });
  const [form, setForm] = useState({
    customer_id: "",
    items: [{ product_id: "", quantity: 1, price: 0 }],
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    taxRate: 18,
    discountAmount: 0,
    notes: "",
    paymentMethod: "cash",
    currency: "DOP", // Moneda por defecto
    ncfType: "01",
    retentionApplies: false,
    itbisRetentionPercentage: "",
    isrRetentionPercentage: "",
    editingId: null
  });
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    amount: 0
  });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [creditDebitNotes, setCreditDebitNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({ noteType: "credit_note", amount: "", reason: "" });

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadProducts();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [invoices]);

  useEffect(() => {
    if (showDetailModal && selectedInvoice?.id) {
      loadCreditDebitNotes(selectedInvoice.id);
    } else {
      setCreditDebitNotes([]);
    }
  }, [showDetailModal, selectedInvoice?.id]);

  const loadCreditDebitNotes = async (invoiceId) => {
    try {
      const res = await api.get(`/credit-debit-notes?invoice_id=${invoiceId}`);
      setCreditDebitNotes(res.data);
    } catch (err) {
      console.error("Error al cargar notas de crédito/débito:", err);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteForm.amount || !noteForm.reason) {
      alert("Monto y razón son obligatorios");
      return;
    }
    try {
      await api.post("/credit-debit-notes", {
        invoice_id: selectedInvoice.id,
        noteType: noteForm.noteType,
        amount: noteForm.amount,
        reason: noteForm.reason
      });
      alert("Nota emitida exitosamente");
      setShowNoteModal(false);
      setNoteForm({ noteType: "credit_note", amount: "", reason: "" });
      loadCreditDebitNotes(selectedInvoice.id);
      loadInvoices();
    } catch (err) {
      console.error("Error al crear nota:", err);
      alert(err.response?.data?.msg || "Error al crear nota de crédito/débito");
    }
  };

  useEffect(() => {
    console.log("showPaymentModal cambió a:", showPaymentModal);
    if (showPaymentModal) {
      console.log("El modal de pago debería estar visible ahora");
      console.log("paymentData actual:", paymentData);
    }
  }, [showPaymentModal]);

  const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? 'US$' : 'RD$';
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data);
    } catch (err) {
      console.error("Error al cargar facturas:", err);
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

  const calculateStats = () => {
    const total = invoices.length;
    const pending = invoices.filter(inv => inv.status === 'pending').length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

    setStats({ total, pending, paid, overdue, totalAmount, pendingAmount });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    
    console.log("Método de pago seleccionado:", form.paymentMethod);
    console.log("Editando factura ID:", form.editingId);
    
    // Validar que haya cliente seleccionado
    if (!form.customer_id) {
      alert("Por favor selecciona un cliente");
      return;
    }
    
    // Validar que haya al menos un producto
    if (form.items.length === 0) {
      alert("Por favor agrega al menos un producto");
      return;
    }
    
    // Validar que todos los productos tengan datos completos
    const hasIncompleteItems = form.items.some(item => 
      !item.product_id || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0
    );
    
    if (hasIncompleteItems) {
      alert("Por favor completa todos los datos de los productos (producto, cantidad y precio)");
      return;
    }
    
    // Si el método de pago es tarjeta, mostrar modal de pago
    if (form.paymentMethod === 'card') {
      console.log("Abriendo modal de pago...");
      const totals = calculateTotal();
      console.log("Totales calculados:", totals);
      setPaymentData({ ...paymentData, amount: totals.total });
      setShowPaymentModal(true);
      console.log("showPaymentModal establecido a true");
      return;
    }
    
    console.log("Guardando factura directamente (no es tarjeta)");
    // Si es otro método de pago, guardar factura directamente
    await createInvoiceDirectly();
  };

  const createInvoiceDirectly = async () => {
    setLoading(true);
    try {
      const isEditing = form.editingId;
      
      if (isEditing) {
        // Actualizar factura existente
        await api.put(`/invoices/${form.editingId}`, form);
        alert("Factura actualizada exitosamente");
      } else {
        // Crear nueva factura
        await api.post("/invoices", form);
        alert("Factura creada exitosamente y agregada a facturas pendientes por pago");
      }
      
      setForm({
        customer_id: "",
        items: [{ product_id: "", quantity: 1, price: 0 }],
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        taxRate: 18,
        discountAmount: 0,
        notes: "",
        paymentMethod: "cash",
        ncfType: "01",
        retentionApplies: false,
        itbisRetentionPercentage: "",
        isrRetentionPercentage: "",
        editingId: null
      });
      setView("pending");
      loadInvoices();
    } catch (err) {
      console.error("Error al guardar factura:", err);
      alert(err.response?.data?.msg || "Error al guardar factura");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/customers", newCustomer);
      alert("Cliente creado exitosamente");
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
      setShowCreateCustomerModal(false);
      await loadCustomers();
      // Seleccionar automáticamente el nuevo cliente
      setForm({ ...form, customer_id: res.data.id });
    } catch (err) {
      console.error("Error al crear cliente:", err);
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validación básica de tarjeta
      if (paymentData.cardNumber.replace(/\s/g, '').length < 15) {
        alert("Número de tarjeta inválido");
        setLoading(false);
        return;
      }
      
      if (!paymentData.cardName || paymentData.cardName.trim() === '') {
        alert("Por favor ingrese el nombre del titular");
        setLoading(false);
        return;
      }
      
      if (paymentData.expiryDate.length < 5) {
        alert("Fecha de expiración inválida");
        setLoading(false);
        return;
      }
      
      if (paymentData.cvv.length < 3) {
        alert("CVV inválido");
        setLoading(false);
        return;
      }
      
      // Obtener el total con comisión de Stripe
      const totals = calculateTotal();
      
      // Crear Payment Intent en Stripe
      const paymentIntentRes = await api.post("/stripe/create-payment-intent", {
        amount: totals.baseTotal, // El monto base sin la comisión
        currency: 'usd', // o 'dop' para pesos dominicanos
        description: `Factura para ${customers.find(c => c.id === parseInt(form.customer_id))?.name || 'cliente'}`,
        metadata: {
          customer_id: form.customer_id,
          items: JSON.stringify(form.items)
        }
      });
      
      const { clientSecret, breakdown } = paymentIntentRes.data;
      
      // NOTA: En producción real, aquí usarías Stripe Elements para confirmar el pago
      // Por ahora, simulamos que el pago fue exitoso
      console.log("Payment Intent creado:", clientSecret);
      console.log("Breakdown:", breakdown);
      
      // Simular procesamiento (en producción, esto sería stripe.confirmCardPayment)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear factura con estado "paid" si el pago fue exitoso
      const invoiceData = {
        ...form,
        total: parseFloat(breakdown.total), // Total con comisión incluida
        status: 'paid',
        paidAt: new Date().toISOString()
      };
      
      await api.post("/invoices", invoiceData);
      
      alert(`¡Pago procesado exitosamente!
      
Desglose del pago:
Subtotal: $${breakdown.subtotal}
Comisión Stripe (2.9% + $0.30): $${breakdown.stripeFee}
Total cobrado: $${breakdown.total}

La factura se ha marcado como pagada.`);
      
      // Limpiar formularios
      setForm({
        customer_id: "",
        items: [{ product_id: "", quantity: 1, price: 0 }],
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        taxRate: 18,
        discountAmount: 0,
        notes: "",
        paymentMethod: "cash",
        ncfType: "01",
        retentionApplies: false,
        itbisRetentionPercentage: "",
        isrRetentionPercentage: ""
      });
      setPaymentData({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
        amount: 0
      });
      
      setShowPaymentModal(false);
      setView("list"); // Ir a ver todas las facturas
      loadInvoices();
    } catch (err) {
      console.error("Error al procesar pago:", err);
      alert(`Error al procesar el pago: ${err.response?.data?.msg || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (id) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      setSelectedInvoice(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error al cargar detalle de factura:", err);
    }
  };

  const handlePrintInvoice = async (invoice) => {
    try {
      // Cargar detalles completos de la factura
      const res = await api.get(`/invoices/${invoice.id}`);
      const fullInvoice = res.data;
      
      // Obtener símbolo de moneda
      const currencySymbol = getCurrencySymbol(fullInvoice.currency || 'DOP');
      
      // Calcular subtotales
      const items = fullInvoice.InvoiceItems || [];
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * ((fullInvoice.taxRate || 0) / 100);
      const discount = parseFloat(fullInvoice.discountAmount || 0);
      const total = subtotal + taxAmount - discount;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Factura ${fullInvoice.invoiceNumber}</title>
            <style>
              /* Configuración de página para impresión */
              @page {
                size: A4;
                margin: 15mm 10mm;
              }
              
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .no-print {
                  display: none;
                }
                .page-break {
                  page-break-after: always;
                }
              }
              
              /* Estilos generales */
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #333;
                background: white;
                padding: 20px;
                max-width: 210mm;
                margin: 0 auto;
              }
              
              /* Encabezado */
              .header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #4F46E5;
              }
              
              .company-info {
                flex: 1;
              }
              
              .company-name {
                font-size: 24pt;
                font-weight: bold;
                color: #4F46E5;
                margin-bottom: 5px;
              }
              
              .company-details {
                font-size: 9pt;
                color: #666;
                line-height: 1.6;
              }
              
              .invoice-title {
                text-align: right;
                flex: 1;
              }
              
              .invoice-title h1 {
                font-size: 28pt;
                color: #4F46E5;
                margin-bottom: 5px;
                font-weight: bold;
              }
              
              .invoice-number {
                font-size: 11pt;
                color: #666;
                font-weight: normal;
              }
              
              /* Información de factura y cliente */
              .info-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                gap: 20px;
              }
              
              .info-box {
                flex: 1;
                background: #F9FAFB;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #4F46E5;
              }
              
              .info-box h3 {
                font-size: 10pt;
                color: #4F46E5;
                text-transform: uppercase;
                margin-bottom: 10px;
                font-weight: 600;
                letter-spacing: 0.5px;
              }
              
              .info-box p {
                margin: 5px 0;
                font-size: 10pt;
                line-height: 1.5;
              }
              
              .info-box strong {
                color: #333;
                font-weight: 600;
              }
              
              /* Tabla de productos */
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              .items-table thead {
                background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                color: white;
              }
              
              .items-table thead th {
                padding: 12px 10px;
                text-align: left;
                font-size: 9pt;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .items-table thead th:last-child,
              .items-table thead th:nth-child(3),
              .items-table thead th:nth-child(4) {
                text-align: right;
              }
              
              .items-table tbody tr {
                border-bottom: 1px solid #E5E7EB;
              }
              
              .items-table tbody tr:hover {
                background: #F9FAFB;
              }
              
              .items-table tbody td {
                padding: 12px 10px;
                font-size: 10pt;
              }
              
              .items-table tbody td:last-child,
              .items-table tbody td:nth-child(3),
              .items-table tbody td:nth-child(4) {
                text-align: right;
              }
              
              .items-table tbody tr:last-child {
                border-bottom: 2px solid #4F46E5;
              }
              
              /* Totales */
              .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 30px;
              }
              
              .totals-box {
                width: 300px;
                border: 2px solid #E5E7EB;
                border-radius: 8px;
                overflow: hidden;
              }
              
              .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 15px;
                font-size: 10pt;
                border-bottom: 1px solid #E5E7EB;
              }
              
              .totals-row:last-child {
                border-bottom: none;
              }
              
              .totals-row.subtotal {
                background: #F9FAFB;
              }
              
              .totals-row.tax {
                background: #F9FAFB;
              }
              
              .totals-row.discount {
                background: #FEF3C7;
                color: #92400E;
              }
              
              .totals-row.total {
                background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                color: white;
                font-size: 13pt;
                font-weight: bold;
                padding: 15px;
              }
              
              /* Notas y términos */
              .notes-section {
                margin-top: 30px;
                padding: 15px;
                background: #F9FAFB;
                border-radius: 8px;
                border-left: 4px solid #10B981;
              }
              
              .notes-section h3 {
                font-size: 10pt;
                color: #10B981;
                margin-bottom: 8px;
                text-transform: uppercase;
                font-weight: 600;
              }
              
              .notes-section p {
                font-size: 9pt;
                color: #666;
                line-height: 1.6;
              }
              
              /* Footer */
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #E5E7EB;
                text-align: center;
                font-size: 8pt;
                color: #666;
              }
              
              .payment-status {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 9pt;
                font-weight: 600;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .status-paid {
                background: #D1FAE5;
                color: #065F46;
                border: 2px solid #10B981;
              }
              
              .status-pending {
                background: #FEF3C7;
                color: #92400E;
                border: 2px solid #F59E0B;
              }
              
              .status-overdue {
                background: #FEE2E2;
                color: #991B1B;
                border: 2px solid #EF4444;
              }
              
              /* Botón de impresión */
              .print-button {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 11pt;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
                transition: all 0.3s ease;
              }
              
              .print-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(79, 70, 229, 0.4);
              }
              
              .description {
                color: #666;
                font-size: 9pt;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <!-- Encabezado -->
            <div class="header">
              <div class="company-info">
                <div class="company-name">CRM Lite</div>
                <div class="company-details">
                  Sistema de Gestión Empresarial<br>
                  República Dominicana<br>
                  Tel: (809) 555-0100<br>
                  Email: info@crmlite.com
                </div>
              </div>
              <div class="invoice-title">
                <h1>FACTURA</h1>
                <div class="invoice-number">${fullInvoice.invoiceNumber}</div>
                ${fullInvoice.ncf ? `
                  <div style="margin-top:6px; font-size:11pt; font-weight:bold; letter-spacing:1px;">
                    NCF: ${fullInvoice.ncf}
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Estado de pago -->
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="payment-status status-${fullInvoice.status}">
                ${fullInvoice.status === 'paid' ? 'PAGADA' : 
                  fullInvoice.status === 'pending' ? 'PENDIENTE' : 
                  fullInvoice.status === 'overdue' ? 'VENCIDA' : 'BORRADOR'}
              </span>
            </div>
            
            <!-- Información de factura y cliente -->
            <div class="info-section">
              <div class="info-box">
                <h3>Información de Factura</h3>
                <p><strong>Fecha de Emisión:</strong> ${new Date(fullInvoice.invoiceDate).toLocaleDateString('es-DO', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                ${fullInvoice.dueDate ? `
                  <p><strong>Fecha de Vencimiento:</strong> ${new Date(fullInvoice.dueDate).toLocaleDateString('es-DO', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                ` : ''}
                <p><strong>Método de Pago:</strong> ${
                  fullInvoice.paymentMethod === 'cash' ? 'Efectivo' :
                  fullInvoice.paymentMethod === 'card' ? 'Tarjeta' :
                  fullInvoice.paymentMethod === 'transfer' ? 'Transferencia' :
                  fullInvoice.paymentMethod === 'check' ? 'Cheque' : 'Otro'
                }</p>
              </div>
              
              <div class="info-box">
                <h3>Facturar A</h3>
                <p><strong>${fullInvoice.Customer?.name || 'N/A'}</strong></p>
                ${fullInvoice.Customer?.email ? `<p>Email: ${fullInvoice.Customer.email}</p>` : ''}
                ${fullInvoice.Customer?.phone ? `<p>Tel: ${fullInvoice.Customer.phone}</p>` : ''}
                ${fullInvoice.Customer?.address ? `<p>${fullInvoice.Customer.address}</p>` : ''}
              </div>
            </div>
            
            <!-- Tabla de productos -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 10%;">#</th>
                  <th style="width: 45%;">Descripción</th>
                  <th style="width: 15%;">Cantidad</th>
                  <th style="width: 15%;">Precio Unit.</th>
                  <th style="width: 15%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>
                      <strong>${item.Product?.name || 'Producto'}</strong>
                      ${item.description ? `<br><span class="description">${item.description}</span>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>${currencySymbol} ${parseFloat(item.price).toFixed(2)}</td>
                    <td><strong>${currencySymbol} ${(item.price * item.quantity).toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Totales -->
            <div class="totals-section">
              <div class="totals-box">
                <div class="totals-row subtotal">
                  <span>Subtotal:</span>
                  <span>${currencySymbol} ${subtotal.toFixed(2)}</span>
                </div>
                <div class="totals-row tax">
                  <span>ITBIS (${fullInvoice.taxRate || 0}%):</span>
                  <span>${currencySymbol} ${taxAmount.toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                  <div class="totals-row discount">
                    <span>Descuento:</span>
                    <span>-${currencySymbol} ${discount.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="totals-row total">
                  <span>TOTAL:</span>
                  <span>${currencySymbol} ${total.toFixed(2)}</span>
                </div>
                ${fullInvoice.retentionApplies ? `
                  <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #999; font-size:9pt; color:#555;">
                    <div class="totals-row"><span>Retención ITBIS (informativa):</span><span>-${currencySymbol} ${parseFloat(fullInvoice.itbisRetentionAmount || 0).toFixed(2)}</span></div>
                    <div class="totals-row"><span>Retención ISR (informativa):</span><span>-${currencySymbol} ${parseFloat(fullInvoice.isrRetentionAmount || 0).toFixed(2)}</span></div>
                    <div class="totals-row" style="font-weight:bold;"><span>Neto a cobrar:</span><span>${currencySymbol} ${parseFloat(fullInvoice.netTotal || total).toFixed(2)}</span></div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Notas -->
            ${fullInvoice.notes ? `
              <div class="notes-section">
                <h3>📝 Notas</h3>
                <p>${fullInvoice.notes}</p>
              </div>
            ` : ''}
            
            <!-- Footer -->
            <div class="footer">
              <p>Gracias por su preferencia</p>
              <p style="margin-top: 10px;">Esta factura fue generada electrónicamente y es válida sin firma</p>
              <p style="margin-top: 5px; font-size: 7pt;">CRM Lite © ${new Date().getFullYear()} - Todos los derechos reservados</p>
            </div>
            
            <!-- Botón de impresión -->
            <button class="print-button no-print" onclick="window.print()">
              🖨️ Imprimir Factura
            </button>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (err) {
      console.error('Error al cargar factura para imprimir:', err);
      alert('Error al cargar los detalles de la factura');
    }
  };

  const handleEditInvoice = async (invoice) => {
    try {
      // Cargar los detalles completos de la factura incluyendo items
      const res = await api.get(`/invoices/${invoice.id}`);
      const fullInvoice = res.data;
      
      // Cargar la factura en el formulario
      setForm({
        customer_id: fullInvoice.customer_id,
        invoiceDate: fullInvoice.invoiceDate.split('T')[0],
        dueDate: fullInvoice.dueDate ? fullInvoice.dueDate.split('T')[0] : '',
        items: fullInvoice.InvoiceItems?.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          description: item.description || ''
        })) || [],
        taxRate: fullInvoice.taxRate || 18,
        discountAmount: fullInvoice.discountAmount || 0,
        notes: fullInvoice.notes || '',
        paymentMethod: fullInvoice.paymentMethod || 'cash',
        ncfType: fullInvoice.ncfType || '01',
        retentionApplies: fullInvoice.retentionApplies || false,
        itbisRetentionPercentage: fullInvoice.itbisRetentionPercentage || '',
        isrRetentionPercentage: fullInvoice.isrRetentionPercentage || '',
      });
      
      // Guardar el ID de la factura para actualizarla en lugar de crear una nueva
      setForm(prev => ({ ...prev, editingId: invoice.id }));
      
      // Cambiar a vista de edición
      setView('create');
    } catch (err) {
      console.error('Error al cargar factura para editar:', err);
      alert('Error al cargar la factura');
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm(`¿Estás seguro de eliminar la factura ${invoice.invoiceNumber}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/invoices/${invoice.id}`);
      alert('Factura eliminada exitosamente');
      loadInvoices(); // Recargar lista
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      alert(err.response?.data?.msg || 'Error al eliminar la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await api.put(`/invoices/${id}`, {
        status: 'paid',
        paidAt: new Date().toISOString()
      });
      
      // Preguntar si quiere imprimir la factura
      const wantsToPrint = window.confirm(
        "✅ Factura marcada como pagada exitosamente.\n\n¿Deseas imprimir la factura ahora?"
      );
      
      if (wantsToPrint) {
        // Cargar la factura actualizada y abrir impresión
        const res = await api.get(`/invoices/${id}`);
        handlePrintInvoice(res.data);
      }
      
      loadInvoices();
      setShowDetailModal(false);
    } catch (err) {
      console.error("Error al actualizar factura:", err);
      alert("Error al actualizar factura");
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product_id: "", quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    
    if (field === "product_id") {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].price = parseFloat(product.price);
      }
    }
    
    setForm({ ...form, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = form.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0));
    }, 0);
    
    const taxAmount = subtotal * (parseFloat(form.taxRate) / 100);
    const discount = parseFloat(form.discountAmount || 0);
    const baseTotal = subtotal + taxAmount - discount;
    
    // Si el método de pago es tarjeta, calcular comisión de Stripe
    let stripeFee = 0;
    let total = baseTotal;
    
    if (form.paymentMethod === 'card') {
      stripeFee = (baseTotal * 0.029) + 0.30; // 2.9% + $0.30
      total = baseTotal + stripeFee;
    }
    
    return { subtotal, taxAmount, discount, stripeFee, baseTotal, total };
  };

  const translateStatus = (status) => {
    const translations = {
      'draft': 'Borrador',
      'pending': 'Pendiente',
      'paid': 'Pagada',
      'overdue': 'Vencida',
      'cancelled': 'Cancelada'
    };
    return translations[status] || status;
  };

  const translatePaymentMethod = (method) => {
    const translations = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'check': 'Cheque',
      'other': 'Otro'
    };
    return translations[method] || method;
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.Customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totales para el modal de pago (memoizado)
  const paymentTotals = useMemo(() => {
    if (showPaymentModal) {
      try {
        return calculateTotal();
      } catch (error) {
        console.error("Error al calcular totales para modal:", error);
        return { subtotal: 0, taxAmount: 0, discount: 0, stripeFee: 0, baseTotal: 0, total: 0 };
      }
    }
    return { subtotal: 0, taxAmount: 0, discount: 0, stripeFee: 0, baseTotal: 0, total: 0 };
  }, [showPaymentModal, form.items, form.taxRate, form.discountAmount, form.paymentMethod]);

  // Dashboard View
  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Centro de Facturación</h1>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Facturas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <DocumentTextIcon className="h-12 w-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pagadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <ClockIcon className="h-12 w-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-indigo-600">${stats.totalAmount.toFixed(2)}</p>
                </div>
                <BanknotesIcon className="h-12 w-12 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => setView("create")}
              className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:bg-indigo-500 transition-all">
                  <PlusIcon className="h-10 w-10 text-indigo-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Facturar Cliente</h3>
                <p className="text-sm text-gray-600">Crear una nueva factura para un cliente</p>
              </div>
            </button>

            <button
              onClick={() => setView("search")}
              className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-500 transition-all">
                  <MagnifyingGlassIcon className="h-10 w-10 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Buscar Facturas</h3>
                <p className="text-sm text-gray-600">Buscar y filtrar facturas de clientes</p>
              </div>
            </button>

            <button
              onClick={() => setView("list")}
              className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-500 transition-all">
                  <DocumentTextIcon className="h-10 w-10 text-green-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ver Todas las Facturas</h3>
                <p className="text-sm text-gray-600">Listado completo de todas las facturas</p>
              </div>
            </button>

            <button
              onClick={() => setView("print")}
              className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-500 transition-all">
                  <PrinterIcon className="h-10 w-10 text-purple-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Imprimir Facturas</h3>
                <p className="text-sm text-gray-600">Imprimir facturas individuales o por lote</p>
              </div>
            </button>

            <button
              onClick={() => alert("Reportes en desarrollo")}
              className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200 hover:border-orange-500 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-4 group-hover:bg-orange-500 transition-all">
                  <ChartBarIcon className="h-10 w-10 text-orange-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Reportes de Facturación</h3>
                <p className="text-sm text-gray-600">Análisis y reportes de facturación</p>
              </div>
            </button>

            <button
              onClick={() => setView("pending")}
              className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200 hover:border-yellow-500 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-yellow-100 p-4 rounded-full mb-4 group-hover:bg-yellow-500 transition-all">
                  <ClockIcon className="h-10 w-10 text-yellow-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Facturas Pendientes por Pago</h3>
                <p className="text-sm text-gray-600">Ver facturas que están esperando el pago del cliente</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Invoice View
  if (view === "create") {
    const totals = calculateTotal();
    
    return (
      <>
        <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {form.editingId ? "Editar Factura" : "Crear Nueva Factura"}
            </h1>
            <button
              onClick={() => {
                setView("dashboard");
                setForm({
                  customer_id: "",
                  items: [{ product_id: "", quantity: 1, price: 0 }],
                  invoiceDate: new Date().toISOString().split('T')[0],
                  dueDate: "",
                  taxRate: 18,
                  discountAmount: 0,
                  notes: "",
                  paymentMethod: "cash",
                  ncfType: "01",
                  retentionApplies: false,
                  itbisRetentionPercentage: "",
                  isrRetentionPercentage: "",
                  editingId: null
                });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Volver al Dashboard
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleCreateInvoice}>
              {/* Cliente */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cliente *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCreateCustomerModal(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Crear Cliente Nuevo
                  </button>
                </div>
                <select
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Factura *
                  </label>
                  <input
                    type="date"
                    value={form.invoiceDate}
                    onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Productos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Productos *
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Producto
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, "product_id", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Seleccionar producto</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${parseFloat(product.price).toFixed(2)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        min="1"
                        required
                      />

                      <input
                        type="number"
                        placeholder="Precio"
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        step="0.01"
                        min="0"
                        required
                      />

                      <div className="w-32 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-right">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>

                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Impuestos y Descuentos */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de Impuesto (%)
                  </label>
                  <input
                    type="number"
                    value={form.taxRate}
                    onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descuento ($)
                  </label>
                  <input
                    type="number"
                    value={form.discountAmount}
                    onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Tipo de Comprobante Fiscal (NCF) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Comprobante (NCF)
                  </label>
                  <select
                    value={form.ncfType}
                    onChange={(e) => setForm({ ...form, ncfType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="01">01 - Consumidor Final</option>
                    <option value="02">02 - Crédito Fiscal</option>
                    <option value="14">14 - Régimen Especial</option>
                    <option value="15">15 - Gubernamental</option>
                    <option value="16">16 - Exportaciones</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.retentionApplies}
                      onChange={(e) => setForm({ ...form, retentionApplies: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    El cliente me retendrá ITBIS/ISR al pagar (informativo)
                  </label>
                </div>
              </div>

              {form.retentionApplies && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      % ITBIS a retener
                    </label>
                    <input
                      type="number"
                      value={form.itbisRetentionPercentage}
                      onChange={(e) => setForm({ ...form, itbisRetentionPercentage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      step="0.01"
                      min="0"
                      placeholder="ej. 30 ó 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      % ISR a retener
                    </label>
                    <input
                      type="number"
                      value={form.isrRetentionPercentage}
                      onChange={(e) => setForm({ ...form, isrRetentionPercentage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      step="0.01"
                      min="0"
                      placeholder="ej. 10"
                    />
                  </div>
                </div>
              )}

              {/* Método de Pago */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="check">Cheque</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Moneda */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="DOP">RD$ - Pesos Dominicanos</option>
                  <option value="USD">US$ - Dólares Americanos</option>
                </select>
              </div>

              {/* Notas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Notas adicionales..."
                />
              </div>

              {/* Totales */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{getCurrencySymbol(form.currency)} {totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuesto ({form.taxRate}%):</span>
                    <span className="font-medium">{getCurrencySymbol(form.currency)} {totals.taxAmount.toFixed(2)}</span>
                  </div>
                  {form.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuento:</span>
                      <span className="font-medium text-red-600">-{getCurrencySymbol(form.currency)} {parseFloat(form.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {form.paymentMethod === 'card' && (
                    <>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{getCurrencySymbol(form.currency)} {totals.baseTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Comisión Stripe (2.9% + $0.30):</span>
                        <span className="font-medium text-orange-600">+{getCurrencySymbol(form.currency)} {totals.stripeFee.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total {form.paymentMethod === 'card' ? 'a Cobrar' : ''}:</span>
                    <span className="font-bold text-xl text-indigo-600">{getCurrencySymbol(form.currency)} {totals.total.toFixed(2)}</span>
                  </div>
                  {form.paymentMethod === 'card' && (
                    <div className="text-xs text-gray-500 italic">
                      * La comisión de procesamiento de Stripe se añade al total
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 font-medium"
                >
                  {loading 
                    ? (form.editingId ? "Actualizando..." : "Creando...") 
                    : (form.editingId ? "Actualizar Factura" : "Crear Factura")
                  }
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("dashboard");
                    setForm({
                      customer_id: "",
                      items: [{ product_id: "", quantity: 1, price: 0 }],
                      invoiceDate: new Date().toISOString().split('T')[0],
                      dueDate: "",
                      taxRate: 18,
                      discountAmount: 0,
                      notes: "",
                      paymentMethod: "cash",
                      ncfType: "01",
                      retentionApplies: false,
                      itbisRetentionPercentage: "",
                      isrRetentionPercentage: "",
                      editingId: null
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Crear Cliente - Siempre disponible */}
      {showCreateCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlusIcon className="h-8 w-8 text-indigo-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Cliente</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateCustomerModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    {loading ? "Creando..." : "Crear Cliente"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateCustomerModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Pago con Tarjeta - Siempre disponible */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]" onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log("Click en el fondo del modal de pago");
            }
          }}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCardIcon className="h-8 w-8 text-indigo-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Procesar Pago</h2>
                  </div>
                  <button
                    onClick={() => {
                      console.log("Cerrando modal de pago");
                      setShowPaymentModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
                <div className="bg-indigo-50 p-4 rounded-md mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal de la factura:</span>
                      <span className="font-medium">${paymentTotals.baseTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Comisión Stripe (2.9% + $0.30):</span>
                      <span className="font-medium text-orange-600">+${paymentTotals.stripeFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-indigo-200 pt-2 mt-2">
                      <p className="text-sm text-gray-600">Total a cobrar al cliente:</p>
                      <p className="text-3xl font-bold text-indigo-600">${paymentTotals.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    * La comisión de procesamiento se añade al total
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Tarjeta *
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setPaymentData({ ...paymentData, cardNumber: value });
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">16 dígitos</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Titular *
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                    placeholder="Como aparece en la tarjeta"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Expiración *
                    </label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setPaymentData({ ...paymentData, expiryDate: value });
                      }}
                      placeholder="MM/AA"
                      maxLength="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPaymentData({ ...paymentData, cvv: value });
                      }}
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium flex items-center justify-center"
                  >
                    {loading ? (
                      "Procesando..."
                    ) : (
                      <>
                        <CreditCardIcon className="h-5 w-5 mr-2" />
                        Procesar Pago ${paymentTotals.total.toFixed(2)}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Search/List View (combinado para búsqueda y listado)
  if (view === "search" || view === "list" || view === "pending" || view === "print") {
    const displayInvoices = view === "pending" 
      ? invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
      : view === "print"
      ? invoices.filter(inv => inv.status === 'paid')
      : filteredInvoices;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {view === "pending" ? "Facturas Pendientes por Pago" : 
               view === "print" ? "Facturas Pagadas para Imprimir" :
               view === "search" ? "Buscar Facturas" : "Todas las Facturas"}
            </h1>
            <button
              onClick={() => setView("dashboard")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Volver al Dashboard
            </button>
          </div>

          {/* Mensaje informativo para vista de impresión */}
          {view === "print" && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <PrinterIcon className="h-6 w-6 text-purple-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-purple-900 mb-1">
                    Facturas Listas para Imprimir
                  </h3>
                  <p className="text-sm text-purple-700">
                    Esta vista muestra todas las facturas que han sido pagadas y están disponibles para imprimir o reimprimir. 
                    Haz clic en el botón de impresora para generar el documento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Barra de búsqueda */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número de factura o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Tabla de facturas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No se encontraron facturas
                      </td>
                    </tr>
                  ) : (
                    displayInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {invoice.Customer?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            ${parseFloat(invoice.total).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {translateStatus(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewInvoice(invoice.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Ver detalles"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {view === "pending" && (
                              <>
                                <button
                                  onClick={() => handleEditInvoice(invoice)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar factura"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteInvoice(invoice)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Eliminar factura"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            {invoice.status === 'paid' && (
                              <button
                                onClick={() => handlePrintInvoice(invoice)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Imprimir factura"
                              >
                                <PrinterIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de Detalle */}
        {showDetailModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedInvoice.invoiceNumber}
                    </h2>
                    {selectedInvoice.ncf && (
                      <p className="text-sm font-mono text-indigo-700 font-semibold mt-1">NCF: {selectedInvoice.ncf}</p>
                    )}
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(selectedInvoice.status)}`}>
                      {translateStatus(selectedInvoice.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Información del Cliente */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p><span className="font-medium">Nombre:</span> {selectedInvoice.Customer?.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedInvoice.Customer?.email}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedInvoice.Customer?.phone}</p>
                  </div>
                </div>

                {/* Detalles de la Factura */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles de la Factura</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p><span className="font-medium">Fecha de Emisión:</span> {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                    {selectedInvoice.dueDate && (
                      <p><span className="font-medium">Fecha de Vencimiento:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    )}
                    <p><span className="font-medium">Método de Pago:</span> {translatePaymentMethod(selectedInvoice.paymentMethod)}</p>
                    {selectedInvoice.paidAt && (
                      <p><span className="font-medium">Pagada el:</span> {new Date(selectedInvoice.paidAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.InvoiceItems?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{item.Product?.name}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">${parseFloat(item.price).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">${parseFloat(item.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totales */}
                <div>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impuesto ({selectedInvoice.taxRate}%):</span>
                      <span className="font-medium">${parseFloat(selectedInvoice.taxAmount).toFixed(2)}</span>
                    </div>
                    {selectedInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Descuento:</span>
                        <span className="font-medium">-${parseFloat(selectedInvoice.discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-indigo-600">${parseFloat(selectedInvoice.total).toFixed(2)}</span>
                    </div>
                    {selectedInvoice.retentionApplies && (
                      <div className="border-t pt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Retención ITBIS (informativa):</span>
                          <span>-${parseFloat(selectedInvoice.itbisRetentionAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retención ISR (informativa):</span>
                          <span>-${parseFloat(selectedInvoice.isrRetentionAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Neto a cobrar:</span>
                          <span>${parseFloat(selectedInvoice.netTotal || selectedInvoice.total).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notas de Crédito/Débito emitidas */}
                {selectedInvoice.ncf && creditDebitNotes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas de Crédito/Débito</h3>
                    <div className="bg-gray-50 p-4 rounded-md space-y-2">
                      {creditDebitNotes.map((note) => (
                        <div key={note.id} className="flex justify-between text-sm border-b border-gray-200 pb-2 last:border-0">
                          <span>
                            <span className="font-mono font-medium">{note.ncf}</span>{" "}
                            ({note.noteType === 'credit_note' ? 'Crédito' : 'Débito'}) - {note.reason}
                          </span>
                          <span className="font-medium">${parseFloat(note.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas */}
                {selectedInvoice.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                    className="flex-1 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                  >
                    Marcar como Pagada
                  </button>
                )}
                <button
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                  className="flex-1 bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                >
                  Imprimir
                </button>
                {selectedInvoice.ncf && selectedInvoice.status !== 'credited' && (
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="flex-1 bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
                  >
                    Nota de Crédito/Débito
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Nota de Crédito/Débito */}
        {showNoteModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nota sobre factura {selectedInvoice.invoiceNumber}
              </h3>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de nota</label>
                  <select
                    value={noteForm.noteType}
                    onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="credit_note">Nota de Crédito (04) - reduce/anula el saldo</option>
                    <option value="debit_note">Nota de Débito (03) - agrega un cargo adicional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={noteForm.amount}
                    onChange={(e) => setNoteForm({ ...noteForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón (obligatoria para DGII)</label>
                  <textarea
                    required
                    rows="3"
                    value={noteForm.reason}
                    onChange={(e) => setNoteForm({ ...noteForm, reason: e.target.value })}
                    placeholder="Ej. Devolución de mercancía, error en facturación, descuento posterior..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                  >
                    Emitir Nota
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
