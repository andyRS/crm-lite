require('dotenv').config();
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function fixOrderItems() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Ver productos disponibles
    const products = await sequelize.query(
      'SELECT id, name, sku, price FROM Products LIMIT 10',
      { type: QueryTypes.SELECT }
    );
    
    console.log('📦 Productos disponibles:');
    products.forEach(p => {
      console.log(`  ${p.id}. ${p.name} (${p.sku}) - $${p.price}`);
    });

    if (products.length === 0) {
      console.log('\n❌ No hay productos. Por favor crea productos primero.');
      process.exit(1);
    }

    console.log('\n🔧 Arreglando OrderItems...\n');

    // Orden #1 (delivered, $1225) - 1 item de $1200
    // Asignar al primer producto más caro
    const item1 = await sequelize.query(
      `UPDATE OrderItems 
       SET order_id = 1, 
           product_id = ?, 
           quantity = 1,
           price = ?,
           total = price * quantity
       WHERE id = 1`,
      { 
        replacements: [products[0].id, products[0].price],
        type: QueryTypes.UPDATE 
      }
    );
    console.log(`✅ Item 1: Asignado a Orden #1, Producto: ${products[0].name} x1`);

    // Orden #2 (confirmed, $60) - 1 item de $25 y 1 de $35
    const item2Product = products.length > 1 ? products[1] : products[0];
    await sequelize.query(
      `UPDATE OrderItems 
       SET order_id = 2, 
           product_id = ?,
           quantity = 1,
           price = 25,
           total = 25
       WHERE id = 2`,
      { 
        replacements: [item2Product.id],
        type: QueryTypes.UPDATE 
      }
    );
    console.log(`✅ Item 2: Asignado a Orden #2, Producto: ${item2Product.name} x1 ($25)`);

    const item3Product = products.length > 2 ? products[2] : products[0];
    await sequelize.query(
      `UPDATE OrderItems 
       SET order_id = 2, 
           product_id = ?,
           quantity = 1,
           price = 35,
           total = 35
       WHERE id = 3`,
      { 
        replacements: [item3Product.id],
        type: QueryTypes.UPDATE 
      }
    );
    console.log(`✅ Item 3: Asignado a Orden #2, Producto: ${item3Product.name} x1 ($35)`);

    // Orden #3 (processing, $30) - 1 item de $30
    const item5Product = products.length > 3 ? products[3] : products[0];
    await sequelize.query(
      `UPDATE OrderItems 
       SET order_id = 3, 
           product_id = ?,
           quantity = 1,
           price = 30,
           total = 30
       WHERE id = 5`,
      { 
        replacements: [item5Product.id],
        type: QueryTypes.UPDATE 
      }
    );
    console.log(`✅ Item 5: Asignado a Orden #3, Producto: ${item5Product.name} x1 ($30)`);

    // Eliminar item 4 (sobrante)
    await sequelize.query(
      `DELETE FROM OrderItems WHERE id = 4`,
      { type: QueryTypes.DELETE }
    );
    console.log('🗑️ Item 4: Eliminado (sobrante)');

    // Actualizar totales de las órdenes
    await sequelize.query(
      `UPDATE Orders o
       SET subtotal = (SELECT COALESCE(SUM(total), 0) FROM OrderItems WHERE order_id = o.id),
           total = (SELECT COALESCE(SUM(total), 0) FROM OrderItems WHERE order_id = o.id)
       WHERE id IN (1, 2, 3)`,
      { type: QueryTypes.UPDATE }
    );
    console.log('\n💰 Totales de órdenes actualizados');

    // Verificar resultado final
    const finalOrders = await sequelize.query(
      `SELECT 
        o.id, o.orderNumber, o.status, o.total,
        COUNT(oi.id) as items,
        GROUP_CONCAT(CONCAT(p.name, ' x', oi.quantity) SEPARATOR ', ') as productos
      FROM Orders o
      LEFT JOIN OrderItems oi ON o.id = oi.order_id
      LEFT JOIN Products p ON oi.product_id = p.id
      WHERE o.customer_id = 1
      GROUP BY o.id, o.orderNumber, o.status, o.total
      ORDER BY o.id`,
      { type: QueryTypes.SELECT }
    );

    console.log('\n✅ Resultado final:');
    finalOrders.forEach(order => {
      console.log(`\n  Orden #${order.id} (${order.orderNumber})`);
      console.log(`  Estado: ${order.status}`);
      console.log(`  Total: $${order.total}`);
      console.log(`  Items: ${order.items}`);
      console.log(`  Productos: ${order.productos || 'Sin productos'}`);
    });

    console.log('\n✅ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

fixOrderItems();
