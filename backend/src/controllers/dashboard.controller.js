const { User, Customer, Product, Order, OrderItem } = require("../models");

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'admin') {
      // Admin ve todas las estadísticas globales
      const totalUsers = await User.count();
      const totalCustomers = await Customer.count();
      const totalProducts = await Product.count({ where: { active: true } });
      const lowStockProducts = await Product.count({
        where: {
          active: true,
          stock: { [require('sequelize').Op.lte]: require('sequelize').col('minStock') }
        }
      });
      const totalOrders = await Order.count();
      const pendingOrders = await Order.count({ where: { status: 'pending' } });
      const totalRevenue = await Order.sum('total') || 0;

      stats = {
        totalUsers,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        totalOrders,
        pendingOrders,
        revenue: totalRevenue,
        growth: 15.5,
        recentCustomers: await Customer.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'name', 'email', 'createdAt']
        })
      };
    } else if (userRole === 'manager') {
      // Manager ve estadísticas del equipo (por ahora ve todo hasta implementar equipos)
      const totalCustomers = await Customer.count();
      const totalProducts = await Product.count({ where: { active: true } });
      const totalOrders = await Order.count();
      const totalRevenue = await Order.sum('total') || 0;

      stats = {
        myCustomers: totalCustomers,
        myOrders: totalOrders,
        totalProducts,
        revenue: totalRevenue,
        growth: 10.2,
        recentCustomers: await Customer.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'name', 'email', 'createdAt']
        })
      };
    } else {
      // User normal ve solo sus stats
      const myCustomers = await Customer.count({ where: { user_id: userId } });
      const myOrders = await Order.count({ where: { user_id: userId } });
      const myRevenue = await Order.sum('total', { where: { user_id: userId } }) || 0;
      
      // Calcular crecimiento real del usuario comparando con mes anterior
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const lastMonthRevenue = await Order.sum('total', { 
        where: { 
          user_id: userId,
          createdAt: { [require('sequelize').Op.lt]: lastMonth }
        } 
      }) || 0;
      
      const growth = lastMonthRevenue > 0 
        ? ((myRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
        : 0;

      stats = {
        myCustomers,
        myOrders,
        revenue: myRevenue,
        growth: parseFloat(growth),
        recentCustomers: await Customer.findAll({
          where: { user_id: userId },
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'name', 'email', 'createdAt']
        })
      };
    }

    res.json(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ msg: "Error al obtener estadísticas" });
  }
};