import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  BellIcon
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
  Bar
} from 'recharts';
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import io from 'socket.io-client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      loadDashboardData();

      // Conectar WebSocket
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('notification', (notification) => {
        toast.success(notification.message, {
          icon: '🔔',
          duration: 5000
        });
        loadRecentNotifications();
      });

      newSocket.emit('join', decoded.id);
      setSocket(newSocket);

      return () => newSocket.close();
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

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
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=5");
      setRecentNotifications(res.data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const getStatCards = () => {
    if (user.role === 'admin') {
      return [
        {
          title: "Total Usuarios",
          value: stats.totalUsers || 0,
          icon: UsersIcon,
          color: "bg-purple-500"
        },
        {
          title: "Total Clientes",
          value: stats.totalCustomers || 0,
          icon: UsersIcon,
          color: "bg-blue-500"
        },
        {
          title: "Clientes Activos",
          value: stats.activeCustomers || 0,
          icon: ChartBarIcon,
          color: "bg-green-500"
        },
        {
          title: "Ingresos",
          value: `$${stats.revenue?.toLocaleString() || 0}`,
          icon: CurrencyDollarIcon,
          color: "bg-yellow-500"
        },
        {
          title: "Crecimiento",
          value: `+${stats.growth || 0}%`,
          icon: ArrowTrendingUpIcon,
          color: "bg-orange-500"
        }
      ];
    } else if (user.role === 'manager') {
      return [
        {
          title: "Mis Clientes",
          value: stats.myCustomers || 0,
          icon: UsersIcon,
          color: "bg-blue-500"
        },
        {
          title: "Clientes del Equipo",
          value: stats.teamCustomers || 0,
          icon: UsersIcon,
          color: "bg-green-500"
        },
        {
          title: "Ingresos",
          value: `$${stats.revenue?.toLocaleString() || 0}`,
          icon: CurrencyDollarIcon,
          color: "bg-purple-500"
        },
        {
          title: "Crecimiento",
          value: `+${stats.growth || 0}%`,
          icon: ArrowTrendingUpIcon,
          color: "bg-orange-500"
        }
      ];
    } else {
      return [
        {
          title: "Mis Clientes",
          value: stats.myCustomers || 0,
          icon: UsersIcon,
          color: "bg-blue-500"
        },
        {
          title: "Ingresos",
          value: `$${stats.revenue?.toLocaleString() || 0}`,
          icon: CurrencyDollarIcon,
          color: "bg-green-500"
        },
        {
          title: "Crecimiento",
          value: `+${stats.growth || 0}%`,
          icon: ArrowTrendingUpIcon,
          color: "bg-orange-500"
        }
      ];
    }
  };

  const statCards = getStatCards();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard {user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Usuario'}
          </h1>
          <p className="text-gray-600">
            Bienvenido de vuelta, <span className="font-semibold">{user.email}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">Rol: {user.role}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          {chartData?.salesChart && (
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas (6 meses)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Ventas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BellIcon className="h-5 w-5 mr-2" />
              Notificaciones Recientes
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentNotifications?.length > 0 ? (
                recentNotifications.map((notification, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${!notification.read ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay notificaciones recientes</p>
              )}
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/customers")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <UsersIcon className="h-5 w-5 mr-2" />
                Clientes
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Pedidos
              </button>
              <button
                onClick={() => navigate("/quotes")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Cotizaciones
              </button>
              <button
                onClick={() => navigate("/reports")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                Reportes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {user.role === 'admin' ? 'Clientes Recientes' : 'Mis Clientes Recientes'}
            </h3>
            <div className="space-y-3">
              {stats.recentCustomers?.length > 0 ? (
                stats.recentCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay clientes recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
