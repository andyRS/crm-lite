import { Navigate } from "react-router-dom";
import React from "react";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  <div className="bg-red-500 text-white p-6 text-2xl">
  TAILWIND FUNCIONA
</div>


  return children;
}
