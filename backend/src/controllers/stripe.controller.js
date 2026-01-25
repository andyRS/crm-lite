// Inicializar Stripe (se carga cuando se necesita para evitar errores si falta la clave)
let stripe;

// Verificar si estamos en modo simulación (para RD que no tiene Stripe)
const isSimulationMode = () => {
  return process.env.PAYMENT_SIMULATION_MODE === 'true';
};

const getStripe = () => {
  // En modo simulación, no necesitamos Stripe
  if (isSimulationMode()) {
    return null;
  }
  
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || apiKey.includes('no_disponible') || apiKey === 'sk_test_tu_clave_secreta') {
      throw new Error('Stripe no está configurado. Para República Dominicana, usa PAYMENT_SIMULATION_MODE=true o integra Azul/Cardnet.');
    }
    stripe = require('stripe')(apiKey);
  }
  return stripe;
};

// Calcular comisión de Stripe: 2.9% + $0.30
const calculateStripeProcessingFee = (amount) => {
  const percentageFee = amount * 0.029; // 2.9%
  const fixedFee = 0.30; // $0.30
  return percentageFee + fixedFee;
};

// Calcular total con comisión
const calculateTotalWithFee = (amount) => {
  const fee = calculateStripeProcessingFee(amount);
  return {
    subtotal: amount,
    stripeFee: fee,
    total: amount + fee
  };
};

// Crear Payment Intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', description, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        msg: "El monto debe ser mayor a 0" 
      });
    }

    // Calcular total con comisión
    const { subtotal, stripeFee, total } = calculateTotalWithFee(amount);

    // MODO SIMULACIÓN - Para desarrollo en República Dominicana
    if (isSimulationMode()) {
      console.log('🧪 MODO SIMULACIÓN ACTIVADO');
      console.log(`💳 Procesando pago simulado: $${total.toFixed(2)} (${currency.toUpperCase()})`);
      console.log(`   Base: $${subtotal.toFixed(2)} + Fee: $${stripeFee.toFixed(2)}`);
      
      // Simular respuesta exitosa
      const simulatedPaymentId = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return res.json({
        success: true,
        simulation: true,
        paymentIntentId: simulatedPaymentId,
        clientSecret: `${simulatedPaymentId}_secret`,
        status: 'succeeded',
        breakdown: {
          subtotal: subtotal.toFixed(2),
          stripeFee: stripeFee.toFixed(2),
          total: total.toFixed(2),
        },
        message: '✅ Pago procesado en modo simulación (desarrollo)',
        note: 'Para producción en RD, integra Azul (azul.com.do) o Cardnet',
      });
    }

    // MODO REAL - Con Stripe
    const stripe = getStripe();
    
    // Crear Payment Intent en Stripe
    // Stripe requiere el monto en centavos
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convertir a centavos
      currency: currency,
      description: description || 'Pago de factura CRM Lite',
      metadata: {
        ...metadata,
        originalAmount: amount,
        stripeFee: stripeFee.toFixed(2),
        totalWithFee: total.toFixed(2)
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: {
        subtotal: subtotal.toFixed(2),
        stripeFee: stripeFee.toFixed(2),
        total: total.toFixed(2)
      }
    });
  } catch (err) {
    console.error("Error al crear Payment Intent:", err);
    res.status(500).json({ 
      msg: "Error al procesar el pago", 
      error: err.message 
    });
  }
};

// Confirmar pago (webhook)
const handleWebhook = async (req, res) => {
  try {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Error en webhook de Stripe:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar eventos de Stripe
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent exitoso:', paymentIntent.id);
        // Aquí puedes actualizar tu base de datos
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent falló:', failedPayment.id);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error en webhook:', err);
    res.status(500).json({ msg: 'Error en webhook', error: err.message });
  }
};

// Obtener clave pública de Stripe
const getPublishableKey = async (req, res) => {
  if (isSimulationMode()) {
    return res.json({ 
      publishableKey: 'pk_simulation_mode',
      simulation: true,
      message: '🇩🇴 Modo simulación activo - No se requiere Stripe',
      note: 'Para producción en RD: Azul (azul.com.do) o Cardnet'
    });
  }
  
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
};

// Calcular comisión (endpoint auxiliar)
const calculateFee = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        msg: "El monto debe ser mayor a 0" 
      });
    }

    const breakdown = calculateTotalWithFee(amount);

    res.json({
      breakdown: {
        subtotal: breakdown.subtotal.toFixed(2),
        stripeFee: breakdown.stripeFee.toFixed(2),
        total: breakdown.total.toFixed(2),
        feePercentage: "2.9%",
        fixedFee: "$0.30"
      }
    });
  } catch (err) {
    console.error("Error al calcular comisión:", err);
    res.status(500).json({ 
      msg: "Error al calcular comisión", 
      error: err.message 
    });
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  getPublishableKey,
  calculateFee
};
