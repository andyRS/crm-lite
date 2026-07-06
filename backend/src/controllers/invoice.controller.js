const { Invoice, InvoiceItem, Customer, User, Product, Order, OrderItem } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { createNotification, notifyManagers } = require("./notification.controller");
const ncfService = require("../services/ncf.service");

// Calcula retenciones informativas (ITBIS/ISR que el cliente le retendrá a esta pyme al pagar)
const calculateRetentions = (subtotal, taxAmount, retentionApplies, itbisRetentionPercentage, isrRetentionPercentage) => {
  if (!retentionApplies) {
    return { itbisRetentionAmount: 0, isrRetentionAmount: 0 };
  }

  const itbisRetentionAmount = itbisRetentionPercentage
    ? (taxAmount * parseFloat(itbisRetentionPercentage)) / 100
    : 0;
  const isrRetentionAmount = isrRetentionPercentage
    ? (subtotal * parseFloat(isrRetentionPercentage)) / 100
    : 0;

  return { itbisRetentionAmount, isrRetentionAmount };
};

// Generar número de factura automático
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const lastInvoice = await Invoice.findOne({
    where: {
      invoiceNumber: {
        [Op.like]: `INV-${year}-%`
      }
    },
    order: [['createdAt', 'DESC']]
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Obtener todas las facturas
exports.getAll = async (req, res) => {
  try {
    const { user } = req;
    let whereClause = {};

    // Sistema de permisos por rol
    if (user.role === 'user') {
      // Users solo ven sus propias facturas
      whereClause = { user_id: user.id };
    } else if (user.role === 'manager') {
      // Managers ven todas las facturas (cuando implementemos equipos, verán solo su equipo)
      whereClause = {};
    } else if (user.role === 'admin') {
      // Admins ven todas las facturas
      whereClause = {};
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: InvoiceItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'sku', 'price']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invoices);
  } catch (err) {
    console.error("Error al obtener facturas:", err);
    res.status(500).json({ msg: "Error al obtener facturas" });
  }
};

// Obtener una factura por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const whereClause = { id };
    if (user.role !== 'admin') {
      whereClause.user_id = user.id;
    }

    const invoice = await Invoice.findOne({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'email', 'phone', 'address', 'cedula']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: InvoiceItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'sku', 'price']
            }
          ]
        },
        {
          model: Order,
          attributes: ['id', 'orderNumber']
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("Error al obtener factura:", err);
    res.status(500).json({ msg: "Error al obtener factura" });
  }
};

