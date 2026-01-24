const nodemailer = require('nodemailer');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para enviar email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"CRM-Lite ERP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

// Plantillas de email
const emailTemplates = {
  welcome: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">¡Bienvenido a CRM-Lite ERP!</h2>
      <p>Hola ${userName},</p>
      <p>Tu cuenta ha sido creada exitosamente en nuestro sistema ERP.</p>
      <p>Ya puedes acceder a todas las funcionalidades según tu rol asignado.</p>
      <br>
      <p>Saludos,<br>Equipo CRM-Lite</p>
    </div>
  `,

  orderCreated: (orderNumber, customerName, total) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Nueva Orden Creada</h2>
      <p>Se ha creado una nueva orden en el sistema:</p>
      <ul>
        <li><strong>Número de Orden:</strong> ${orderNumber}</li>
        <li><strong>Cliente:</strong> ${customerName}</li>
        <li><strong>Total:</strong> $${total}</li>
      </ul>
      <br>
      <p>Saludos,<br>CRM-Lite ERP</p>
    </div>
  `,

  lowStockAlert: (productName, currentStock) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⚠️ Alerta de Stock Bajo</h2>
      <p>El producto <strong>${productName}</strong> tiene stock bajo.</p>
      <p><strong>Stock actual:</strong> ${currentStock} unidades</p>
      <p>Por favor, considera reabastecer este producto.</p>
      <br>
      <p>Saludos,<br>Sistema CRM-Lite</p>
    </div>
  `,

  quoteCreated: (quoteNumber, customerName, validUntil) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">Nueva Cotización Generada</h2>
      <p>Se ha creado una nueva cotización:</p>
      <ul>
        <li><strong>Número de Cotización:</strong> ${quoteNumber}</li>
        <li><strong>Cliente:</strong> ${customerName}</li>
        <li><strong>Válida hasta:</strong> ${new Date(validUntil).toLocaleDateString()}</li>
      </ul>
      <br>
      <p>Saludos,<br>CRM-Lite ERP</p>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates };