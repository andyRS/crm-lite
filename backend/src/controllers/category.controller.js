const { Category } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ msg: "Error al obtener categorías" });
  }
};

exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ msg: "Error al crear categoría" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    await category.update(req.body);
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Error actualizando categoría" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    await Category.destroy({ where: { id } });
    res.json({ msg: "Categoría eliminada" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Error eliminando categoría" });
  }
};