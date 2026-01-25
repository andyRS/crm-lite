const { Product, Category } = require("../models");
const { Op } = require('sequelize');

// Función para generar SKU automático
const generateSKU = async () => {
  try {
    // Buscar el último producto con SKU que siga el patrón PROD-####
    const lastProduct = await Product.findOne({
      where: {
        sku: {
          [Op.like]: 'PROD-%'
        }
      },
      order: [['id', 'DESC']]
    });

    if (lastProduct && lastProduct.sku) {
      // Extraer el número del SKU (PROD-0001 -> 0001)
      const match = lastProduct.sku.match(/PROD-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        const nextNumber = lastNumber + 1;
        return `PROD-${String(nextNumber).padStart(4, '0')}`;
      }
    }
    
    // Si no hay productos o no se pudo extraer el número, empezar desde PROD-0001
    return 'PROD-0001';
  } catch (error) {
    console.error('Error generating SKU:', error);
    return `PROD-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  }
};

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
    // Si no se proporciona SKU o está vacío, generar uno automáticamente
    if (!req.body.sku || req.body.sku.trim() === '') {
      req.body.sku = await generateSKU();
      console.log(`✨ SKU generado automáticamente: ${req.body.sku}`);
    }

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
    
    console.log("=== UPDATE PRODUCT ===");
    console.log("ID URL:", id);
    console.log("ID Body:", req.body.id);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // Verificar que el ID del body coincida con el ID de la URL
    if (req.body.id && parseInt(req.body.id) !== parseInt(id)) {
      return res.status(400).json({ 
        message: "El ID del producto no coincide con el ID de la URL",
        errors: [{ field: 'id', message: 'El ID del producto debe coincidir con el de la URL' }]
      });
    }
    
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Si el SKU está vacío, establecerlo como null para evitar problemas de validación
    if (req.body.sku === '') {
      req.body.sku = null;
    }

    // Validar category_id
    if (req.body.category_id === '' || req.body.category_id === 'null') {
      req.body.category_id = null;
    }

    console.log("Body después de procesar:", JSON.stringify(req.body, null, 2));

    await product.update(req.body);
    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['name'] }]
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Si es un error de validación de Sequelize, devolver detalles
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: "Error de validación", 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: "El SKU ya existe", 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        message: "Categoría inválida", 
        errors: [{ field: 'category_id', message: 'La categoría seleccionada no existe' }]
      });
    }
    
    res.status(500).json({ message: "Error actualizando producto", error: error.message });
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