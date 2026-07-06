const Joi = require('joi');

// Función para sanitizar strings (remover caracteres peligrosos)
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Esquemas de validación con sanitización
const schemas = {
  // Validación de usuario con contraseña segura
  user: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required().custom(sanitizeString),
      email: Joi.string().email().required().custom(sanitizeString),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.pattern.base': 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'
        }),
      role: Joi.string().valid('admin', 'manager', 'user').default('user')
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(100).custom(sanitizeString),
      email: Joi.string().email().custom(sanitizeString),
      role: Joi.string().valid('admin', 'manager', 'user')
    })
  },

  // Validación de cliente
  customer: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      lastName: Joi.string().min(2).max(100).required(),
      cedula: Joi.string().pattern(/^[0-9]{11}$/).required().messages({
        'string.pattern.base': 'La cédula debe tener exactamente 11 dígitos numéricos'
      }),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
      address: Joi.string().required(),
      billingAddress: Joi.string(),
      taxId: Joi.string(),
      creditLimit: Joi.number().min(0).default(0),
      paymentTerms: Joi.string().valid('cash', '7_days', '15_days', '30_days', '60_days').default('cash')
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(100),
      lastName: Joi.string().min(2).max(100),
      cedula: Joi.string().pattern(/^[0-9]{11}$/).messages({
        'string.pattern.base': 'La cédula debe tener exactamente 11 dígitos numéricos'
      }),
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
      address: Joi.string(),
      billingAddress: Joi.string(),
      taxId: Joi.string(),
      creditLimit: Joi.number().min(0),
      paymentTerms: Joi.string().valid('cash', '7_days', '15_days', '30_days', '60_days'),
      status: Joi.string().valid('active', 'inactive', 'suspended', 'blacklisted')
    })
  },

  // Validación de producto
  product: {
    create: Joi.object({
      name: Joi.string().min(2).max(200).required(),
      description: Joi.string(),
      price: Joi.number().min(0).required(),
      cost: Joi.number().min(0).default(0),
      stock: Joi.number().integer().min(0).default(0),
      minStock: Joi.number().integer().min(0).default(5),
      maxStock: Joi.number().integer().min(0),
      sku: Joi.string().min(3).max(50),
      barcode: Joi.string(),
      weight: Joi.number().min(0),
      category_id: Joi.number().integer().required(),
      taxable: Joi.boolean().default(true),
      taxRate: Joi.number().min(0).max(100).default(0),
      trackInventory: Joi.boolean().default(true),
      allowBackorders: Joi.boolean().default(false)
    }),
    update: Joi.object({
      id: Joi.number().integer().required(),
      name: Joi.string().min(2).max(200).required(),
      description: Joi.string().allow(''),
      price: Joi.number().min(0).required(),
      cost: Joi.number().min(0).required(),
      stock: Joi.number().integer().min(0).required(),
      minStock: Joi.number().integer().min(0).required(),
      maxStock: Joi.number().integer().min(0),
      sku: Joi.string().min(3).max(50).required(),
      barcode: Joi.string().allow('', null),
      weight: Joi.number().min(0).allow(null),
      category_id: Joi.alternatives().try(
        Joi.number().integer(),
        Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value))
      ).required(),
      taxable: Joi.boolean(),
      taxRate: Joi.number().min(0).max(100),
      trackInventory: Joi.boolean(),
      allowBackorders: Joi.boolean(),
      active: Joi.boolean()
    })
  },

  // Validación de orden
  order: {
    create: Joi.object({
      customer_id: Joi.number().integer().required(),
      items: Joi.array().items(
        Joi.object({
          product_id: Joi.number().integer().required(),
          quantity: Joi.number().integer().min(1).required(),
          discount: Joi.number().min(0).default(0)
        })
      ).min(1).required(),
      notes: Joi.string().allow(''),
      shippingAddress: Joi.string().allow(''),
      shippingMethod: Joi.string().allow(''),
      shippingCost: Joi.number().min(0).default(0),
      priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
      source: Joi.string().valid('web', 'phone', 'email', 'in_person', 'api').default('web')
    }),
    update: Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      paymentStatus: Joi.string().valid('unpaid', 'partial', 'paid', 'refunded', 'overpaid'),
      deliveryDate: Joi.date(),
      shippingAddress: Joi.string().allow(''),
      shippingMethod: Joi.string().allow(''),
      shippingCost: Joi.number().min(0),
      trackingNumber: Joi.string().allow(''),
      notes: Joi.string().allow('')
    })
  },

  // Validación de métodos de pago
  paymentMethod: {
    create: Joi.object({
      name: Joi.string().required(),
      type: Joi.string().valid('cash', 'card', 'bank_transfer', 'check', 'digital_wallet').required(),
      provider: Joi.string(),
      lastFour: Joi.string().length(4).when('type', { is: 'card', then: Joi.required() }),
      expiryMonth: Joi.number().integer().min(1).max(12).when('type', { is: 'card', then: Joi.required() }),
      expiryYear: Joi.number().integer().min(new Date().getFullYear()).when('type', { is: 'card', then: Joi.required() }),
      isDefault: Joi.boolean().default(false)
    })
  },

  // Validación de pagos
  payment: {
    create: Joi.object({
      order_id: Joi.number().integer().required(),
      paymentMethod_id: Joi.number().integer().required(),
      amount: Joi.number().min(0.01).required(),
      currency: Joi.string().length(3).default('USD'),
      notes: Joi.string()
    })
  }
};

// Middleware de validación
const validate = (schema) => {
  return (req, res, next) => {
    console.log('=== VALIDATING REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.log('❌ VALIDATION FAILED:');
      const errors = error.details.map(detail => {
        console.log(`  - Field: ${detail.path.join('.')}, Message: ${detail.message}`);
        return {
          field: detail.path.join('.'),
          message: detail.message
        };
      });

      return res.status(400).json({
        msg: 'Datos de entrada inválidos',
        errors
      });
    }

    console.log('✅ VALIDATION PASSED');
    next();
  };
};

module.exports = {
  schemas,
  validate
};