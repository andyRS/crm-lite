const { Invoice, InvoiceItem, Customer, User, Product, Order } = require("../models");
const { Op } = require("sequelize");

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
    const whereClause = user.role === 'admin' ? {} : { user_id: user.id };

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
  try {
    const { customer_id, items, invoiceDate, dueDate, taxRate, discountAmount, notes, paymentMethod, order_id } = req.body;
    const { user } = req;

    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({ msg: "Cliente y productos son obligatorios" });
    }

    // Generar número de factura
    const invoiceNumber = await generateInvoiceNumber();

    // Calcular totales
    let subtotal = 0;
    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
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
      notes: notes || null
    });

    // Crear items de la factura
    for (const item of invoiceItems) {
      await InvoiceItem.create({
        invoice_id: invoice.id,
        ...item
      });
    }

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

    res.status(201).json(fullInvoice);
  } catch (err) {
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

    await invoice.update({
      status: status || invoice.status,
      paymentMethod: paymentMethod || invoice.paymentMethod,
      paidAt: status === 'paid' ? (paidAt || new Date()) : invoice.paidAt,
      dueDate: dueDate || invoice.dueDate,
      notes: notes !== undefined ? notes : invoice.notes
    });

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
  try {
    const { order_id } = req.body;
    const { user } = req;

    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    // Verificar si ya existe una factura para este pedido
    const existingInvoice = await Invoice.findOne({ where: { order_id } });
    if (existingInvoice) {
      return res.status(400).json({ msg: "Ya existe una factura para este pedido" });
    }

    // Generar número de factura
    const invoiceNumber = await generateInvoiceNumber();

    // Crear factura basada en el pedido
    const invoice = await Invoice.create({
      invoiceNumber,
      customer_id: order.customer_id,
      user_id: user.id,
      order_id: order.id,
      invoiceDate: new Date(),
      subtotal: order.total,
      taxRate: 18,
      taxAmount: 0,
      discountAmount: 0,
      total: order.total,
      status: 'pending',
      notes: `Generada desde pedido ${order.orderNumber}`
    });

    // Crear items de la factura desde los items del pedido
    for (const item of order.OrderItems) {
      await InvoiceItem.create({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      });
    }

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
    console.error("Error al crear factura desde pedido:", err);
    res.status(500).json({ msg: "Error al crear factura desde pedido" });
  }
};
