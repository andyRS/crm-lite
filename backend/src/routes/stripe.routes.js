const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas públicas (necesarias para Stripe)
router.get('/config', stripeController.getPublishableKey);

// Webhook de Stripe (no requiere autenticación JWT, pero sí verificación de Stripe)
// Nota: El webhook debe estar configurado en app.js con express.raw()
router.post('/webhook', stripeController.handleWebhook);

// Rutas protegidas (requieren autenticación)
router.post('/create-payment-intent', authMiddleware, stripeController.createPaymentIntent);
router.post('/calculate-fee', authMiddleware, stripeController.calculateFee);

module.exports = router;
