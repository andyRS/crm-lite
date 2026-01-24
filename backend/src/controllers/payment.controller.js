const { Payment, PaymentMethod, Order, Customer, User, PaymentTransaction } = require("../models");
const { Op } = require("sequelize");
const paymentService = require("../services/payment.service");

exports.getAll = async (req, res) => {
  try {
    let whereClause = {};

    // Si no es admin, solo ver pagos relacionados con sus órdenes/clientes
    if (req.user.role !== 'admin') {
      const customerIds = await Customer.findAll({
        where: { user_id: req.user.id },
        attributes: ['id']
      });

      const orderIds = await Order.findAll({
        where: { customer_id: customerIds.map(c => c.id) },
        attributes: ['id']
      });

      whereClause.order_id = orderIds.map(o => o.id);
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [
        {
          model: Order,
          attributes: ['orderNumber', 'total', 'status'],
          include: [{ model: Customer, attributes: ['name', 'email'] }]
        },
        {
          model: PaymentMethod,
          attributes: ['name', 'type', 'lastFour']
        },
        {
          model: User,
          as: 'processedBy',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error("Error getting payments:", error);
    res.status(500).json({ msg: "Error al obtener pagos" });
  }
};

exports.create = async (req, res) => {
  const transaction = await require("../models").sequelize.transaction();

  try {
    const { order_id, paymentMethod_id, amount, notes } = req.body;

    // Verificar que la orden existe
    const order = await Order.findByPk(order_id, {
      include: [{ model: Customer, attributes: ['id', 'user_id', 'creditLimit', 'currentDebt'] }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ msg: "No tienes acceso a esta orden" });
    }

    // Verificar que el método de pago existe y pertenece al cliente
    const paymentMethod = await PaymentMethod.findByPk(paymentMethod_id, { transaction });
    if (!paymentMethod || paymentMethod.customer_id !== order.customer_id || !paymentMethod.isActive) {
      await transaction.rollback();
      return res.status(400).json({ msg: "Método de pago inválido" });
    }

    // Validar método de pago
    const validation = paymentService.validatePaymentMethod(paymentMethod);
    if (!validation.isValid) {
      await transaction.rollback();
      return res.status(400).json({
        msg: "Método de pago inválido",
        errors: validation.errors
      });
    }

    // Verificar límites de crédito si es necesario
    if (paymentMethod.type === 'credit' && order.Customer) {
      const newDebt = order.Customer.currentDebt + amount;
      if (newDebt > order.Customer.creditLimit) {
        await transaction.rollback();
        return res.status(400).json({
          msg: `El pago excedería el límite de crédito. Límite: ${order.Customer.creditLimit}, Deuda actual: ${order.Customer.currentDebt}`
        });
      }
    }

    // Procesar pago con el gateway
    const paymentData = {
      amount,
      currency: order.currency,
      paymentMethod: paymentMethod,
      order: order,
      customer: order.Customer
    };

    const paymentResult = await paymentService.processPayment(paymentData, paymentMethod.type);

    // Generar número de pago único
    const paymentNumber = `PAY-${Date.now()}`;

    // Crear el pago
    const payment = await Payment.create({
      paymentNumber,
      order_id,
      paymentMethod_id,
      amount,
      status: paymentResult.success ? 'completed' : 'failed',
      processedBy_id: req.user.id,
      notes,
      gatewayResponse: paymentResult.gatewayResponse,
      processedAt: paymentResult.processedAt
    }, { transaction });

    // Crear transacción
    const transactionId = `TXN-${Date.now()}`;
    await PaymentTransaction.create({
      transactionId,
      payment_id: payment.id,
      amount,
      type: 'charge',
      status: paymentResult.success ? 'success' : 'failed',
      gateway: paymentResult.gateway,
      gatewayTransactionId: paymentResult.transactionId,
      gatewayResponse: paymentResult.gatewayResponse,
      processedAt: paymentResult.processedAt,
      errorCode: paymentResult.errorCode,
      errorMessage: paymentResult.errorMessage
    }, { transaction });

    if (paymentResult.success) {
      // Actualizar estado de pago de la orden
      const existingPayments = await Payment.sum('amount', {
        where: { order_id, status: 'completed' },
        transaction
      });

      const totalPaid = (existingPayments || 0) + amount;
      let paymentStatus = 'partial';

      if (totalPaid >= order.total) {
        paymentStatus = totalPaid > order.total ? 'overpaid' : 'paid';
      }

      await order.update({ paymentStatus }, { transaction });

      // Actualizar deuda del cliente si aplica
      if (paymentMethod.type === 'credit' && order.Customer) {
        await order.Customer.update({
          currentDebt: order.Customer.currentDebt + amount
        }, { transaction });
      }
    }

    await transaction.commit();

    const paymentWithDetails = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Order,
          attributes: ['orderNumber', 'total', 'status', 'paymentStatus'],
          include: [{ model: Customer, attributes: ['name', 'email'] }]
        },
        {
          model: PaymentMethod,
          attributes: ['name', 'type', 'lastFour']
        },
        {
          model: User,
          as: 'processedBy',
          attributes: ['name']
        }
      ]
    });

    // Crear notificación
    const { createNotification } = require("./notification.controller");
    const statusMessage = paymentResult.success ? 'procesado' : 'fallido';

    await createNotification(
      order.user_id,
      `Pago ${statusMessage}`,
      `Pago de $${amount} ${statusMessage} para la orden ${order.orderNumber}`,
      paymentResult.success ? 'success' : 'error',
      order.id,
      'order'
    );

    res.status(paymentResult.success ? 201 : 400).json({
      ...paymentWithDetails.toJSON(),
      gatewayResult: paymentResult
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating payment:", error);
    res.status(500).json({ msg: "Error al procesar pago" });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findByPk(id, {
      include: [
        { model: Order },
        { model: PaymentMethod },
        { model: User, as: 'processedBy' }
      ]
    });

    if (!payment) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && payment.Order.user_id !== req.user.id) {
      return res.status(403).json({ msg: "No tienes acceso a este pago" });
    }

    // Verificar que el pago esté completado
    if (payment.status !== 'completed') {
      return res.status(400).json({ msg: "Solo se pueden reembolsar pagos completados" });
    }

    // Verificar monto de reembolso
    if (amount > payment.amount) {
      return res.status(400).json({ msg: "El monto de reembolso no puede exceder el pago original" });
    }

    // Crear transacción de reembolso
    const transactionId = `REF-${Date.now()}`;
    await PaymentTransaction.create({
      transactionId,
      payment_id: payment.id,
      amount: -amount, // Monto negativo para reembolso
      type: 'refund',
      gateway: payment.PaymentMethod.type,
      status: 'success',
      processedAt: new Date()
    });

    // Actualizar pago
    const newRefundAmount = payment.refundAmount + amount;
    const newStatus = newRefundAmount >= payment.amount ? 'refunded' : 'completed';

    await payment.update({
      refundAmount: newRefundAmount,
      refundDate: new Date(),
      refundReason: reason,
      status: newStatus
    });

    // Actualizar deuda del cliente si aplica
    if (payment.PaymentMethod.type === 'credit' && payment.Order.Customer) {
      await payment.Order.Customer.update({
        currentDebt: payment.Order.Customer.currentDebt - amount
      });
    }

    res.json({ msg: "Reembolso procesado exitosamente" });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ msg: "Error al procesar reembolso" });
  }
};