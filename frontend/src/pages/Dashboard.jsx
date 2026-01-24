import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null; // evita render antes de cargar

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h1>Dashboard CRM</h1>
        
        <p>
          Bienvenido: <b>{user.email}</b>
        </p>
      </div>
    </>
  );
}
