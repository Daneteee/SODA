"use client"; // Hace que sea un componente de cliente

import { usePathname } from "next/navigation";
import HomeNavbar from "@/components/HomeNavbar";  // Navbar para la home
import Navbar from "@/components/Navbar";  // Navbar para el resto

export default function NavbarWrapper() {
  const pathname = usePathname(); // Obtiene la ruta actual

  return pathname === "/" ? <HomeNavbar /> : <Navbar />;
}
