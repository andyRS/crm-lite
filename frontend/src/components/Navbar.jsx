import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout: contextLogout } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      loadUnreadNotifications();
    }
  }, [user]);

  const loadUnreadNotifications = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Error al cargar contador de no leídos:", err);
    }
  };

  const logout = () => {
    contextLogout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-lg font-semibold tracking-wide">
        <Link to="/" className="hover:text-indigo-400">CRM Lite ERP</Link>
      </div>

      <div className="flex gap-4 items-center text-sm">
        <Link to="/" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/customers" className="hover:text-indigo-400">Clientes</Link>
        <Link to="/products" className="hover:text-indigo-400">Productos</Link>
        <Link to="/orders" className="hover:text-indigo-400">Pedidos</Link>
        <Link to="/invoices" className="hover:text-indigo-400">Facturación</Link>
        <Link to="/quotes" className="hover:text-indigo-400">Cotizaciones</Link>
        <Link to="/reports" className="hover:text-indigo-400">Reportes</Link>

        {/* Notificaciones */}
        <div className="relative">
          <Link to="/notifications" className="hover:text-indigo-400 relative">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
