import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import {
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    loadDashboardData();

    // Configurar Socket.IO para notificaciones en tiempo real
    const socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('🔌 Conectado a Socket.IO');
      socket.emit('join', user.id);
    });

    socket.on('notification', (notification) => {
      console.log('🔔 Nueva notificación:', notification);
      
      // Mostrar toast según el tipo
      const toastOptions = { duration: 4000 };
      
      if (notification.type === 'success') {
        toast.success(`${notification.title}: ${notification.message}`, toastOptions);
      } else if (notification.type === 'warning') {
        toast(`${notification.title}: ${notification.message}`, { ...toastOptions, icon: '⚠️' });
      } else if (notification.type === 'error') {
        toast.error(`${notification.title}: ${notification.message}`, toastOptions);
      } else {
        toast(`${notification.title}: ${notification.message}`, { ...toastOptions, icon: 'ℹ️' });
      }

      // Actualizar lista de notificaciones
      loadRecentNotifications();
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.IO');
    });

    // Recargar notificaciones cada 30 segundos como respaldo
    const notificationInterval = setInterval(() => {
      loadRecentNotifications();
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(notificationInterval);
    };
  }, [navigate, token, user]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, chartsRes, notificationsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/reports/charts?period=6months"),
        api.get("/notifications?limit=5")
      ]);

      setStats(statsRes.data);
      setChartData(chartsRes.data);
      setRecentNotifications(notificationsRes.data);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=5");
      setRecentNotifications(res.data);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { text: "Administrador", color: "bg-gradient-to-r from-red-500 to-pink-500", icon: ShieldCheckIcon },
      manager: { text: "Gerente", color: "bg-gradient-to-r from-blue-500 to-indigo-500", icon: UserGroupIcon },
      user: { text: "Usuario", color: "bg-gradient-to-r from-green-500 to-emerald-500", icon: UsersIcon }
    };
    return badges[role] || badges.user;
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando dashboard...</p>
      </div>
    </div>
  );

  const getStatCards = () => {
    if (user.role === 'admin') {
      return [
        {
          title: "Total Usuarios",
          value: stats.totalUsers || 0,
          icon: UsersIcon,
          gradient: "from-purple-500 to-pink-500",
          trend: "+12%",
          trendUp: true
        },
        {
          title: "Total Clientes",
          value: stats.totalCustomers || 0,
          icon: UserGroupIcon,
          gradient: "from-blue-500 to-cyan-500",
          trend: "+8%",
          trendUp: true
        },
        {
          title: "Productos Activos",
          value: stats.totalProducts || 0,
          icon: ShoppingBagIcon,
          gradient: "from-green-500 to-emerald-500",
          trend: "+5%",
          trendUp: true
        },
        {
          title: "Stock Bajo",
          value: stats.lowStockProducts || 0,
          icon: ExclamationTriangleIcon,
          gradient: "from-orange-500 to-red-500",
          trend: "-3",
          trendUp: false
        },
        {
          title: "Total Pedidos",
          value: stats.totalOrders || 0,
          icon: ShoppingCartIcon,
          gradient: "from-indigo-500 to-purple-500",
          trend: "+15%",
          trendUp: true
        },
        {
          title: "Pedidos Pendientes",
          value: stats.pendingOrders || 0,
          icon: ClockIcon,
          gradient: "from-yellow-500 to-orange-500",
          trend: stats.pendingOrders || 0,
          trendUp: false
        },
        {
          title: "Ingresos Totales",
          value: formatCurrency(stats.revenue || 0),
          icon: CurrencyDollarIcon,
          gradient: "from-green-500 to-teal-500",
          trend: `+${stats.growth || 0}%`,
          trendUp: true,
          large: true
        },
        {
          title: "Crecimiento",
          value: `+${stats.growth || 0}%`,
          icon: ArrowTrendingUpIcon,
          gradient: "from-pink-500 to-rose-500",
          trend: "Este mes",
          trendUp: true
        }
      ];
    } else if (user.role === 'manager') {
      return [
        {
          title: "Total Clientes del Equipo",
          value: stats.myCustomers || 0,
          icon: UserGroupIcon,
          gradient: "from-blue-500 to-indigo-500",
          trend: "+8%",
          trendUp: true
        },
        {
          title: "Total Pedidos",
          value: stats.myOrders || 0,
          icon: ShoppingCartIcon,
          gradient: "from-purple-500 to-pink-500",
          trend: "+12%",
          trendUp: true
        },
        {
          title: "Productos Activos",
          value: stats.totalProducts || 0,
          icon: ShoppingBagIcon,
          gradient: "from-green-500 to-teal-500",
          trend: "+5%",
          trendUp: true
        },
        {
          title: "Ingresos del Equipo",
          value: formatCurrency(stats.revenue || 0),
          icon: CurrencyDollarIcon,
          gradient: "from-emerald-500 to-cyan-500",
          trend: `+${stats.growth || 0}%`,
          trendUp: true,
          large: true
        },
        {
          title: "Crecimiento",
          value: `+${stats.growth || 0}%`,
          icon: ArrowTrendingUpIcon,
          gradient: "from-orange-500 to-red-500",
          trend: "Este mes",
          trendUp: true
        }
      ];
    } else {
      // Usuario normal - solo muestra datos sin tendencias falsas
      const hasActivity = stats.myCustomers > 0 || stats.myOrders > 0 || (stats.revenue && stats.revenue > 0);
      
      return [
        {
          title: "Mis Clientes",
          value: stats.myCustomers || 0,
          icon: UsersIcon,
          gradient: "from-blue-500 to-cyan-500",
          trend: hasActivity ? `${stats.myCustomers} registrados` : "Sin actividad",
          trendUp: stats.myCustomers > 0
        },
        {
          title: "Mis Pedidos",
          value: stats.myOrders || 0,
          icon: ShoppingCartIcon,
          gradient: "from-purple-500 to-pink-500",
          trend: hasActivity ? `${stats.myOrders} pedidos` : "Sin pedidos",
          trendUp: stats.myOrders > 0
        },
        {
          title: "Mis Ingresos",
          value: formatCurrency(stats.revenue || 0),
          icon: CurrencyDollarIcon,
          gradient: "from-green-500 to-teal-500",
          trend: stats.growth > 0 ? `+${stats.growth}%` : hasActivity ? "Sin crecimiento" : "Sin actividad",
          trendUp: stats.growth > 0,
          large: true

        }
      ];
    }
  };

  const statCards = getStatCards();
  const roleBadge = getRoleBadge(user.role);

  // Solo managers y admins ven gráficos de evolución
  const canViewCharts = user.role === 'admin' || user.role === 'manager';

  // Datos reales de gráficos (solo para managers y admins)
  const salesData = chartData?.salesChart || [];

  // Transformar datos de estado para el gráfico circular
  const rawStatusData = chartData?.orderStatusChart || [];
  
  const statusMap = {
    'pending': { name: 'Pendientes', color: '#f59e0b' },
    'confirmed': { name: 'Confirmados', color: '#3b82f6' },
    'processing': { name: 'Procesando', color: '#8b5cf6' },
    'shipped': { name: 'Enviados', color: '#6366f1' },
    'delivered': { name: 'Entregados', color: '#10b981' },
    'cancelled': { name: 'Cancelados', color: '#ef4444' }
  };

  const statusData = canViewCharts ? rawStatusData
    .filter(item => item.count > 0)
    .map(item => ({
      name: statusMap[item.status]?.name || item.status,
      value: parseInt(item.count),
      color: statusMap[item.status]?.color || '#6b7280'
    })) : [];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header con bienvenida personalizada */}
        <div className="mb-8 relative overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <SparklesIcon className="h-8 w-8 animate-pulse" />
                  <h1 className="text-4xl font-bold">{getGreeting()}, {user.name || user.email?.split('@')[0]}!</h1>
                </div>
                <p className="text-indigo-100 text-lg mb-4">
                  Bienvenido a tu panel de control CRM
                </p>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${roleBadge.color} px-4 py-2 rounded-full shadow-lg`}>
                    <roleBadge.icon className="h-5 w-5" />
                    <span className="font-semibold">{roleBadge.text}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="font-medium">
                      {currentTime.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
                  <ChartBarIcon className="h-32 w-32 relative opacity-30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de bienvenida para usuarios sin actividad */}
        {user.role === 'user' && stats.myCustomers === 0 && stats.myOrders === 0 && (
          <div className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3 flex items-center">
                  <SparklesIcon className="h-8 w-8 mr-3 animate-pulse" />
                  ¡Comienza tu viaje en el CRM!
                </h2>
                <p className="text-white/90 text-lg mb-4">
                  Bienvenido a tu panel de control. Aún no tienes actividad registrada.
                </p>
                <div className="space-y-2 text-white/80">
                  <p className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Registra tu primer cliente para comenzar
                  </p>
                  <p className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Crea pedidos y cotizaciones
                  </p>
                  <p className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Observa crecer tus estadísticas en tiempo real
                  </p>
                </div>
              </div>
              <div className="hidden lg:block ml-8">
                <ArrowTrendingUpIcon className="h-32 w-32 opacity-30" />
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid con diseño mejorado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 ${stat.large ? 'lg:col-span-2' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-md`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.trendUp !== undefined && (
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className={`font-bold text-gray-900 ${stat.large ? 'text-3xl' : 'text-2xl'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section - Solo para Managers y Admins */}
        {canViewCharts && salesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tendencia de Ventas</h3>
                <p className="text-sm text-gray-500">Evolución en tiempo real - Últimos 6 meses</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-600">Ventas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-gray-600">Pedidos</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(value) : value,
                    name === 'sales' ? 'Ventas' : 'Pedidos'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Estado de Pedidos</h3>
            <p className="text-sm text-gray-500 mb-6">Distribución actual</p>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} pedidos`, name]}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No hay pedidos aún</p>
                <p className="text-sm text-gray-400 mt-2">Los datos aparecerán cuando se registren pedidos</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Mensaje informativo para usuarios sin acceso a gráficos */}
        {!canViewCharts && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-6 mb-8">
            <div className="flex items-start">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Panel de Actividad Personal</h3>
                <p className="text-gray-600">
                  Comienza a crear clientes y registrar pedidos para ver crecer tus estadísticas. 
                  Los gráficos de evolución en tiempo real están disponibles para Gerentes y Administradores.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2 text-indigo-600" />
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/customers")}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <UsersIcon className="h-5 w-5 mr-2" />
                Gestionar Clientes
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Ver Pedidos
              </button>
              <button
                onClick={() => navigate("/quotes")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Cotizaciones
              </button>
              <button
                onClick={() => navigate("/reports")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Ver Reportes
              </button>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <UsersIcon className="h-6 w-6 mr-2 text-blue-600" />
              {user.role === 'admin' ? 'Clientes Recientes' : 'Mis Últimos Clientes'}
            </h3>
            <div className="space-y-3">
              {stats.recentCustomers?.length > 0 ? (
                stats.recentCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {customer.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay clientes recientes</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <BellIcon className="h-6 w-6 mr-2 text-yellow-600" />
                Notificaciones
              </span>
              {recentNotifications?.filter(n => !n.read).length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {recentNotifications.filter(n => !n.read).length}
                </span>
              )}
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentNotifications?.length > 0 ? (
                recentNotifications.map((notification, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-md ${
                      !notification.read 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="w-full mt-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all text-sm shadow-sm"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
