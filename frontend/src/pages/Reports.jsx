import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  SparklesIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reports() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      loadReports();
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate, period]);

  const loadReports = async () => {
    try {
      const [salesRes, chartsRes] = await Promise.all([
        api.get(`/reports/sales?period=${period}`),
        api.get(`/reports/charts?period=6months`)
      ]);

      setSalesReport(salesRes.data);
      setChartData(chartsRes.data);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-ES').format(value);
  };

  const calculateTrend = (data) => {
    if (!data || data.length < 2) return { trend: 0, isPositive: true };
    const recent = data[data.length - 1]?.sales || 0;
    const previous = data[data.length - 2]?.sales || 0;
    if (previous === 0) return { trend: 0, isPositive: true };
    const trend = ((recent - previous) / previous) * 100;
    return { trend: Math.abs(trend).toFixed(1), isPositive: trend >= 0 };
  };

  const findPeakMonth = (data) => {
    if (!data || data.length === 0) return null;
    return data.reduce((max, item) => item.sales > max.sales ? item : max, data[0]);
  };

  const findLowestMonth = (data) => {
    if (!data || data.length === 0) return null;
    return data.reduce((min, item) => item.sales < min.sales ? item : min, data[0]);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Ventas') || entry.name.includes('Promedio') 
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleCustomerClick = async (customerId) => {
    if (!customerId) {
      toast.error("ID de cliente inválido");
      return;
    }
    setSelectedCustomer(customerId);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/customers/${customerId}/details`);
      setCustomerDetails(response.data);
    } catch (error) {
      console.error("Error al cargar detalles del cliente:", error);
      toast.error("Error al cargar detalles del cliente");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders?orderId=${orderId}`);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setCustomerDetails(null);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    const statusLabels = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Reportes y Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Métricas detalladas y visualizaciones del rendimiento
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
              <option value="last3months">Últimos 3 meses</option>
            </select>
          </div>
        </div>

        {/* Métricas principales */}
        {salesReport && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 overflow-hidden shadow-lg rounded-xl">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-indigo-100 truncate">
                          Ventas Totales
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-bold text-white">
                            {formatCurrency(salesReport.summary.totalSales)}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  {chartData?.salesChart && (
                    <div className="mt-4">
                      {(() => {
                        const { trend, isPositive } = calculateTrend(chartData.salesChart);
                        return (
                          <div className="flex items-center text-sm">
                            {isPositive ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 text-green-300 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 text-red-300 mr-1" />
                            )}
                            <span className="text-white font-medium">
                              {trend}% vs mes anterior
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-green-500">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <ShoppingBagIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Órdenes
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatNumber(salesReport.summary.totalOrders)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Órdenes completadas
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-amber-500">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Ticket Promedio
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatCurrency(salesReport.summary.avgOrderValue)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Valor por orden
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-purple-500">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <UsersIcon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Clientes Activos
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatNumber(salesReport.summary.totalActiveCustomers)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Con compras realizadas
                  </div>
                </div>
              </div>
            </div>

            {/* Indicadores de temporada */}
            {chartData?.salesChart && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {(() => {
                  const peak = findPeakMonth(chartData.salesChart);
                  const lowest = findLowestMonth(chartData.salesChart);
                  return (
                    <>
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-orange-200 overflow-hidden shadow-lg rounded-xl">
                        <div className="p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                                <FireIcon className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <div className="ml-5 flex-1">
                              <div className="text-sm font-medium text-orange-800 mb-1">
                                🔥 TEMPORADA ALTA
                              </div>
                              <div className="text-xl font-bold text-gray-900">
                                {peak?.month}
                              </div>
                              <div className="text-2xl font-extrabold text-orange-600 mt-1">
                                {formatCurrency(peak?.sales)}
                              </div>
                              <div className="text-sm text-gray-600 mt-2">
                                Mejor mes • {peak?.orders} órdenes
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 overflow-hidden shadow-lg rounded-xl">
                        <div className="p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg">
                                <SparklesIcon className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <div className="ml-5 flex-1">
                              <div className="text-sm font-medium text-blue-800 mb-1">
                                📊 TEMPORADA BAJA
                              </div>
                              <div className="text-xl font-bold text-gray-900">
                                {lowest?.month}
                              </div>
                              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                                {formatCurrency(lowest?.sales)}
                              </div>
                              <div className="text-sm text-gray-600 mt-2">
                                Mes más bajo • {lowest?.orders} órdenes
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {/* Gráficos */}
        <div className="mt-8 grid grid-cols-1 gap-8">
          {/* Gráfico de ventas mensuales mejorado */}
          {chartData?.salesChart && (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Tendencia de Ventas y Órdenes
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Análisis de los últimos 6 meses con identificación de temporadas
                </p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData.salesChart}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    style={{ fontSize: '12px', fontWeight: '500' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#10B981"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fill="url(#colorSales)"
                    name="Ventas"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Órdenes"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de productos más vendidos mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {chartData?.productSalesChart && (
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Productos Más Vendidos
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Top 5 productos por unidades vendidas
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={chartData.productSalesChart}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" stroke="#6B7280" />
                    <YAxis 
                      dataKey="Product.name" 
                      type="category" 
                      stroke="#6B7280"
                      width={120}
                      style={{ fontSize: '11px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="quantity" 
                      name="Cantidad Vendida"
                      radius={[0, 8, 8, 0]}
                    >
                      {chartData.productSalesChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico de ventas por cliente */}
            {chartData?.customerSalesChart && chartData.customerSalesChart.length > 0 && (
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Ventas por Cliente
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Top 5 clientes por facturación total
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={chartData.customerSalesChart}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      type="number" 
                      stroke="#6B7280"
                      tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      dataKey="Customer.name" 
                      type="category" 
                      stroke="#6B7280"
                      width={120}
                      style={{ fontSize: '11px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="total" 
                      name="Ventas Totales"
                      radius={[0, 8, 8, 0]}
                      fill="#10B981"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Gráfico de distribución de estados - ahora en ancho completo */}
          {chartData?.orderStatusChart && (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Estado de Órdenes
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Distribución por estado actual
                </p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData.orderStatusChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count, percent }) => 
                      `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {chartData.orderStatusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tablas de detalle mejoradas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top productos */}
          {salesReport?.topProducts && (
            <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
                <h3 className="text-lg leading-6 font-bold text-white">
                  🏆 Top 5 Productos
                </h3>
                <p className="text-sm text-indigo-100 mt-1">
                  Productos con mayor volumen de ventas
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {salesReport.topProducts.slice(0, 5).map((product, index) => (
                  <li key={product.product_id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900' :
                            'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-bold text-gray-900">
                            {product.Product?.name}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {formatNumber(product.totalQuantity)} unidades
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(product.totalRevenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top clientes */}
          {salesReport?.topCustomers && (
            <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
                <h3 className="text-lg leading-6 font-bold text-white">
                  👥 Top 5 Clientes VIP
                </h3>
                <p className="text-sm text-green-100 mt-1">
                  Clientes con mayor facturación y frecuencia de compra
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {salesReport.topCustomers.slice(0, 5).map((customer, index) => (
                  <li 
                    key={customer.customer_id || customer.Customer?.id || index} 
                    className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleCustomerClick(customer.customer_id || customer.Customer?.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="flex-shrink-0">
                          <div className={`h-14 w-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
                            index === 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white' :
                            'bg-gradient-to-br from-green-500 to-green-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-gray-900">
                              {customer.Customer?.name}
                            </span>
                            {index === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800">
                                👑 VIP
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {customer.Customer?.email}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800">
                              💰 {formatCurrency(customer.totalSpent)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                              📦 {formatNumber(customer.orderCount)} órdenes
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800">
                              📊 Promedio: {formatCurrency(customer.avgOrderValue)}
                            </span>
                          </div>
                          {customer.lastPurchase && (
                            <div className="text-xs text-gray-500 mt-2">
                              Última compra: {new Date(customer.lastPurchase).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {loadingDetails ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : customerDetails ? (
                <>
                  {/* Header del modal */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {customerDetails.customer.name}
                        </h3>
                        <p className="text-green-100 text-sm mt-1">
                          Cliente ID: {customerDetails.customer.clientId}
                        </p>
                      </div>
                      <button
                        onClick={closeModal}
                        className="text-white hover:text-gray-200 transition-colors"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Información del cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <EnvelopeIcon className="h-5 w-5" />
                        <span className="text-sm">{customerDetails.customer.email}</span>
                      </div>
                      {customerDetails.customer.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <PhoneIcon className="h-5 w-5" />
                          <span className="text-sm">{customerDetails.customer.phone}</span>
                        </div>
                      )}
                      {customerDetails.customer.address && (
                        <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                          <MapPinIcon className="h-5 w-5" />
                          <span className="text-sm">{customerDetails.customer.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 font-medium">Total Órdenes</div>
                        <div className="text-2xl font-bold text-blue-900">{customerDetails.stats.totalOrders}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 font-medium">Completadas</div>
                        <div className="text-2xl font-bold text-green-900">{customerDetails.stats.completedOrders}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 font-medium">Total Gastado</div>
                        <div className="text-2xl font-bold text-purple-900">{formatCurrency(customerDetails.stats.totalSpent)}</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="text-sm text-amber-600 font-medium">Promedio</div>
                        <div className="text-2xl font-bold text-amber-900">{formatCurrency(customerDetails.stats.avgOrderValue)}</div>
                      </div>
                    </div>

                    {/* Lista de órdenes */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5" />
                        Historial de Órdenes
                      </h4>
                      <div className="space-y-4">
                        {customerDetails.orders.map((order) => (
                          <div 
                            key={order.id} 
                            onClick={() => handleOrderClick(order.id)}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">Orden #{order.id}</span>
                                  {getStatusBadge(order.status)}
                                </div>
                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">{formatCurrency(order.total)}</div>
                                <div className="text-sm text-gray-500">{order.OrderItems?.length || 0} productos</div>
                              </div>
                            </div>

                            {/* Productos de la orden */}
                            {order.OrderItems && order.OrderItems.length > 0 && (
                              <div className="border-t border-gray-100 pt-3 mt-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">Productos:</div>
                                <div className="space-y-2">
                                  {order.OrderItems.map((item, itemIdx) => (
                                    <div key={item.id || `item-${order.id}-${itemIdx}`} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">{item.Product?.name}</div>
                                        <div className="text-xs text-gray-500">SKU: {item.Product?.sku}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-gray-900">
                                          {item.quantity} x {formatCurrency(item.price)}
                                        </div>
                                        <div className="text-xs font-semibold text-green-600">
                                          = {formatCurrency(item.total)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4">
                    <button
                      onClick={closeModal}
                      className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}