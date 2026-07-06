import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Dashboard" },
    ...(user?.role === 'admin' ? [{ to: "/users", label: "Usuarios" }] : []),
    { to: "/customers", label: "Clientes" },
    { to: "/products", label: "Productos" },
    { to: "/orders", label: "Pedidos" },
    { to: "/invoices", label: "Facturación" },
    { to: "/quotes", label: "Cotizaciones" },
    { to: "/reports", label: "Reportes" },
    ...(user?.role === 'admin' ? [{ to: "/settings", label: "Configuración" }] : [])
  ];

  const getRoleBadge = (role) => {
    const badges = {
      admin: { text: 'Admin', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
      manager: { text: 'Manager', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
      user: { text: 'Usuario', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
    };
    return badges[role] || badges.user;
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className="flex items-center gap-2 group"
              >
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-110">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                    CRM Lite
                  </span>
                  <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase font-semibold">
                    ERP System
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link.to)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Link 
                to="/notifications" 
                className="relative p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <BellIcon className="h-6 w-6 text-slate-300 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-8 w-8 text-slate-300" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white leading-tight">{user?.name}</p>
                      <span className={`text-[10px] ${roleBadge.color} text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block`}>
                        {roleBadge.text}
                      </span>
                    </div>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                {showMobileMenu ? (
                  <XMarkIcon className="h-6 w-6 text-white" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* User Info Mobile */}
              <div className="pt-4 border-t border-slate-700/50 mt-4">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  <UserCircleIcon className="h-10 w-10 text-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <span className={`text-[10px] ${roleBadge.color} text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
                      {roleBadge.text}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
