const cron = require('node-cron');
const { Product, Quote, User, Notification } = require('../models');
const { createNotification } = require('../controllers/notification.controller');
const { sendEmail, emailTemplates } = require('./email.service');

// Verificar stock bajo cada hora
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔍 Verificando stock bajo...');

    const lowStockProducts = await Product.findAll({
      where: {
        active: true,
        stock: {
          [require('sequelize').Op.lte]: require('sequelize').col('minStock')
        }
      }
    });

    if (lowStockProducts.length > 0) {
      // Obtener administradores para notificar
      const admins = await User.findAll({ where: { role: 'admin' } });

      for (const product of lowStockProducts) {
        for (const admin of admins) {
          // Crear notificación en el sistema
          await createNotification(
            admin.id,
            'Producto con Stock Bajo',
            `El producto "${product.name}" tiene ${product.stock} unidades (mínimo: ${product.minStock})`,
            'warning',
            product.id,
            'product'
          );

          // Enviar email si está configurado
          if (process.env.EMAIL_USER && admin.email) {
            await sendEmail(
              admin.email,
              'Alerta: Producto con Stock Bajo',
              emailTemplates.lowStockAlert(product.name, product.stock)
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error en verificación de stock:', error);
  }
});

// Verificar cotizaciones expiradas diariamente a las 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('📅 Verificando cotizaciones expiradas...');

    const expiredQuotes = await Quote.findAll({
      where: {
        status: 'sent',
        validUntil: {
          [require('sequelize').Op.lt]: new Date()
        }
      },
      include: [{ model: User }]
    });

    for (const quote of expiredQuotes) {
      // Actualizar estado a expirado
      await quote.update({ status: 'expired' });

      // Notificar al usuario que creó la cotización
      await createNotification(
        quote.userId,
        'Cotización Expirada',
        `La cotización ${quote.quoteNumber} ha expirado`,
        'warning',
        quote.id,
        'quote'
      );

      // Enviar email si está configurado
      if (process.env.EMAIL_USER && quote.User.email) {
        await sendEmail(
          quote.User.email,
          'Cotización Expirada',
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Cotización Expirada</h2>
            <p>La cotización <strong>${quote.quoteNumber}</strong> ha expirado.</p>
            <p>Fecha de expiración: ${quote.validUntil.toLocaleDateString()}</p>
            <br>
            <p>Saludos,<br>CRM-Lite ERP</p>
          </div>`
        );
      }
    }
  } catch (error) {
    console.error('Error verificando cotizaciones expiradas:', error);
  }
});

// Generar reportes semanales los lunes a las 8 AM
cron.schedule('0 8 * * 1', async () => {
  try {
    console.log('📊 Generando reportes semanales...');

    const admins = await User.findAll({ where: { role: 'admin' } });

    // Aquí podrías generar un reporte semanal completo
    // Por ahora solo notificamos que se generó
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'Reporte Semanal Generado',
        'El reporte semanal de ventas y métricas está disponible',
        'info'
      );
    }
  } catch (error) {
    console.error('Error generando reportes semanales:', error);
  }
});

// Recordatorio de órdenes pendientes cada día a las 10 AM
cron.schedule('0 10 * * *', async () => {
  try {
    console.log('📋 Verificando órdenes pendientes...');

    const pendingOrders = await Order.count({
      where: {
        status: 'pending',
        createdAt: {
          [require('sequelize').Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Órdenes de más de 24 horas
        }
      }
    });

    if (pendingOrders > 0) {
      const managers = await User.findAll({
        where: { role: { [require('sequelize').Op.in]: ['admin', 'manager'] } }
      });

      for (const manager of managers) {
        await createNotification(
          manager.id,
          'Órdenes Pendientes',
          `Hay ${pendingOrders} orden(es) pendiente(s) de procesamiento`,
          'warning'
        );
      }
    }
  } catch (error) {
    console.error('Error verificando órdenes pendientes:', error);
  }
});

console.log('⏰ Tareas programadas iniciadas correctamente');