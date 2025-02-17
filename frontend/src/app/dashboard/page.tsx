"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  phone?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/user/profile", {
          credentials: "include", 
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error al obtener el usuario", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  if (!user) {
    return <p>Cargando...</p>; // Mensaje de carga mientras se obtienen los datos
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bienvenido, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>TelÃ©fono: {user.phone || "No especificado"}</p>
    </div>
  );
}