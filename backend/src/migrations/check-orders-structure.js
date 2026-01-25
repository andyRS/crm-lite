require('dotenv').config();
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function checkOrders() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Ver todas las órdenes con sus relaciones
    const orders = await sequelize.query(
      `SELECT 
        o.id, o.orderNumber, o.customer_id, o.status, o.paymentStatus, o.total, o.createdAt,
        c.name as customer_name,
        COUNT(oi.id) as item_count
      FROM Orders o
      LEFT JOIN Customers c ON o.customer_id = c.id
      LEFT JOIN OrderItems oi ON o.id = oi.order_id
      GROUP BY o.id, o.orderNumber, o.customer_id, o.status, o.paymentStatus, o.total, o.createdAt, c.name
      ORDER BY o.createdAt DESC`,
      { type: QueryTypes.SELECT }
    );

    console.log('\n📦 Órdenes encontradas:', orders.length);
    console.log(JSON.stringify(orders, null, 2));

    // Ver OrderItems
    const items = await sequelize.query(
      `SELECT oi.*, p.name as product_name 
       FROM OrderItems oi 
       LEFT JOIN Products p ON oi.product_id = p.id`,
      { type: QueryTypes.SELECT }
    );

    console.log('\n📋 Items en órdenes:', items.length);
    console.log(JSON.stringify(items, null, 2));

    // Ver estructura de la tabla Orders
    const columns = await sequelize.query(
      `DESCRIBE Orders`,
      { type: QueryTypes.SELECT }
    );

    console.log('\n🏗️ Estructura de tabla Orders:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOrders();
