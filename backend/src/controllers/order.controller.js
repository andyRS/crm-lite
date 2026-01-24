const { Order, OrderItem, Customer, Product, User } = require("../models");
const { Op } = require("sequelize");

exports.getAll = async (req, res) => {
  try {
    let whereClause = {};

    // Si no es admin, solo ver sus propios pedidos
    if (req.user.role !== 'admin') {
      whereClause.user_id = req.user.id;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { model: Customer, attributes: ['name', 'email', 'creditLimit', 'currentDebt'] },
        { model: User, attributes: ['name'] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'price', 'sku'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ msg: "Error al obtener pedidos" });
  }
};

exports.create = async (req, res) => {
  const transaction = await require("../models").sequelize.transaction();

  try {
    const { customer_id, items, notes, shippingAddress, shippingMethod, shippingCost, priority, source } = req.body;

    // Verificar que el cliente existe
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && customer.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ msg: "No tienes acceso a este cliente" });
    }

    // Verificar límite de crédito si el cliente tiene uno establecido
    if (customer.creditLimit > 0) {
      // Calcular total preliminar para verificar límite
      let preliminaryTotal = 0;
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          await transaction.rollback();
          return res.status(404).json({ msg: `Producto ${item.product_id} no encontrado` });
        }
        if (!product.active) {
          await transaction.rollback();
          return res.status(400).json({ msg: `Producto ${product.name} no está disponible` });
        }
        preliminaryTotal += product.price * item.quantity;
      }

      const newDebt = customer.currentDebt + preliminaryTotal;
      if (newDebt > customer.creditLimit) {
        await transaction.rollback();
        return res.status(400).json({
          msg: `La orden excedería el límite de crédito del cliente. Límite: $${customer.creditLimit}, Deuda actual: $${customer.currentDebt}, Total orden: $${preliminaryTotal}`
        });
      }
    }

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}`;

    // Calcular totales
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);

      // Verificar stock
      if (product.trackInventory) {
        if (product.stock < item.quantity && !product.allowBackorders) {
          await transaction.rollback();
          return res.status(400).json({ msg: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` });
        }
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      if (product.taxable) {
        taxAmount += itemSubtotal * (product.taxRate / 100);
      }
    }

    const discountAmount = 0; // Por ahora sin descuentos globales
    const total = subtotal + taxAmount + (shippingCost || 0) - discountAmount;

    // Crear orden
    const order = await Order.create({
      orderNumber,
      customer_id,
      user_id: req.user.id,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      notes,
      shippingAddress,
      shippingMethod,
      shippingCost: shippingCost || 0,
      priority: priority || 'normal',
      source: source || 'web'
    }, { transaction });

    // Crear items y actualizar stock
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      const itemTotal = product.price * item.quantity;
      const itemTax = product.taxable ? itemTotal * (product.taxRate / 100) : 0;

      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
        taxAmount: itemTax,
        discount: item.discount || 0,
        total: itemTotal + itemTax - (item.discount || 0)
      }, { transaction });

      // Reducir stock si se trackea inventario
      if (product.trackInventory) {
        await product.update({
          stock: product.stock - item.quantity
        }, { transaction });
      }
    }

    // Actualizar deuda del cliente
    if (customer.creditLimit > 0) {
      await customer.update({
        currentDebt: customer.currentDebt + total
      }, { transaction });
    }

    await transaction.commit();

    const orderWithDetails = await Order.findByPk(order.id, {
      include: [
        { model: Customer, attributes: ['name', 'email', 'creditLimit', 'currentDebt'] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'price', 'sku'] }]
        }
      ]
    });

    // Crear notificación para el usuario que creó la orden
    const { createNotification } = require("./notification.controller");
    await createNotification(
      req.user.id,
      'Nueva Orden Creada',
      `Orden ${orderNumber} creada para ${customer.name} por $${total}`,
      'success',
      order.id,
      'order'
    );

    // Notificar a administradores sobre nueva orden
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      if (admin.id !== req.user.id) { // No notificar al mismo usuario
        await createNotification(
          admin.id,
          'Nueva Orden en el Sistema',
          `Nueva orden ${orderNumber} creada por ${req.user.name}`,
          'info',
          order.id,
          'order'
        );
      }
    }

    // Enviar notificación en tiempo real vía WebSocket
    if (global.io) {
      global.io.to(`user_${req.user.id}`).emit('notification', {
        type: 'order_created',
        title: 'Nueva Orden Creada',
        message: `Orden ${orderNumber} creada exitosamente`,
        orderId: order.id
      });
    }

    res.status(201).json(orderWithDetails);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ msg: "Error al crear pedido" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryDate, notes } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ msg: "No tienes permisos para editar este pedido" });
    }

    await order.update({ status, deliveryDate, notes });

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Customer, attributes: ['name', 'email'] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error actualizando pedido" });
  }
};

exports.remove = async (req, res) => {
  const transaction = await require("../models").sequelize.transaction();

  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: Customer },
        { model: OrderItem, include: [Product] }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ msg: "No tienes permisos para eliminar este pedido" });
    }

    // Solo permitir eliminar pedidos pendientes
    if (order.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ msg: "Solo se pueden eliminar pedidos pendientes" });
    }

    // Devolver stock
    for (const item of order.OrderItems) {
      if (item.Product.trackInventory) {
        await item.Product.update({
          stock: item.Product.stock + item.quantity
        }, { transaction });
      }
    }

    // Devolver deuda del cliente si aplica
    if (order.Customer && order.Customer.creditLimit > 0) {
      await order.Customer.update({
        currentDebt: Math.max(0, order.Customer.currentDebt - order.total)
      }, { transaction });
    }

    await Order.destroy({ where: { id }, transaction });
    await transaction.commit();

    res.json({ msg: "Pedido eliminado exitosamente" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error eliminando pedido" });
  }
};