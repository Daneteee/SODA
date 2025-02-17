"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Error al iniciar sesión");
      }

      // Guardar el token en localStorage
      document.cookie = `token=${data.token}; path=/; secure; samesite=strict; max-age=86400`;

      // Redirigir a otra página (ejemplo: dashboard)
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-[80vh] items-center justify-center bg-base-200">
      <div className="card w-[28rem] bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl text-center">Iniciar sesión</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="input input-bordered w-full text-lg p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="input input-bordered w-full text-lg p-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn btn-primary btn-lg w-full">Entrar</button>
          </form>
          <p className="text-md text-center mt-3">
            ¿No tienes cuenta? <a href="/register" className="link">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  );
}