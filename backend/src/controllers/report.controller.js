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

    // Clientes activos únicos (con al menos una orden entregada en el período)
    const activeCustomers = await Order.findAll({
      where: { ...dateFilter, status: 'delivered' },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('customer_id'))), 'count']
      ],
      raw: true
    });
    const totalActiveCustomers = activeCustomers[0]?.count || 0;

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
          attributes: ['name']
        }
      ],
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.total')), 'total'],
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.quantity')), 'quantity']
      ],
      group: ['Product.id', 'Product.category_id', 'Product->Category.id'],
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
        'product_id',
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.quantity')), 'totalQuantity'],
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.total')), 'totalRevenue']
      ],
      group: ['product_id', 'Product.id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('OrderItem.quantity')), 'DESC']],
      limit: 10
    });

    // Clientes más activos con detalles - primero obtener agregaciones
    const topCustomersRaw = await Order.findAll({
      where: { ...dateFilter, status: 'delivered' },
      attributes: [
        'customer_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('Order.id')), 'orderCount'],
        [require('sequelize').fn('SUM', require('sequelize').col('Order.total')), 'totalSpent'],
        [require('sequelize').fn('AVG', require('sequelize').col('Order.total')), 'avgOrderValue'],
        [require('sequelize').fn('MAX', require('sequelize').col('Order.createdAt')), 'lastPurchase']
      ],
      group: ['customer_id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('Order.total')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Obtener los IDs de los clientes
    const customerIds = topCustomersRaw.map(row => row.customer_id).filter(id => id !== null);
    
    // Buscar los datos de los clientes
    const customers = await Customer.findAll({
      where: { id: customerIds },
      attributes: ['id', 'name', 'email', 'phone', 'address'],
      raw: true
    });

    // Crear un mapa de clientes por ID
    const customerMap = {};
    customers.forEach(customer => {
      customerMap[customer.id] = customer;
    });

    // Combinar datos de agregación con datos de clientes
    const topCustomers = topCustomersRaw.map(row => {
      const customer = customerMap[row.customer_id] || {};
      return {
        customer_id: row.customer_id,
        orderCount: parseInt(row.orderCount) || 0,
        totalSpent: parseFloat(row.totalSpent) || 0,
        avgOrderValue: parseFloat(row.avgOrderValue) || 0,
        lastPurchase: row.lastPurchase,
        Customer: customer
      };
    });

    // Distribución de compras por cliente (para gráfico)
    const customerDistribution = await Order.findAll({
      where: { ...dateFilter, status: 'delivered' },
      include: [
        { model: Customer, attributes: ['name'] }
      ],
      attributes: [
        'customer_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('Order.id')), 'orders'],
        [require('sequelize').fn('SUM', require('sequelize').col('Order.total')), 'total']
      ],
      group: ['customer_id', 'Customer.id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('Order.total')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      period,
      summary: {
        totalSales,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalActiveCustomers
      },
      salesByCategory,
      topProducts,
      topCustomers,
      customerDistribution
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
        'product_id',
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'quantity']
      ],
      group: ['product_id', 'Product.id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'DESC']],
      limit: 5
    });

    // Top 5 clientes por facturación
    const customerSalesData = await Order.findAll({
      where: { status: 'delivered' },
      include: [{ model: Customer, attributes: ['name'] }],
      attributes: [
        'customer_id',
        [require('sequelize').fn('SUM', require('sequelize').col('Order.total')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('Order.id')), 'orders']
      ],
      group: ['customer_id', 'Customer.id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('Order.total')), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      salesChart: salesData,
      orderStatusChart: orderStatusData,
      productSalesChart: productSalesData,
      customerSalesChart: customerSalesData
    });
  } catch (error) {
    console.error("Error getting dashboard charts:", error);
    res.status(500).json({ msg: "Error al obtener datos de gráficos" });
  }
};