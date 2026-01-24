const Customer = require("../models/customer.model");

exports.getAll = async (req, res) => {
  const customers = await Customer.findAll();
  res.json(customers);
};

exports.create = async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
};

exports.update = async (req, res) => {
  await Customer.update(req.body, {
    where: { id: req.params.id }
  });
  res.json({ msg: "Cliente actualizado" });
};

exports.remove = async (req, res) => {
  await Customer.destroy({
    where: { id: req.params.id }
  });
  res.json({ msg: "Cliente eliminado" });
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    customer.name = name;
    customer.email = email;
    customer.phone = phone;

    await customer.save();

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando cliente" });
  }
};

