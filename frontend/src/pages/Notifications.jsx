import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      toast.error("Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Error al cargar contador de no leídos:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      toast.success("Notificación marcada como leída");
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
      toast.error("Error al marcar notificación");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      toast.success("Todas las notificaciones marcadas como leídas");
    } catch (err) {
      console.error("Error al marcar todas las notificaciones como leídas:", err);
      toast.error("Error al marcar notificaciones");
    }
  };

  const cleanTestNotifications = async () => {
    try {
      const res = await api.delete("/notifications/clean-test");
      toast.success(res.data.msg);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error("Error al limpiar notificaciones de prueba:", err);
      toast.error("Error al limpiar notificaciones");
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("¿Estás seguro de eliminar TODAS tus notificaciones? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      const res = await api.delete("/notifications/delete-all");
      toast.success(res.data.msg);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error al eliminar notificaciones:", err);
      toast.error("Error al eliminar notificaciones");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <XMarkIcon className="h-6 w-6 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              Notificaciones
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Mantente al día con las actividades del sistema
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 gap-2">
            <button
              onClick={cleanTestNotifications}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Limpiar notificaciones de prueba
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          {unreadCount > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex">
                <BellIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Tienes <strong>{unreadCount}</strong> notificación(es) sin leer
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cuando haya actividad en el sistema, aparecerá aquí.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification.id} className={`px-6 py-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getNotificationIcon(notification.type)}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-700 transition-colors"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}