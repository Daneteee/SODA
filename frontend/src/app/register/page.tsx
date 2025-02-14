"use client";
import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [validations, setValidations] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  const isFormValid = Object.values(validations).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Solo permite números en el teléfono
      if (!/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setValidations({
        length: value.length >= 8,
        letter: /[a-zA-Z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Registro exitoso:", data);
        alert("Registro exitoso!");
      } else {
        console.error("Error en el registro:", data);
        alert("Error en el registro: " + data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor.");
    }
  };
  

  return (
    <div className='flex h-[80vh] items-center justify-center transition-all duration-300 bg-base-200'>
      <div className="card w-[28rem] bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl text-center">Registro</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              className="input input-bordered w-full text-lg p-3"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className="input input-bordered w-full text-lg p-3"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className="input input-bordered w-full text-lg p-3"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* Reglas de validación de contraseña */}
            <div className="text-sm mt-0.5">
              {[
                { label: "Mínimo 8 caracteres", valid: validations.length },
                { label: "Al menos 1 letra", valid: validations.letter },
                { label: "Al menos 1 número", valid: validations.number },
                { label: "Al menos 1 carácter especial", valid: validations.special },
              ].map(({ label, valid }, index) => (
                <div key={index} className={`flex items-center gap-2 ${valid ? "text-green-500" : "text-red-500"}`}>
                  {valid ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17l-4.17-4.17-1.41 1.41L9 19 21.59 6.41 20.17 5z" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95 1.414-1.414z" />
                    </svg>
                  )}
                  {label}
                </div>
              ))}
            </div>

            <input
              type="text"
              name="phone"
              placeholder="Teléfono"
              className="input input-bordered w-full text-lg p-3"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn btn-primary btn-lg w-full">
              Registrarse
            </button>
          </form>
          <p className="text-md text-center mt-3">
            ¿Ya tienes cuenta? <a href="/login" className="link">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}
