import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", email: "", phone: "" });
  const [showModal, setShowModal] = useState(false);

  const loadCustomers = async () => {
    const res = await api.get("/customers");
    setCustomers(res.data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (form.id) {
      await api.put(`/customers/${form.id}`, form);
    } else {
      await api.post("/customers", form);
    }

    setForm({ id: null, name: "", email: "", phone: "" });
    setShowModal(false);
    loadCustomers();
  };

  const edit = (c) => {
    setForm({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || "",
    });
    setShowModal(true);
  };

  const remove = async (id) => {
    await api.delete(`/customers/${id}`);
    loadCustomers();
  };

  return (
    <>
      <Navbar />

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)" }}>
          <div style={{ background: "#fff", padding: 20, width: 400, margin: "100px auto" }}>
            <h3>Cliente</h3>

            <form onSubmit={submit}>
              <input
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                placeholder="Teléfono"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ padding: 20 }}>
        <h2>Clientes</h2>

        <button onClick={() => setShowModal(true)}>Agregar Cliente</button>

        <table border="1" cellPadding="8" style={{ marginTop: 20, width: "100%" }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  <button onClick={() => edit(c)}>Editar</button>
                  <button onClick={() => remove(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
