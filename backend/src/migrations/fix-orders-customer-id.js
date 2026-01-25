require('dotenv').config();
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function fixOrdersCustomerId() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Verificar cuántas órdenes hay sin customer_id
    const ordersWithoutCustomer = await sequelize.query(
      'SELECT COUNT(*) as count FROM Orders WHERE customer_id IS NULL',
      { type: QueryTypes.SELECT }
    );
    console.log(`📊 Órdenes sin cliente: ${ordersWithoutCustomer[0].count}`);

    // Verificar si hay clientes en la base de datos
    const customers = await sequelize.query(
      'SELECT id, name, email FROM Customers LIMIT 10',
      { type: QueryTypes.SELECT }
    );
    console.log(`👥 Clientes disponibles: ${customers.length}`);
    
    if (customers.length === 0) {
      console.log('❌ No hay clientes en la base de datos. Creando cliente por defecto...');
      
      // Crear cliente por defecto
      await sequelize.query(
        `INSERT INTO Customers (name, email, phone, address, company, createdAt, updatedAt) 
         VALUES ('Cliente General', 'general@crm.local', '000-000-0000', 'Dirección no especificada', 'N/A', NOW(), NOW())`,
        { type: QueryTypes.INSERT }
      );
      
      // Obtener el ID del cliente creado
      const newCustomer = await sequelize.query(
        'SELECT id FROM Customers WHERE email = "general@crm.local"',
        { type: QueryTypes.SELECT }
      );
      
      const defaultCustomerId = newCustomer[0].id;
      console.log(`✅ Cliente por defecto creado con ID: ${defaultCustomerId}`);
      
      // Asignar todas las órdenes al cliente por defecto
      const result = await sequelize.query(
        `UPDATE Orders SET customer_id = ? WHERE customer_id IS NULL`,
        { replacements: [defaultCustomerId], type: QueryTypes.UPDATE }
      );
      
      console.log(`✅ ${result[1]} órdenes actualizadas con customer_id: ${defaultCustomerId}`);
    } else {
      console.log('✅ Hay clientes disponibles:');
      customers.forEach((c, i) => console.log(`  ${i+1}. ${c.name} (${c.email}) - ID: ${c.id}`));
      
      // Asignar todas las órdenes sin cliente al primer cliente disponible
      const defaultCustomerId = customers[0].id;
      const result = await sequelize.query(
        `UPDATE Orders SET customer_id = ? WHERE customer_id IS NULL`,
        { replacements: [defaultCustomerId], type: QueryTypes.UPDATE }
      );
      
      console.log(`✅ ${result[1]} órdenes actualizadas con customer_id: ${defaultCustomerId} (${customers[0].name})`);
    }

    // Verificar resultado final
    const finalCheck = await sequelize.query(
      'SELECT COUNT(*) as count FROM Orders WHERE customer_id IS NULL',
      { type: QueryTypes.SELECT }
    );
    console.log(`\n📊 Órdenes sin cliente después de la migración: ${finalCheck[0].count}`);

    // Mostrar algunas órdenes actualizadas
    const updatedOrders = await sequelize.query(
      'SELECT id, customer_id, status, total FROM Orders LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log('\n✅ Primeras 5 órdenes actualizadas:');
    console.log(JSON.stringify(updatedOrders, null, 2));

    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

fixOrdersCustomerId();
