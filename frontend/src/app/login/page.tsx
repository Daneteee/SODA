"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className="flex h-[80vh] items-center justify-center bg-base-200">
      <div className="card w-[28rem] bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl text-center">Iniciar sesión</h2>
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
