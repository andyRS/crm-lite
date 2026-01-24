import { Link, useNavigate } from "react-router-dom";
import React from "react";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-lg font-semibold tracking-wide">
        CRM Lite
      </div>

      <div className="flex gap-4 items-center text-sm">
        <Link to="/" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/customers" className="hover:text-indigo-400">Clientes</Link>

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
