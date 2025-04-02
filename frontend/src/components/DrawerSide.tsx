"use client";
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const DrawerSide = () => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; profileImage: string } | null>(null);

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error obteniendo el usuario");
        const data = await res.json();
        setUser({
          name: data.name || "Usuario",
          profileImage: data.profileImage
            ? `http://localhost:4000${data.profileImage}`
            : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        });
      } catch (error) {
        console.error("Error cargando el perfil:", error);
      }
    };

    fetchUserData();
  }, []);

  const isActive = (href: string) => {
    return pathname === href ? "active" : "hover:bg-base-200";
  };

  const handleLogout = () => {
    document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <div className="drawer-side" style={{ height: "calc(100vh - 5em)" }}>
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      <aside className="bg-base-100 w-80 border-r border-base-200 flex flex-col h-full">
        {/* Encabezado del usuario */}
        <div className="p-4 bg-primary text-primary-content">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="User Profile" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full bg-neutral text-neutral-content">
                    ?
                  </span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || "Cargando..."}</h2>
              <p className="text-sm opacity-80">Trader</p>
            </div>
          </div>
        </div>

        {/* Menú con scroll independiente */}
        <ul className="menu p-4 gap-2 flex-1 overflow-y-auto">
          <li>
            <Link href="/dashboard/market" className={isActive("/dashboard/market")}>
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/dashboard/portfolio" className={isActive("/dashboard/portfolio")}>
              <PieChart className="h-5 w-5" />
              Portfolio
            </Link>
          </li>
          <li>
            <Link href="/dashboard/wallet" className={isActive("/dashboard/wallet")}>
              <Wallet className="h-5 w-5" />
              Wallet
            </Link>
          </li>
          <li>
            <Link href="/dashboard/transactions" className={isActive("/dashboard/transactions")}>
              <History className="h-5 w-5" />
              Historial
            </Link>
          </li>
          <li>
            <Link href="/dashboard/profile" className={isActive("/dashboard/profile")}>
              <Settings className="h-5 w-5" />
              Configuración
            </Link>
          </li>
        </ul>

        {/* Botón de cerrar sesión */}
        <div className="p-4">
          <button className="btn btn-error btn-block" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DrawerSide;