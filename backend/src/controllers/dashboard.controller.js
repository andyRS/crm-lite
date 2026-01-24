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
        growth: 15.5, // mock
        recentCustomers: await Customer.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [{ model: User, attributes: ['name'] }]
        }),
        recentOrders: await Order.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            { model: Customer, attributes: ['name', 'email'] },
            { model: OrderItem, include: [{ model: Product, attributes: ['name'] }] }
          ]
        })
      };
    } else if (userRole === 'manager') {
      // Manager ve stats de su equipo (simulado, ya que no hay equipos)
      const userCustomers = await Customer.count({ where: { user_id: userId } });
      const userOrders = await Order.count({ where: { user_id: userId } });
      const userRevenue = await Order.sum('total', { where: { user_id: userId } }) || 0;

      stats = {
        myCustomers: userCustomers,
        myOrders: userOrders,
        revenue: userRevenue,
        growth: 10.2,
        recentCustomers: await Customer.findAll({
          where: { user_id: userId },
          limit: 5,
          order: [['createdAt', 'DESC']]
        }),
        recentOrders: await Order.findAll({
          where: { user_id: userId },
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            { model: Customer, attributes: ['name', 'email'] },
            { model: OrderItem, include: [{ model: Product, attributes: ['name'] }] }
          ]
        })
      };
    } else {
      // User normal ve solo sus stats
      const myCustomers = await Customer.count({ where: { user_id: userId } });
      const myOrders = await Order.count({ where: { user_id: userId } });
      const myRevenue = await Order.sum('total', { where: { user_id: userId } }) || 0;

      stats = {
        myCustomers,
        revenue: myRevenue,
        growth: 5.8,
        recentCustomers: await Customer.findAll({
          where: { user_id: userId },
          limit: 5,
          order: [['createdAt', 'DESC']]
        }),
        recentOrders: await Order.findAll({
          where: { user_id: userId },
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            { model: Customer, attributes: ['name', 'email'] },
            { model: OrderItem, include: [{ model: Product, attributes: ['name'] }] }
          ]
        })
      };
    }

    res.json(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ msg: "Error al obtener estadísticas" });
  }
};