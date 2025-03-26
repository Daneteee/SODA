"use client"

import { useState } from "react";

export default function Comunidad() {
  const [search, setSearch] = useState("");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comunidad</h1>
      <div className="tabs">
        <input type="radio" id="tab-chats" name="tab" className="tab-toggle" defaultChecked />
        <label htmlFor="tab-chats" className="tab tab-bordered">Chats</label>
        
        <input type="radio" id="tab-comunidades" name="tab" className="tab-toggle" />
        <label htmlFor="tab-comunidades" className="tab tab-bordered">Comunidades</label>
        
        <input type="radio" id="tab-usuarios" name="tab" className="tab-toggle" />
        <label htmlFor="tab-usuarios" className="tab tab-bordered">Usuarios</label>
      </div>

      <div className="mt-4">
        <div className="hidden" id="tab-chats-content">
          <div className="card bg-base-100 shadow-md p-4">Lista de Chats aquí...</div>
        </div>
        <div className="hidden" id="tab-comunidades-content">
          <div className="card bg-base-100 shadow-md p-4">Lista de Comunidades aquí...</div>
        </div>
        <div className="hidden" id="tab-usuarios-content">
          <div className="card bg-base-100 shadow-md p-4">
            <div className="flex items-center mb-4">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered w-full max-w-xs mr-2"
              />
              <button className="btn btn-primary">Buscar</button>
            </div>
            Lista de Usuarios aquí...
          </div>
        </div>
      </div>
    </div>
  );
}
