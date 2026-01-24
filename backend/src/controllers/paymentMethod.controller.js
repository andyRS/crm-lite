const { PaymentMethod, Customer } = require("../models");

exports.getAll = async (req, res) => {
  try {
    let whereClause = { isActive: true };

    // Si no es admin, solo ver métodos de pago de sus clientes
    if (req.user.role !== 'admin') {
      const customerIds = await Customer.findAll({
        where: { user_id: req.user.id },
        attributes: ['id']
      });
      whereClause.customer_id = customerIds.map(c => c.id);
    }

    const paymentMethods = await PaymentMethod.findAll({
      where: whereClause,
      include: [{
        model: Customer,
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(paymentMethods);
  } catch (error) {
    console.error("Error getting payment methods:", error);
    res.status(500).json({ msg: "Error al obtener métodos de pago" });
  }
};

exports.create = async (req, res) => {
  try {
    const { customer_id, ...paymentData } = req.body;

    // Verificar que el cliente existe y pertenece al usuario (si no es admin)
    if (req.user.role !== 'admin') {
      const customer = await Customer.findByPk(customer_id);
      if (!customer || customer.user_id !== req.user.id) {
        return res.status(403).json({ msg: "No tienes acceso a este cliente" });
      }
    }

    // Si es el método por defecto, quitar el flag de otros métodos
    if (paymentData.isDefault) {
      await PaymentMethod.update(
        { isDefault: false },
        { where: { customer_id, isDefault: true } }
      );
    }

    const paymentMethod = await PaymentMethod.create({
      ...paymentData,
      customer_id
    });

    const paymentMethodWithCustomer = await PaymentMethod.findByPk(paymentMethod.id, {
      include: [{
        model: Customer,
        attributes: ['name', 'email']
      }]
    });

    res.status(201).json(paymentMethodWithCustomer);
  } catch (error) {
    console.error("Error creating payment method:", error);
    res.status(500).json({ msg: "Error al crear método de pago" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = await PaymentMethod.findByPk(id);

    if (!paymentMethod) {
      return res.status(404).json({ msg: "Método de pago no encontrado" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin') {
      const customer = await Customer.findByPk(paymentMethod.customer_id);
      if (!customer || customer.user_id !== req.user.id) {
        return res.status(403).json({ msg: "No tienes acceso a este método de pago" });
      }
    }

    // Si se está marcando como por defecto, quitar el flag de otros métodos
    if (req.body.isDefault) {
      await PaymentMethod.update(
        { isDefault: false },
        { where: { customer_id: paymentMethod.customer_id, isDefault: true } }
      );
    }

    await paymentMethod.update(req.body);

    const updatedPaymentMethod = await PaymentMethod.findByPk(id, {
      include: [{
        model: Customer,
        attributes: ['name', 'email']
      }]
    });

    res.json(updatedPaymentMethod);
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ msg: "Error al actualizar método de pago" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = await PaymentMethod.findByPk(id);

    if (!paymentMethod) {
      return res.status(404).json({ msg: "Método de pago no encontrado" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin') {
      const customer = await Customer.findByPk(paymentMethod.customer_id);
      if (!customer || customer.user_id !== req.user.id) {
        return res.status(403).json({ msg: "No tienes acceso a este método de pago" });
      }
    }

    // Soft delete - marcar como inactivo
    await paymentMethod.update({ isActive: false });
    res.json({ msg: "Método de pago eliminado" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ msg: "Error al eliminar método de pago" });
  }
};