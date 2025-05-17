"use client";
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  History,
  Settings,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const DrawerSide = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error obteniendo el usuario");
        const data = await res.json();
        setUser({
          name: data.name || "Usuario",
          profileImage: data.profileImage
            ? process.env.NEXT_PUBLIC_SERVER_URL + `${data.profileImage}`
            : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        });
      } catch (error) {
        console.error("Error cargando el perfil:", error);
      }
    };

    fetchUserData();
  }, []);

  const isActive = (href) => {
    return pathname === href ? "active" : "hover:bg-base-200";
  };

  const handleLogout = () => {
    document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
  };

  return (
    <>
      <div className="drawer-side hidden md:block h-full">
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
              <Link href="/dashboard/posts" className={isActive("/dashboard/posts")}>
                <Users className="h-5 w-5" />
                Posts
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
          <div className="p-4 border-t border-base-200">
            <button className="btn btn-error btn-block" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 z-50">
        <div className="flex justify-around items-center p-2">
          <Link href="/dashboard/market" className={`flex flex-col items-center p-2 ${isActive("/dashboard/market")}`}>
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link href="/dashboard/portfolio" className={`flex flex-col items-center p-2 ${isActive("/dashboard/portfolio")}`}>
            <PieChart className="h-6 w-6" />
            <span className="text-xs mt-1">Portfolio</span>
          </Link>
          <Link href="/dashboard/wallet" className={`flex flex-col items-center p-2 ${isActive("/dashboard/wallet")}`}>
            <Wallet className="h-6 w-6" />
            <span className="text-xs mt-1">Wallet</span>
          </Link>
          <Link href="/dashboard/transactions" className={`flex flex-col items-center p-2 ${isActive("/dashboard/transactions")}`}>
            <History className="h-6 w-6" />
            <span className="text-xs mt-1">Historial</span>
          </Link>
          <Link href="/dashboard/profile" className={`flex flex-col items-center p-2 ${isActive("/dashboard/profile")}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Config</span>
          </Link>
        </div>
      </div>

      <div className="md:hidden h-16"></div>
    </>
  );
};

export default DrawerSide;