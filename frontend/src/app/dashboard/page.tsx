"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserCircle,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

export default function Dashboard() {

  interface User {
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }
  
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/user/profile", { withCredentials: true });
        setUser(res.data);
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
      }
    };

    getProfile();
  }, []);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <main className="flex-1 p-4 bg-base-200">
          <h2 className="text-2xl font-bold mb-6">Información del Usuario</h2>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Perfil de Usuario</h2>
              <div className="flex justify-center mb-4">
                <div className="avatar">
                  <div className="w-24 rounded-full">
                    <UserCircle className="h-24 w-24" />
                  </div>
                </div>
              </div>
              {user ? (
                <div className="space-y-2">
                  <p><strong>Nombre:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rol:</strong> {user.role}</p>
                  <p><strong>Miembro desde:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              ) : (
                <p>Cargando información del usuario...</p>
              )}
            </div>
          </div>
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <aside className="bg-base-200 w-64 h-full">
          <div className="flex items-center justify-center h-16 bg-primary text-primary-content">
            <h2 className="text-xl font-bold">Mi Aplicación</h2>
          </div>
          <ul className="menu p-4 w-full text-base-content">
            <li className="mb-2">
              <a className="active">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </a>
            </li>
            <li className="mb-2">
              <a>
                <Users className="h-5 w-5" />
                Usuarios
              </a>
            </li>
            <li className="mb-2">
              <a>
                <FileText className="h-5 w-5" />
                Documentos
              </a>
            </li>
            <li className="mb-2">
              <a>
                <Settings className="h-5 w-5" />
                Configuración
              </a>
            </li>
            <li className="mt-auto">
              <a className="text-error">
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}