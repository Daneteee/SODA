"use client";

import React, { useState, useEffect } from "react";
import Alert from "@/components/Alert";

const WalletPage = () => {
  const [credit, setCredit] = useState(0);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [amountToWithdraw, setAmountToWithdraw] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Función para mostrar la alerta
  const showAlert = (message) => {
    setAlertMessage(message);
  };

  const closeAlert = () => {
    setAlertMessage("");
  };

  // Obtener el crédito actual del usuario
  useEffect(() => {
    const fetchCredit = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Error obteniendo datos del usuario");
        const data = await response.json();
        setCredit(data.credit);
      } catch (error) {
        console.error("Error al obtener el crédito:", error);
      }
    };

    fetchCredit();
  }, []);

  // Función para añadir crédito
  const handleAddCredit = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/user/addCredit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amountToAdd) }),
      });
      if (!response.ok) throw new Error("Error añadiendo crédito");

      // Actualizar el crédito luego de la operación
      const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
        method: "GET",
        credentials: "include",
      });
      const profileData = await profileResponse.json();
      setCredit(profileData.credit);
      setAmountToAdd("");

      // Mostrar alerta de éxito
      showAlert("Fondos añadidos correctamente.");
    } catch (error) {
      console.error("Error al añadir crédito:", error);
    }
  };

  // Función para retirar crédito
  const handleWithdrawCredit = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/user/withdrawCredit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amountToWithdraw) }),
      });
      if (!response.ok) throw new Error("Error retirando crédito");

      // Actualizar el crédito luego de la operación
      const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
        method: "GET",
        credentials: "include",
      });
      const profileData = await profileResponse.json();
      setCredit(profileData.credit);
      setAmountToWithdraw("");

      // Mostrar alerta de éxito
      showAlert("Fondos enviados a tu cuenta.");
    } catch (error) {
      console.error("Error al retirar crédito:", error);
    }
  };

  return (
    <main className="flex-1 p-6 bg-base-200 h-full">
      <h1 className="text-3xl font-bold mb-6">Mi Wallet</h1>

      {/* Alerta utilizando el componente Alert */}
      {alertMessage && (
        <Alert message={alertMessage} onClose={closeAlert} type="success" />
      )}

      {/* Tarjeta de crédito actual */}
      <div className="card bg-base-100 shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Crédito Actual</h2>
        <p className="text-2xl font-bold">${credit.toFixed(2)}</p>
      </div>

      {/* Sección para añadir y retirar créditos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Añadir Créditos */}
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Añadir Créditos</h2>
          <input
            type="number"
            placeholder="Cantidad a añadir"
            className="input input-bordered w-full mb-4"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
          />
          <button className="btn btn-primary w-full" onClick={handleAddCredit}>
            Añadir
          </button>
        </div>
        {/* Retirar Créditos */}
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Retirar Créditos</h2>
          <input
            type="number"
            placeholder="Cantidad a retirar"
            className="input input-bordered w-full mb-4"
            value={amountToWithdraw}
            onChange={(e) => setAmountToWithdraw(e.target.value)}
          />
          <button className="btn btn-error w-full" onClick={handleWithdrawCredit}>
            Retirar
          </button>
        </div>
      </div>
    </main>
  );
};

export default WalletPage;