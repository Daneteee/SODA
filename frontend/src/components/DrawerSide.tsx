"use client";
import React from "react";
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DrawerSide = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href ? "active" : "hover:bg-base-200";
  };

  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      <aside className="bg-base-100 w-80 border-r border-base-200 flex flex-col h-full">
        <div className="p-4 bg-primary text-primary-content">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-12 h-12 flex items-center justify-center">
                <span>MX</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">MaxTrade Pro</h2>
              <p className="text-sm opacity-80">Trading Platform</p>
            </div>
          </div>
        </div>
        
        <ul className="menu p-4 gap-2 flex-1">
          <li>
            <Link href="/dashboard" className={isActive("/dashboard")}>
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
            <Link href="/dashboard/history" className={isActive("/dashboard/history")}>
              <History className="h-5 w-5" />
              Historial
            </Link>
          </li>
          <li>
            <Link href="/user/profile" className={isActive("/user/profile")}>
              <Settings className="h-5 w-5" />
              Configuración
            </Link>
          </li>
        </ul>

        <div className="p-4 mt-auto">
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h3 className="card-title text-sm">Plan Premium</h3>
              <p className="text-xs">Tu plan expira en 15 días</p>
              <button className="btn btn-primary btn-sm mt-2">Renovar Plan</button>
            </div>
          </div>
          
          <button className="btn btn-error btn-block mt-4">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DrawerSide;
