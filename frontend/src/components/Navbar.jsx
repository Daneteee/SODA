"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import ThemeSelector from "@/components/ThemeSelector";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({
    profileImage: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
  });
  const router = useRouter();
  const pathname = usePathname();

  // Verificar autenticación y obtener datos del usuario
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwtToken="));
    setIsAuthenticated(!!token);

    if (token) {
      const fetchUserData = async () => {
        try {
          const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
            method: "GET",
            credentials: "include",
          });
          if (!profileResponse.ok) throw new Error("Error obtaining user data");
          const profileData = await profileResponse.json();
          setUserData({
            profileImage: profileData.profileImage || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [pathname]);

  const handleLogout = () => {
    document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsAuthenticated(false);
    router.push("/");
  };

  const navigationItems = (
    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
      <li>
        <Link href="/">Home</Link>
      </li>
      <li>
        <Link href="/portfolio">Portfolio</Link>
      </li>
      <li>
        <Link href="/about">About</Link>
      </li>
    </ul>
  );

  const authenticatedControls = (
    <>
      <button className="btn btn-ghost btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      <button className="btn btn-ghost btn-circle">
        <div className="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="badge badge-xs badge-primary indicator-item"></span>
        </div>
      </button>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <img src={userData.profileImage} alt="Profile" />
          </div>
        </div>
        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li><Link href="/dashboard/market">Perfil</Link></li>
          <li><Link href="/user/profile">Configuración</Link></li>
          <li><button onClick={handleLogout}>Cerrar sesión</button></li>
        </ul>
      </div>
    </>
  );

  const unauthenticatedControls = (
    <div className="flex gap-x-4">
      <Link href="/auth/login" className="btn btn-neutral">Iniciar sesión</Link>
      <Link href="/auth/register" className="btn btn-primary">Registrarse</Link>
    </div>
  );

  return (
    <div className="navbar bg-base-100 h-auto">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          {navigationItems}
        </div>
      </div>

      <div className="navbar-center">
        <Link href="/" className="btn btn-ghost text-xl">SODA</Link>
      </div>

      <div className="navbar-end">
        <ThemeSelector />
        {isAuthenticated ? authenticatedControls : unauthenticatedControls}
      </div>
    </div>
  );
}