// Crear una factura
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      customer_id, items, invoiceDate, dueDate, taxRate, discountAmount, notes, paymentMethod, order_id,
      ncfType, retentionApplies, itbisRetentionPercentage, isrRetentionPercentage
    } = req.body;
    const { user } = req;

    if (!customer_id || !items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ msg: "Cliente y productos son obligatorios" });
    }

    const customer = await Customer.findByPk(customer_id, { transaction });
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }

    // Generar número de factura (identificador interno del sistema)
    const invoiceNumber = await generateInvoiceNumber();

    // Tipo de comprobante NCF: si el cliente tiene RNC/taxId se asume Crédito Fiscal (02),
    // si no, Consumidor Final (01). El usuario puede sobreescribirlo desde el formulario.
    const resolvedNcfType = ncfType || (customer.taxId ? "02" : "01");

    // Calcular totales
    let subtotal = 0;
    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ msg: `Producto con ID ${item.product_id} no encontrado` });
      }

      const itemTotal = parseFloat(item.quantity) * parseFloat(item.price || product.price);
      subtotal += itemTotal;

      invoiceItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price || product.price,
        total: itemTotal
      });
    }

    const taxAmount = (subtotal * parseFloat(taxRate || 18)) / 100;
    const total = subtotal + taxAmount - parseFloat(discountAmount || 0);

    const { itbisRetentionAmount, isrRetentionAmount } = calculateRetentions(
      subtotal, taxAmount, retentionApplies, itbisRetentionPercentage, isrRetentionPercentage
    );
    const netTotal = total - itbisRetentionAmount - isrRetentionAmount;

    // Generar NCF dentro de la misma transacción: si algo falla después, no queda un número "quemado"
    const { ncf, ncfSequenceId } = await ncfService.getNextNcf(resolvedNcfType, transaction);

    // Crear factura
    const invoice = await Invoice.create({
      invoiceNumber,
      customer_id,
      user_id: user.id,
      order_id: order_id || null,
      invoiceDate: invoiceDate || new Date(),
      dueDate: dueDate || null,
      subtotal,
      taxRate: taxRate || 18,
      taxAmount,
      discountAmount: discountAmount || 0,
      total,
      status: 'pending',
      paymentMethod: paymentMethod || null,
      notes: notes || null,
      fiscalType: 'ncf',
      ncfType: resolvedNcfType,
      ncf,
      ncfSequence_id: ncfSequenceId,
      retentionApplies: !!retentionApplies,
      itbisRetentionPercentage: retentionApplies ? itbisRetentionPercentage : null,
      itbisRetentionAmount,
      isrRetentionPercentage: retentionApplies ? isrRetentionPercentage : null,
      isrRetentionAmount,
      netTotal
    }, { transaction });

    // Crear items de la factura
    for (const item of invoiceItems) {
      await InvoiceItem.create({
        invoice_id: invoice.id,
        ...item
      }, { transaction });
    }

    await transaction.commit();

    // Obtener la factura completa con relaciones
    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: InvoiceItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'sku', 'price']
            }
          ]
        }
      ]
    });

    // Notificar creación de factura
    await createNotification(
      user.id,
      '📄 Factura Generada',
      `Factura ${invoiceNumber} creada por $${total.toFixed(2)}`,
      'success',
      invoice.id,
      'invoice'
    );

    // Notificar a managers si es una factura de alto valor
    if (total > 10000) {
      await notifyManagers(
        '💰 Factura de Alto Valor',
        `Nueva factura ${invoiceNumber} por $${total.toFixed(2)}`,
        'info',
        invoice.id,
        'invoice'
      );
    }

    // Alertar si la fecha de vencimiento es próxima (menos de 7 días)
    if (dueDate) {
      const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 7 && daysUntilDue > 0) {
        await createNotification(
          user.id,
          '⚠️ Factura Próxima a Vencer',
          `La factura ${invoiceNumber} vence en ${daysUntilDue} día(s)`,
          'warning',
          invoice.id,
          'invoice'
        );
      }
    }

    res.status(201).json(fullInvoice);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    if (err.name === "NcfLimitError") {
      return res.status(400).json({ msg: err.message });
    }
    console.error("Error al crear factura:", err);
    res.status(500).json({ msg: "Error al crear factura" });
  }
};

// Actualizar una factura
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, paidAt, dueDate, notes } = req.body;
    const { user } = req;

    const whereClause = { id };
    if (user.role !== 'admin') {
      whereClause.user_id = user.id;
    }

    const invoice = await Invoice.findOne({ where: whereClause });

    if (!invoice) {
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    // Un comprobante fiscal (NCF) ya emitido no puede cancelarse directamente por norma DGII;
    // el ajuste debe hacerse vía nota de crédito/débito.
    if (status === 'cancelled' && invoice.ncf) {
      return res.status(400).json({
        msg: "Esta factura ya tiene un NCF emitido y no puede cancelarse directamente. Emite una nota de crédito para anularla o ajustarla."
      });
    }

    await invoice.update({
      status: status || invoice.status,
      paymentMethod: paymentMethod || invoice.paymentMethod,
      paidAt: status === 'paid' ? (paidAt || new Date()) : invoice.paidAt,
      dueDate: dueDate || invoice.dueDate,
      notes: notes !== undefined ? notes : invoice.notes
    });

    // Notificar cambios de estado
    if (status && status !== invoice.status) {
      const statusEmojis = {
        pending: '⏳',
        paid: '✅',
        overdue: '⚠️',
        cancelled: '❌'
      };
      const statusTexts = {
        pending: 'Pendiente',
        paid: 'Pagada',
        overdue: 'Vencida',
        cancelled: 'Cancelada'
      };
      
      const emoji = statusEmojis[status] || '📄';
      
      await createNotification(
        user.id,
        `${emoji} Factura ${statusTexts[status] || status}`,
        `La factura ${invoice.invoiceNumber} ha sido marcada como ${statusTexts[status] || status}`,
        status === 'paid' ? 'success' : status === 'overdue' ? 'warning' : status === 'cancelled' ? 'error' : 'info',
        invoice.id,
        'invoice'
      );

      // Notificar a managers cuando se recibe un pago
      if (status === 'paid') {
        await notifyManagers(
          '💰 Pago Recibido',
          `La factura ${invoice.invoiceNumber} por $${invoice.total.toFixed(2)} ha sido pagada`,
          'success',
          invoice.id,
          'invoice'
        );
      }

      // Alertar a managers sobre facturas vencidas
      if (status === 'overdue') {
        await notifyManagers(
          '⚠️ Factura Vencida',
          `La factura ${invoice.invoiceNumber} por $${invoice.total.toFixed(2)} está vencida`,
          'warning',
          invoice.id,
          'invoice'
        );
      }
    }

    res.json(invoice);
  } catch (err) {
    console.error("Error al actualizar factura:", err);
    res.status(500).json({ msg: "Error al actualizar factura" });
  }
};

