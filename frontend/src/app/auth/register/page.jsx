"use client";
import { useState } from "react";
import Alert from "../../../components/Alert";

export default function Register() {
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // Estado para gestionar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Estado para gestionar la validación de la contraseña
  const [validations, setValidations] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  // Estado para mostrar alertas al usuario
  const [alert, setAlert] = useState(null);

  // Función para gestionar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Permitimos solo números de teléfono
      if (!/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      // Comprobamos los requisitos de la contraseña
      setValidations({
        length: value.length >= 8,
        letter: /[a-zA-Z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  // Enviamos los datos al backend para registrar al usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setAlert({ type: "success", message: "¡Te has registrado con éxito!" });
      } else {
        setAlert({ type: "error", message: data.msg || "Ha habido un problema con el registro." });
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setAlert({ type: "error", message: "Error de conexión con el servidor." });
    }
  };
  
  return (
    <div className="flex h-screen items-center justify-center transition-all duration-300 bg-base-200 pt-10">
      <div className="card w-[28rem] bg-base-100 shadow-xl">
        <div className="card-body">
        <h2 className="card-title text-2xl text-center">¡Regístrate!</h2>

          {/* Mostramos alertas si las hay */}
          {alert && <Alert type={alert.type} message={alert.message} />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-lg font-semibold">Nombre de usuario</label>
              <input
                type="text"
                name="name"
                className="input input-bordered w-full text-lg p-3"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold">Correo electrónico</label>
              <input
                type="email"
                name="email"
                className="input input-bordered w-full text-lg p-3"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="input input-bordered w-full text-lg p-3 pr-12"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Reglas de validación de la contraseña */}
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
            </div>            
            <div>
              <label className="block text-lg font-semibold">Teléfono</label>
              <input
                type="text"
                name="phone"
                className="input input-bordered w-full text-lg p-3"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full">
              Registrarse
            </button>
          </form>
          <p className="text-md text-center mt-3">
            ¿Ya tienes cuenta? <a href="/auth/login" className="link">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}