require("dotenv").config();
const { User, Customer, Category, Product, Order, OrderItem, Notification, Quote, QuoteItem, PaymentMethod, Payment, PaymentTransaction } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedAdvancedData() {
  try {
    console.log('🌱 Poblando datos avanzados...');

    // Crear notificaciones de ejemplo
    const users = await User.findAll();
    for (const user of users) {
      await Notification.bulkCreate([
        {
          userId: user.id,
          title: 'Bienvenido al sistema ERP',
          message: 'Tu cuenta ha sido configurada correctamente',
          type: 'success'
        },
        {
          userId: user.id,
          title: 'Productos con stock bajo',
          message: 'Algunos productos necesitan reabastecimiento',
          type: 'warning'
        }
      ]);
    }
    console.log('✅ Notificaciones creadas');

    // Crear métodos de pago de ejemplo
    const customers = await Customer.findAll();
    const products = await Product.findAll();
    if (customers.length > 0) {
      await PaymentMethod.bulkCreate([
        {
          customer_id: customers[0].id,
          name: 'Visa terminada en 4242',
          type: 'card',
          provider: 'Visa',
          lastFour: '4242',
          expiryMonth: 12,
          expiryYear: 2026,
          isDefault: true,
          isActive: true
        },
        {
          customer_id: customers[0].id,
          name: 'PayPal',
          type: 'digital_wallet',
          provider: 'PayPal',
          isDefault: false,
          isActive: true
        },
        {
          customer_id: customers[1]?.id || customers[0].id,
          name: 'Transferencia bancaria',
          type: 'bank_transfer',
          provider: 'Banco Nacional',
          isDefault: true,
          isActive: true
        }
      ]);
      console.log('✅ Métodos de pago creados');
    }

    // Crear cotizaciones de ejemplo
    if (customers.length > 0 && products.length > 0) {
      console.log(`Creando cotizaciones para ${customers.length} clientes y ${products.length} productos`);

      // Verificar si ya existen cotizaciones
      const existingQuotes = await Quote.findAll();
      if (existingQuotes.length > 0) {
        console.log('ℹ️  Cotizaciones ya existen, omitiendo creación');
      } else {
        const quotes = await Quote.bulkCreate([
          {
            quoteNumber: 'QT-001',
            customerId: customers[0].id,
            userId: users[0].id,
            status: 'sent',
            total: 2450.00,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            notes: 'Cotización especial para cliente premium',
            discount: 0
          },
          {
            quoteNumber: 'QT-002',
            customerId: customers[1]?.id || customers[0].id,
            userId: users[0].id,
            status: 'approved',
            total: 125.00,
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            notes: 'Descuento aplicado del 10%',
            discount: 10.00
          }
        ]);
        console.log('✅ Cotizaciones creadas');

        // Crear items de cotización
        if (quotes.length > 0) {
          console.log(`Creando items para ${quotes.length} cotizaciones`);
          await QuoteItem.bulkCreate([
            {
              quoteId: quotes[0].id,
              productId: products[0].id,
              quantity: 2,
              price: parseFloat(products[0].price),
              discount: 5.00
            },
            {
              quoteId: quotes[0].id,
              productId: products[1].id,
              quantity: 1,
              price: parseFloat(products[1].price),
              discount: 0.00
            },
            {
              quoteId: quotes[1].id,
              productId: products[2]?.id || products[0].id,
              quantity: 3,
              price: parseFloat(products[2]?.price || products[0].price),
              discount: 10.00
            }
          ]);
          console.log('✅ Items de cotización creados');
        }
      }
    }

    console.log('🎉 Datos avanzados poblados exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
  }
}

seedAdvancedData();