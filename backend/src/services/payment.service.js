// Servicio de pagos - Gateway abstraction layer
class PaymentService {
  constructor() {
    this.gateways = {};
    this.defaultGateway = process.env.DEFAULT_PAYMENT_GATEWAY || 'stripe';
  }

  // Registrar un gateway de pago
  registerGateway(name, gateway) {
    this.gateways[name] = gateway;
  }

  // Procesar un pago
  async processPayment(paymentData, gatewayName = null) {
    const gateway = gatewayName || this.defaultGateway;

    if (!this.gateways[gateway]) {
      throw new Error(`Gateway ${gateway} no está registrado`);
    }

    try {
      const result = await this.gateways[gateway].charge(paymentData);
      return {
        success: true,
        gateway,
        transactionId: result.transactionId,
        gatewayResponse: result,
        processedAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        gateway,
        error: error.message,
        errorCode: error.code,
        gatewayResponse: error.response
      };
    }
  }

  // Procesar reembolso
  async processRefund(refundData, gatewayName) {
    const gateway = this.gateways[gatewayName];

    if (!gateway) {
      throw new Error(`Gateway ${gatewayName} no está registrado`);
    }

    try {
      const result = await gateway.refund(refundData);
      return {
        success: true,
        gateway: gatewayName,
        refundId: result.refundId,
        gatewayResponse: result,
        processedAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        gateway: gatewayName,
        error: error.message,
        errorCode: error.code,
        gatewayResponse: error.response
      };
    }
  }

  // Validar método de pago
  validatePaymentMethod(paymentMethod) {
    const errors = [];

    switch (paymentMethod.type) {
      case 'card':
        if (!paymentMethod.lastFour || paymentMethod.lastFour.length !== 4) {
          errors.push('Los últimos 4 dígitos de la tarjeta son requeridos');
        }
        if (!paymentMethod.expiryMonth || !paymentMethod.expiryYear) {
          errors.push('La fecha de expiración es requerida');
        }
        if (paymentMethod.expiryYear < new Date().getFullYear() ||
            (paymentMethod.expiryYear === new Date().getFullYear() &&
             paymentMethod.expiryMonth < new Date().getMonth() + 1)) {
          errors.push('La tarjeta ha expirado');
        }
        break;

      case 'bank_transfer':
        // Validaciones específicas para transferencia bancaria
        break;

      case 'digital_wallet':
        if (!paymentMethod.provider) {
          errors.push('El proveedor de la billetera digital es requerido');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calcular comisiones por gateway
  calculateFees(amount, gatewayName) {
    const fees = {
      stripe: amount * 0.029 + 0.30, // 2.9% + $0.30
      paypal: amount * 0.034 + 0.49, // 3.4% + $0.49
      mercadopago: amount * 0.0399 + 0.90, // 3.99% + $0.90
      default: amount * 0.05 // 5% por defecto
    };

    return fees[gatewayName] || fees.default;
  }
}

// Gateways de ejemplo (implementaciones básicas)
class StripeGateway {
  async charge(paymentData) {
    // Simulación de procesamiento con Stripe
    const transactionId = `stripe_${Date.now()}`;

    // Aquí iría la integración real con Stripe SDK
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({ ... });

    return {
      transactionId,
      status: 'succeeded',
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd'
    };
  }

  async refund(refundData) {
    const refundId = `refund_stripe_${Date.now()}`;

    // Aquí iría la integración real con Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const refund = await stripe.refunds.create({ ... });

    return {
      refundId,
      status: 'succeeded',
      amount: refundData.amount
    };
  }
}

class PayPalGateway {
  async charge(paymentData) {
    const transactionId = `paypal_${Date.now()}`;

    // Simulación de procesamiento con PayPal
    return {
      transactionId,
      status: 'COMPLETED',
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd'
    };
  }

  async refund(refundData) {
    const refundId = `refund_paypal_${Date.now()}`;

    return {
      refundId,
      status: 'COMPLETED',
      amount: refundData.amount
    };
  }
}

// Instancia singleton del servicio
const paymentService = new PaymentService();

// Registrar gateways disponibles
paymentService.registerGateway('stripe', new StripeGateway());
paymentService.registerGateway('paypal', new PayPalGateway());

module.exports = paymentService;