// Eliminar una factura
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const whereClause = { id };
    if (user.role !== 'admin') {
      whereClause.user_id = user.id;
    }

    const invoice = await Invoice.findOne({ where: whereClause });

    if (!invoice) {
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    // DGII no permite borrar un comprobante fiscal ya emitido; solo facturas en borrador (sin NCF)
    if (invoice.ncf) {
      return res.status(400).json({
        msg: "Esta factura ya tiene un NCF emitido y no puede eliminarse. Emite una nota de crédito para anularla."
      });
    }

    // Eliminar items primero
    await InvoiceItem.destroy({ where: { invoice_id: id } });

    // Eliminar factura
    await invoice.destroy();

    res.json({ msg: "Factura eliminada" });
  } catch (err) {
    console.error("Error al eliminar factura:", err);
    res.status(500).json({ msg: "Error al eliminar factura" });
  }
};

// Convertir pedido a factura
exports.createFromOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { order_id, ncfType, retentionApplies, itbisRetentionPercentage, isrRetentionPercentage } = req.body;
    const { user } = req;

    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        { model: Customer }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    // Verificar si ya existe una factura para este pedido
    const existingInvoice = await Invoice.findOne({ where: { order_id }, transaction });
    if (existingInvoice) {
      await transaction.rollback();
      return res.status(400).json({ msg: "Ya existe una factura para este pedido" });
    }

    // Generar número de factura
    const invoiceNumber = await generateInvoiceNumber();

    const resolvedNcfType = ncfType || (order.Customer && order.Customer.taxId ? "02" : "01");

    const subtotal = parseFloat(order.subtotal || order.total);
    const taxAmount = parseFloat(order.taxAmount || 0);
    const total = parseFloat(order.total);

    const { itbisRetentionAmount, isrRetentionAmount } = calculateRetentions(
      subtotal, taxAmount, retentionApplies, itbisRetentionPercentage, isrRetentionPercentage
    );
    const netTotal = total - itbisRetentionAmount - isrRetentionAmount;

    const { ncf, ncfSequenceId } = await ncfService.getNextNcf(resolvedNcfType, transaction);

    // Crear factura basada en el pedido
    const invoice = await Invoice.create({
      invoiceNumber,
      customer_id: order.customer_id,
      user_id: user.id,
      order_id: order.id,
      invoiceDate: new Date(),
      subtotal,
      taxRate: 18,
      taxAmount,
      discountAmount: 0,
      total,
      status: 'pending',
      notes: `Generada desde pedido ${order.orderNumber}`,
      fiscalType: 'ncf',
      ncfType: resolvedNcfType,
      ncf,
      ncfSequence_id: ncfSequenceId,
      retentionApplies: !!retentionApplies,
      itbisRetentionPercentage: retentionApplies ? itbisRetentionPercentage : null,
      itbisRetentionAmount,
      isrRetentionPercentage: retentionApplies ? isrRetentionPercentage : null,
      isrRetentionAmount,
      netTotal
    }, { transaction });

    // Crear items de la factura desde los items del pedido
    for (const item of order.OrderItems) {
      await InvoiceItem.create({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }, { transaction });
    }

    await transaction.commit();

    // Obtener la factura completa
    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: InvoiceItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'sku', 'price']
            }
          ]
        }
      ]
    });

    res.status(201).json(fullInvoice);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    if (err.name === "NcfLimitError") {
      return res.status(400).json({ msg: err.message });
    }
    console.error("Error al crear factura desde pedido:", err);
    res.status(500).json({ msg: "Error al crear factura desde pedido" });
  }
};
