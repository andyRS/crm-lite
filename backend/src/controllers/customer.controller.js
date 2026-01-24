const Customer = require("../models/customer.model");

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
    const customerData = { ...req.body, user_id: req.user.id };
    const customer = await Customer.create(customerData);
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
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

    const { name, email, phone } = req.body;
    customer.name = name;
    customer.email = email;
    customer.phone = phone;

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

