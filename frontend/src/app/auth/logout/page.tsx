"use client";

import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  // Eliminem el token per fer logout
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
  };

  return (
    <button className="btn btn-neutral" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}
