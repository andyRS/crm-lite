const { User } = require('../models');

// Definir permisos por rol
const permissions = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    orders: ['create', 'read', 'update', 'delete'],
    quotes: ['create', 'read', 'update', 'delete'],
    payments: ['create', 'read', 'update', 'delete'],
    reports: ['read']
  },
  manager: {
    users: ['read'],
    customers: ['create', 'read', 'update'],
    products: ['create', 'read', 'update'],
    orders: ['create', 'read', 'update'],
    quotes: ['create', 'read', 'update'],
    payments: ['create', 'read', 'update'],
    reports: ['read']
  },
  user: {
    customers: ['create', 'read', 'update'], // Solo sus propios clientes
    products: ['read'],
    orders: ['create', 'read'], // Solo sus propias órdenes
    quotes: ['create', 'read'], // Solo sus propias cotizaciones
    payments: ['read'] // Solo pagos de sus órdenes
  }
};

// Middleware para verificar permisos
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Verificar si el rol tiene el permiso
      if (!permissions[userRole] || !permissions[userRole][resource] || !permissions[userRole][resource].includes(action)) {
        return res.status(403).json({
          msg: `No tienes permisos para ${action} ${resource}`
        });
      }

      // Verificaciones adicionales para recursos específicos
      switch (resource) {
        case 'customers':
          if (userRole === 'user' && action !== 'read') {
            // Los usuarios solo pueden gestionar sus propios clientes
            const customer = await require('../models').Customer.findByPk(req.params.id || req.body.customer_id);
            if (customer && customer.user_id !== req.user.id) {
              return res.status(403).json({ msg: 'Solo puedes gestionar tus propios clientes' });
            }
          }
          break;

        case 'orders':
          if (userRole === 'user') {
            // Los usuarios solo pueden ver/crear sus propias órdenes
            const order = await require('../models').Order.findByPk(req.params.id);
            if (order && order.user_id !== req.user.id) {
              return res.status(403).json({ msg: 'Solo puedes gestionar tus propias órdenes' });
            }
          }
          break;

        case 'quotes':
          if (userRole === 'user') {
            // Los usuarios solo pueden gestionar sus propias cotizaciones
            const quote = await require('../models').Quote.findByPk(req.params.id);
            if (quote && quote.userId !== req.user.id) {
              return res.status(403).json({ msg: 'Solo puedes gestionar tus propias cotizaciones' });
            }
          }
          break;

        case 'payments':
          if (userRole === 'user') {
            // Los usuarios solo pueden ver pagos de sus órdenes
            const payment = await require('../models').Payment.findByPk(req.params.id);
            if (payment) {
              const order = await require('../models').Order.findByPk(payment.order_id);
              if (order && order.user_id !== req.user.id) {
                return res.status(403).json({ msg: 'Solo puedes ver pagos de tus órdenes' });
              }
            }
          }
          break;
      }

      next();
    } catch (error) {
      console.error('Error en verificación de permisos:', error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  };
};

// Middleware para verificar propiedad de recursos
const checkOwnership = (resource, ownerField = 'user_id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      if (!resourceId) return next();

      const Model = require('../models')[resource.charAt(0).toUpperCase() + resource.slice(1)];
      const item = await Model.findByPk(resourceId);

      if (!item) {
        return res.status(404).json({ msg: `${resource} no encontrado` });
      }

      if (item[ownerField] !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ msg: `No tienes acceso a este ${resource}` });
      }

      req.resource = item; // Guardar el recurso en la request
      next();
    } catch (error) {
      console.error('Error en verificación de propiedad:', error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  };
};

module.exports = {
  checkPermission,
  checkOwnership,
  permissions
};