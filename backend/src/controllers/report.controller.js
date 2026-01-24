const { Op } = require("sequelize");
const { Order, OrderItem, Product, Customer, User, Category } = require("../models");
const { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } = require("date-fns");

exports.getSalesReport = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else {
      const now = new Date();
      switch (period) {
        case 'month':
          dateFilter.createdAt = {
            [Op.between]: [startOfMonth(now), endOfMonth(now)]
          };
          break;
        case 'year':
          dateFilter.createdAt = {
            [Op.between]: [startOfYear(now), endOfYear(now)]
          };
          break;
        case 'last3months':
          dateFilter.createdAt = {
            [Op.between]: [subMonths(now, 3), now]
          };
          break;
        default:
          dateFilter.createdAt = {
            [Op.between]: [startOfMonth(now), endOfMonth(now)]
          };
      }
    }

    // Estadísticas generales
    const totalSales = await Order.sum('total', { where: { ...dateFilter, status: 'delivered' } }) || 0;
    const totalOrders = await Order.count({ where: { ...dateFilter, status: 'delivered' } });
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Ventas por categoría
    const salesByCategory = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: { ...dateFilter, status: 'delivered' },
          attributes: []
        },
        {
          model: Product,
          include: [Category],
          attributes: []
        }
      ],
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.total')), 'total'],
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.quantity')), 'quantity']
      ],
      include: [
        {
          model: Product,
          include: [Category],
          attributes: ['name']
        }
      ],
      group: ['Product.category_id', 'Product.id', 'Category.id'],
      raw: true
    });

    // Productos más vendidos
    const topProducts = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: { ...dateFilter, status: 'delivered' },
          attributes: []
        },
        { model: Product, attributes: ['name'] }
      ],
      attributes: [
        'productId',
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'totalQuantity'],
        [require('sequelize').fn('SUM', require('sequelize').col('total')), 'totalRevenue']
      ],
      group: ['productId', 'Product.id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'DESC']],
      limit: 10
    });

    // Clientes más activos
    const topCustomers = await Order.findAll({
      where: { ...dateFilter, status: 'delivered' },
      include: [
        { model: Customer, attributes: ['name', 'email'] }
      ],
      attributes: [
        'customerId',
        [require('sequelize').fn('COUNT', require('sequelize').col('Order.id')), 'orderCount'],
        [require('sequelize').fn('SUM', require('sequelize').col('total')), 'totalSpent']
      ],
      group: ['customerId', 'Customer.id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('total')), 'DESC']],
      limit: 10
    });

    res.json({
      period,
      summary: {
        totalSales,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100
      },
      salesByCategory,
      topProducts,
      topCustomers
    });
  } catch (error) {
    console.error("Error getting sales report:", error);
    res.status(500).json({ msg: "Error al obtener reporte de ventas" });
  }
};

exports.getDashboardCharts = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    const months = period === '6months' ? 6 : 12;

    // Datos para gráfico de ventas mensuales
    const salesData = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthlySales = await Order.sum('total', {
        where: {
          createdAt: { [Op.between]: [monthStart, monthEnd] },
          status: 'delivered'
        }
      }) || 0;

      const monthlyOrders = await Order.count({
        where: {
          createdAt: { [Op.between]: [monthStart, monthEnd] },
          status: 'delivered'
        }
      });

      salesData.push({
        month: format(date, 'MMM yyyy'),
        sales: monthlySales,
        orders: monthlyOrders
      });
    }

    // Distribución de estados de órdenes
    const orderStatusData = await Order.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Top 5 productos por ventas
    const productSalesData = await OrderItem.findAll({
      include: [{ model: Product, attributes: ['name'] }],
      attributes: [
        'productId',
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'quantity']
      ],
      group: ['productId', 'Product.id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'DESC']],
      limit: 5
    });

    res.json({
      salesChart: salesData,
      orderStatusChart: orderStatusData,
      productSalesChart: productSalesData
    });
  } catch (error) {
    console.error("Error getting dashboard charts:", error);
    res.status(500).json({ msg: "Error al obtener datos de gráficos" });
  }
};