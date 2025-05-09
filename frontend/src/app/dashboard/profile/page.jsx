"use client";

import React, { useEffect, useState } from "react";
import { User, Camera, Settings } from "lucide-react";
import Alert from "@/components/Alert";

const EditProfilePage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: ""
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [validations, setValidations] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
    match: false
  });

  const [alert, setAlert] = useState(null);
  const [showImageAlert, setShowImageAlert] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user/profile", {
          method: "GET",
          credentials: "include",
        });
        
        if (!profileResponse.ok) throw new Error("Error obtaining user data");
        
        const profileData = await profileResponse.json();
        setUserData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          profileImage: profileData.profileImage || "Cargando..."
        });
        setAlert(null); 
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAlert({ type: "error", message: "Error loading user profile data." });
      }
    };

    fetchUserData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d*$/.test(value)) return;
    setUserData({ ...userData, [name]: value });
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const newPasswordState = { ...password, [name]: value };
    setPassword(newPasswordState);

    if (name === "new") {
      setValidations({
        length: value.length >= 8,
        letter: /[a-zA-Z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        match: value === newPasswordState.confirm
      });
    }

    if (name === "confirm") {
      setValidations((v) => ({
        ...v,
        match: newPasswordState.new === value
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("profileImage", file);

      fetch(process.env.NEXT_PUBLIC_API_URL + "/user/profile-image", {
        method: "PUT",
        credentials: "include",
        body: formData,
      })
        .then((res) => res.json())
        .then(() => {
          setShowImageAlert(true);
        })
        .catch((error) => console.error("Error al actualizar la imagen:", error));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setAlert({ type: "warning", message: "Actualizando perfil..." });
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        }),
      });
      if (response.ok) {
        setAlert({ type: "success", message: "Perfil actualizado correctamente" });
      } else {
        const data = await response.json();
        setAlert({ type: "error", message: data.msg || "Error al actualizar el perfil" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlert({ type: "error", message: "Error de conexión con el servidor" });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!validations.length || !validations.letter || !validations.number || !validations.special) {
      setAlert({ type: "error", message: "La nueva contraseña no cumple con los requisitos" });
      return;
    }
    if (password.new !== password.confirm) {
      setAlert({ type: "error", message: "Las contraseñas no coinciden" });
      return;
    }
    try {
      setAlert({ type: "warning", message: "Actualizando contraseña..." });
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new,
        }),
      });
      if (response.ok) {
        setAlert({ type: "success", message: "Contraseña actualizada correctamente" });
        setPassword({ current: "", new: "", confirm: "" });
      } else {
        const data = await response.json();
        setAlert({ type: "error", message: data.msg || "Error al actualizar la contraseña" });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setAlert({ type: "error", message: "Error de conexión con el servidor" });
    }
  };

  return (
    <main className="flex-1 p-6 bg-base-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
        <p className="text-gray-600">
          Actualiza tu información personal y configuraciones
        </p>
      </div>

      {showImageAlert && (
        <div className="alert shadow-lg mb-4 flex items-center justify-between" role="alert">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-info" />
            <div>
              <h3 className="font-bold">¡Imagen actualizada!</h3>
              <div className="text-xs">Refresca la página para ver los cambios.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={() => window.location.reload()}>
              Refrescar
            </button>
            <button className="btn btn-sm" onClick={() => setShowImageAlert(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de información */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Información Personal
            </h2>

            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col items-center mb-4">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    {userData.profileImage && userData.profileImage !== "Cargando..." ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${userData.profileImage}`}
                        alt="Profile"
                      />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full bg-neutral text-neutral-content text-2xl">
                        ?
                      </span>
                    )}
                  </div>
                </div>
                <label className="btn btn-sm btn-outline mt-4 gap-2">
                  <Camera className="h-4 w-4" />
                  Cambiar Foto
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full"
                  value={userData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  className="input input-bordered w-full"
                  value={userData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>

        {/* Card de contraseña */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Cambiar Contraseña
            </h2>

            <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  name="current"
                  className="input input-bordered w-full"
                  value={password.current}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  name="new"
                  className="input input-bordered w-full"
                  value={password.new}
                  onChange={handlePasswordChange}
                  required
                />
                <div className="text-xs mt-2">
                  {[
                    { label: "Mínimo 8 caracteres", valid: validations.length },
                    { label: "Al menos 1 letra", valid: validations.letter },
                    { label: "Al menos 1 número", valid: validations.number },
                    { label: "Al menos 1 carácter especial", valid: validations.special }
                  ].map(({ label, valid }, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1 ${
                        valid ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {valid ? (
                        <span>✔️</span>
                      ) : (
                        <span>❌</span>
                      )}
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirm"
                  className="input input-bordered w-full"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  required
                />
                {password.confirm && (
                  <div
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      validations.match ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {validations.match ? <span>✔️</span> : <span>❌</span>}
                    {validations.match
                      ? "Las contraseñas coinciden"
                      : "Las contraseñas no coinciden"}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary mt-4">
                Actualizar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditProfilePage;
