const Customer = require("../models/customer.model");
const { Order, OrderItem, Product } = require("../models");

exports.getAll = async (req, res) => {
  try {
    let whereClause = {};

    // Si no es admin, solo ver sus propios clientes
    if (req.user.role !== 'admin') {
      whereClause.user_id = req.user.id;
    }

    const customers = await Customer.findAll({ where: whereClause });
    res.json(customers);
  } catch (error) {
    console.error("Error getting customers:", error);
    res.status(500).json({ msg: "Error al obtener clientes" });
  }
};

exports.create = async (req, res) => {
  try {
    // Generar clientId único automáticamente
    const lastCustomer = await Customer.findOne({
      order: [['id', 'DESC']]
    });
    
    let nextNumber = 1;
    if (lastCustomer && lastCustomer.clientId) {
      // Extraer el número del último clientId (CLI-001 -> 001)
      const match = lastCustomer.clientId.match(/CLI-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    // Formatear con ceros a la izquierda (mínimo 3 dígitos, escalable)
    const clientId = `CLI-${nextNumber.toString().padStart(3, '0')}`;
    
    const customerData = { 
      ...req.body, 
      clientId,
      user_id: req.user.id 
    };
    
    const customer = await Customer.create(customerData);
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    
    // Enviar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ msg: "Error de validación", errors });
    }
    
    res.status(500).json({ msg: "Error al crear cliente" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar permisos: solo admin o propietario puede editar
    if (req.user.role !== 'admin' && customer.user_id !== req.user.id) {
      return res.status(403).json({ msg: "No tienes permisos para editar este cliente" });
    }

    const { name, lastName, cedula, email, phone, address, billingAddress, taxId, creditLimit, paymentTerms, status, notes } = req.body;
    
    // Actualizar campos
    if (name !== undefined) customer.name = name;
    if (lastName !== undefined) customer.lastName = lastName;
    if (cedula !== undefined) customer.cedula = cedula;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (billingAddress !== undefined) customer.billingAddress = billingAddress;
    if (taxId !== undefined) customer.taxId = taxId;
    if (creditLimit !== undefined) customer.creditLimit = creditLimit;
    if (paymentTerms !== undefined) customer.paymentTerms = paymentTerms;
    if (status !== undefined) customer.status = status;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Error actualizando cliente" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar permisos: solo admin o propietario puede eliminar
    if (req.user.role !== 'admin' && customer.user_id !== req.user.id) {
      return res.status(403).json({ msg: "No tienes permisos para eliminar este cliente" });
    }

    await Customer.destroy({ where: { id } });
    res.json({ msg: "Cliente eliminado" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error eliminando cliente" });
  }
};

exports.getDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del cliente
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && customer.user_id !== req.user.id) {
      return res.status(403).json({ msg: "No tienes permisos para ver este cliente" });
    }

    // Obtener todas las órdenes del cliente con sus productos
    const orders = await Order.findAll({
      where: { customer_id: id },
      attributes: ['id', 'orderNumber', 'status', 'paymentStatus', 'total', 'createdAt', 'updatedAt'],
      include: [
        {
          model: OrderItem,
          attributes: ['id', 'quantity', 'price', 'total'],
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

    // Calcular estadísticas
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + parseFloat(o.total), 0);
    const avgOrderValue = completedOrders > 0 ? totalSpent / completedOrders : 0;

    res.json({
      customer,
      orders,
      stats: {
        totalOrders,
        completedOrders,
        totalSpent: Math.round(totalSpent * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100
      }
    });
  } catch (error) {
    console.error("Error getting customer details:", error);
    res.status(500).json({ msg: "Error al obtener detalles del cliente" });
  }
};

