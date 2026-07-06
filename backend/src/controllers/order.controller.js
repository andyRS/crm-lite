const { Order, OrderItem, Customer, Product, User } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { createNotification, notifyManagers } = require("./notification.controller");

exports.getAll = async (req, res) => {
  try {
    let whereClause = {};

    // Sistema de permisos por rol
    if (req.user.role === 'user') {
      // Users solo ven sus propios pedidos
      whereClause.user_id = req.user.id;
    } else if (req.user.role === 'manager') {
      // Managers ven todos los pedidos (cuando implementemos equipos, verán solo su equipo)
      whereClause = {};
    } else if (req.user.role === 'admin') {
      // Admins ven todos los pedidos
      whereClause = {};
    }

    const orders = await Order.findAll({
      where: whereClause,
      attributes: ['id', 'orderNumber', 'status', 'paymentStatus', 'subtotal', 'taxAmount', 'discountAmount', 'total', 'notes', 'orderDate', 'deliveryDate', 'createdAt', 'updatedAt', 'customer_id', 'user_id'],
      include: [
        { model: Customer, attributes: ['name', 'email', 'creditLimit', 'currentDebt'], required: false },
        { model: User, attributes: ['name'], required: false },
        {
          model: OrderItem,
          attributes: ['id', 'quantity', 'price', 'total'],
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
  const transaction = await sequelize.transaction();

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

      // Alertar si el cliente está cerca del límite de crédito (80% o más)
      const creditUsagePercentage = (newDebt / customer.creditLimit) * 100;
      if (creditUsagePercentage >= 80) {
        await notifyManagers(
          '⚠️ Cliente Cerca del Límite de Crédito',
          `Cliente ${customer.name} está usando ${creditUsagePercentage.toFixed(0)}% de su límite de crédito ($${newDebt.toFixed(2)} de $${customer.creditLimit.toFixed(2)})`,
          'warning',
          customer.id,
          'customer'
        );
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
        { model: Customer, attributes: ['name', 'email', 'creditLimit', 'currentDebt'], required: false },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'price', 'sku'] }]
        }
      ]
    });

    // 📢 NOTIFICACIÓN: Nuevo pedido creado
    await createNotification(
      req.user.id,
      '✅ Pedido Creado',
      `Pedido ${orderNumber} creado exitosamente por $${total.toFixed(2)}`,
      'success',
      order.id,
      'order'
    );

    // Notificar a managers si el pedido es de alta prioridad o valor alto
    if (priority === 'high' || total > 1000) {
      await notifyManagers(
        '🔥 Nuevo Pedido Importante',
        `Pedido ${orderNumber} - Prioridad: ${priority}, Total: $${total.toFixed(2)}`,
        'warning',
        order.id,
        'order'
      );
    }

    // Verificar productos con stock bajo después de la orden
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (product.trackInventory && product.stock <= product.minStock) {
        await notifyManagers(
          '⚠️ Stock Bajo',
          `Producto "${product.name}" está en stock bajo: ${product.stock} unidades`,
          'warning',
          product.id,
          'product'
        );
      }
    }

    res.status(201).json(orderWithDetails);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ msg: "Error al crear orden" });
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

    const oldStatus = order.status;
    await order.update({ status, deliveryDate, notes });

    // 📢 NOTIFICACIÓN: Cambio de estado del pedido
    if (oldStatus !== status) {
      const statusMessages = {
        'pending': '⏳ Pedido en Espera',
        'confirmed': '✅ Pedido Confirmado',
        'processing': '📦 Pedido en Proceso',
        'shipped': '🚚 Pedido Enviado',
        'delivered': '✨ Pedido Entregado',
        'cancelled': '❌ Pedido Cancelado'
      };

      await createNotification(
        order.user_id,
        statusMessages[status] || 'Estado Actualizado',
        `Pedido ${order.orderNumber} cambió de ${oldStatus} a ${status}`,
        status === 'delivered' ? 'success' : status === 'cancelled' ? 'error' : 'info',
        order.id,
        'order'
      );

      // Si se marca como entregado, notificar logro
      if (status === 'delivered') {
        await createNotification(
          order.user_id,
          '🎉 Venta Completada',
          `¡Pedido ${order.orderNumber} entregado exitosamente!`,
          'success',
          order.id,
          'order'
        );
      }
    }

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Customer, attributes: ['name', 'email'], required: false },
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
  const transaction = await sequelize.transaction();

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