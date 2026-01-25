require('dotenv').config();
const { Product } = require('../models');
const { sequelize } = require('../config/db');

const addSkuToExistingProducts = async () => {
  try {
    console.log('🔄 Iniciando asignación de códigos a productos existentes...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener todos los productos
    const allProducts = await Product.findAll({
      order: [['id', 'ASC']]
    });

    // Filtrar productos sin SKU válido
    const productsWithoutSku = allProducts.filter(p => 
      !p.sku || p.sku.trim() === '' || !p.sku.startsWith('PROD-')
    );

    if (productsWithoutSku.length === 0) {
      console.log('✅ Todos los productos ya tienen código asignado');
      process.exit(0);
    }

    console.log(`📦 Encontrados ${productsWithoutSku.length} productos sin código válido`);

    // Buscar el último número de SKU usado
    const lastProductWithSku = await Product.findOne({
      where: {
        sku: {
          [require('sequelize').Op.like]: 'PROD-%'
        }
      },
      order: [['id', 'DESC']]
    });

    let currentNumber = 1;
    if (lastProductWithSku && lastProductWithSku.sku) {
      const match = lastProductWithSku.sku.match(/PROD-(\d+)/);
      if (match) {
        currentNumber = parseInt(match[1]) + 1;
      }
    }

    // Asignar SKU a cada producto
    for (const product of productsWithoutSku) {
      const newSku = `PROD-${String(currentNumber).padStart(4, '0')}`;
      await product.update({ sku: newSku });
      console.log(`  ✅ Producto "${product.name}" → ${newSku}`);
      currentNumber++;
    }

    console.log(`\n🎉 ${productsWithoutSku.length} códigos asignados correctamente`);
    console.log(`📊 Próximo código disponible: PROD-${String(currentNumber).padStart(4, '0')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al asignar códigos:', error);
    process.exit(1);
  }
};

addSkuToExistingProducts();
