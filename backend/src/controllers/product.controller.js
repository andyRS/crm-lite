const { Product, Category } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ['name'] }],
      where: { active: true }
    });
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ msg: "Error al obtener productos" });
  }
};

exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const productWithCategory = await Product.findByPk(product.id, {
      include: [{ model: Category, attributes: ['name'] }]
    });
    res.status(201).json(productWithCategory);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ msg: "Error al crear producto" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    await product.update(req.body);
    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['name'] }]
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error actualizando producto" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Soft delete - marcar como inactivo
    await product.update({ active: false });
    res.json({ msg: "Producto eliminado" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error eliminando producto" });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        active: true,
        stock: {
          [require('sequelize').Op.lte]: require('sequelize').col('minStock')
        }
      },
      include: [{ model: Category, attributes: ['name'] }]
    });
    res.json(products);
  } catch (error) {
    console.error("Error getting low stock products:", error);
    res.status(500).json({ msg: "Error al obtener productos con stock bajo" });
  }
};