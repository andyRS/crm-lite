const { Quote, QuoteItem, Customer, Product, User, Notification } = require("../models");
const { createNotification } = require("./notification.controller");
const companyConfig = require("../config/company");

exports.getCompanyInfo = async (req, res) => {
  try {
    res.json(companyConfig);
  } catch (error) {
    console.error("Error getting company info:", error);
    res.status(500).json({ msg: "Error al obtener información de la empresa" });
  }
};

exports.getAll = async (req, res) => {
  try {
    let whereClause = {};

    // Si no es admin, solo ver sus propias cotizaciones
    if (req.user.role !== 'admin') {
      whereClause.userId = req.user.id;
    }

    const quotes = await Quote.findAll({
      where: whereClause,
      include: [
        { model: Customer, attributes: ['name', 'email'], required: false },
        { model: User, attributes: ['name'] },
        {
          model: QuoteItem,
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(quotes);
  } catch (error) {
    console.error("Error getting quotes:", error);
    res.status(500).json({ msg: "Error al obtener cotizaciones" });
  }
};

exports.create = async (req, res) => {
  try {
    const { customerId, items, validUntil, notes, discount = 0, clientName, clientEmail, clientPhone, clientCompany } = req.body;

    // Validar que al menos haya un cliente (registrado o datos del cliente nuevo)
    if (!customerId && !clientName) {
      return res.status(400).json({ msg: "Debes seleccionar un cliente registrado o proporcionar datos del cliente" });
    }

    // Generar número de cotización único
    const quoteNumber = `QT-${Date.now()}`;

    // Calcular total con descuento
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Producto ${item.productId} no encontrado` });
      }
      subtotal += product.price * item.quantity;
    }

    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    // Crear cotización
    const quote = await Quote.create({
      quoteNumber,
      customerId: customerId || null,
      userId: req.user.id,
      total,
      validUntil,
      notes,
      discount,
      clientName: clientName || null,
      clientEmail: clientEmail || null,
      clientPhone: clientPhone || null,
      clientCompany: clientCompany || null
    });

    // Crear items de cotización
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      await QuoteItem.create({
        quoteId: quote.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        discount: item.discount || 0
      });
    }

    const quoteWithDetails = await Quote.findByPk(quote.id, {
      include: [
        { model: Customer, attributes: ['name', 'email'], required: false },
        {
          model: QuoteItem,
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });

    // Crear notificación
    const clientNameForNotification = quoteWithDetails.Customer?.name || clientName || 'Cliente';
    await createNotification(
      req.user.id,
      'Nueva Cotización Creada',
      `Cotización ${quoteNumber} creada para ${clientNameForNotification}`,
      'success',
      quote.id,
      'quote'
    );

    res.status(201).json(quoteWithDetails);
  } catch (error) {
    console.error("Error creating quote:", error);
    res.status(500).json({ msg: "Error al crear cotización" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, validUntil, notes, discount } = req.body;

    const quote = await Quote.findByPk(id);

    if (!quote) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && quote.userId !== req.user.id) {
      return res.status(403).json({ msg: "No tienes permisos para editar esta cotización" });
    }

    await quote.update({ status, validUntil, notes, discount });

    const updatedQuote = await Quote.findByPk(id, {
      include: [
        { model: Customer, attributes: ['name', 'email'], required: false },
        {
          model: QuoteItem,
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });

    res.json(updatedQuote);
  } catch (error) {
    console.error("Error updating quote:", error);
    res.status(500).json({ message: "Error actualizando cotización" });
  }
};

exports.convertToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id, {
      include: [{ model: QuoteItem, include: [Product] }]
    });

    if (!quote) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && quote.userId !== req.user.id) {
      return res.status(403).json({ msg: "No tienes permisos para convertir esta cotización" });
    }

    // Verificar stock disponible
    for (const item of quote.QuoteItems) {
      if (item.Product.stock < item.quantity) {
        return res.status(400).json({ msg: `Stock insuficiente para ${item.Product.name}` });
      }
    }

    // Generar número de orden
    const orderNumber = `ORD-${Date.now()}`;

    // Crear orden
    const { Order, OrderItem } = require("../models");
    const order = await Order.create({
      orderNumber,
      customerId: quote.customerId,
      userId: req.user.id,
      total: quote.total,
      status: 'confirmed'
    });

    // Crear items de orden y reducir stock
    for (const item of quote.QuoteItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      });

      // Reducir stock
      await item.Product.update({ stock: item.Product.stock - item.quantity });
    }

    // Actualizar cotización como aprobada
    await quote.update({ status: 'approved' });

    // Crear notificación
    await createNotification(
      req.user.id,
      'Cotización Convertida a Orden',
      `Cotización ${quote.quoteNumber} convertida exitosamente a orden ${orderNumber}`,
      'success',
      order.id,
      'order'
    );

    res.json({ message: "Cotización convertida a orden exitosamente", orderId: order.id });
  } catch (error) {
    console.error("Error converting quote to order:", error);
    res.status(500).json({ message: "Error convirtiendo cotización a orden" });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id);

    if (!quote) {
      return res.status(404).json({ msg: "Cotización no encontrada" });
    }

    // Verificar permisos: solo admin o el usuario que creó la cotización puede eliminarla
    if (req.user.role !== 'admin' && quote.userId !== req.user.id) {
      return res.status(403).json({ msg: "No tienes permisos para eliminar esta cotización" });
    }

    // Verificar que la cotización no esté aprobada o convertida a orden
    if (quote.status === 'approved') {
      return res.status(400).json({ msg: "No se puede eliminar una cotización aprobada o convertida a orden" });
    }

    // Eliminar items de la cotización primero
    await QuoteItem.destroy({ where: { quoteId: id } });

    // Eliminar la cotización
    await quote.destroy();

    res.json({ msg: "Cotización eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting quote:", error);
    res.status(500).json({ msg: "Error al eliminar cotización" });
  }
};