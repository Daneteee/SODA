"use client";

import React, { useEffect, useState } from "react";
import { User, Camera, Settings } from 'lucide-react';
import { useRouter } from "next/navigation";
import DrawerSide from "@/components/DrawerSide";
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

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);
  const router = useRouter();
  const [showImageAlert, setShowImageAlert] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include", // Send cookies for authentication
        });
        
        if (!profileResponse.ok) throw new Error("Error obtaining user data");
        
        const profileData = await profileResponse.json();
        setUserData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          profileImage: profileData.profileImage || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAlert({ type: "error", message: "Error loading user profile data." });
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone" && !/^\d*$/.test(value)) {
      return; // Only allow numbers in phone field
    }
    
    setUserData({ ...userData, [name]: value });
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newPasswordState = { ...password, [name]: value };
    setPassword(newPasswordState);
    
    // Validate password if it's the new password field
    if (name === "new") {
      setValidations({
        length: value.length >= 8,
        letter: /[a-zA-Z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        match: value === newPasswordState.confirm
      });
    }
    
    // Check if passwords match when confirm password changes
    if (name === "confirm") {
      setValidations({
        ...validations,
        match: newPasswordState.new === value
      });
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const formData = new FormData();
        formData.append('profileImage', file);
    
        fetch("http://localhost:4000/api/user/profile-image", {
            method: "PUT",
            credentials: "include",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
            console.log("Imagen actualizada:", data);
            setShowImageAlert(true);
            })
            .catch((error) => console.error("Error al actualizar la imagen:", error));
        }
    };
  

  // Handle profile update form submission
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setAlert({ type: "warning", message: "Actualizando perfil..." });
      
      const response = await fetch("http://localhost:4000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Handle password update form submission
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if new password meets all criteria
    if (!validations.length || !validations.letter || !validations.number || !validations.special) {
      setAlert({ type: "error", message: "La nueva contraseña no cumple con los requisitos" });
      return;
    }
    
    // Check if passwords match
    if (password.new !== password.confirm) {
      setAlert({ type: "error", message: "Las contraseñas no coinciden" });
      return;
    }
    
    try {
      setAlert({ type: "warning", message: "Actualizando contraseña..." });
      
      const response = await fetch("http://localhost:4000/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <main className="flex-1 p-6 bg-base-200">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Editar Perfil</h1>
                <p className="text-gray-600">Actualiza tu información personal y configuraciones</p>
            </div>

            {/* Alertas */}
            {showImageAlert && (
            <div role="alert" className="alert shadow-lg mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info h-6 w-6 shrink-0">
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h3 className="font-bold">¡Imagen actualizada!</h3>
                    <div className="text-xs">Refresca la página para ver los cambios.</div>
                </div>
                </div>
                
                {/* Botones alineados horizontalmente */}
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
                {/* Profile Information Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Información Personal
                        </h2>
                    
                    <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4 mt-4">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={`http://localhost:4000${userData.profileImage}` || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="Profile" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="btn btn-sm btn-outline gap-2">
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
                    </div>

                  
                  {/* Name */}
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
                  
                  {/* Email */}
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
                  
                  {/* Phone */}
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

            {/* Change Password Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Cambiar Contraseña
                </h2>
                
                <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4 mt-4">
                  {/* Current Password */}
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
                  
                  {/* New Password */}
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
                    
                    {/* Password validation rules */}
                    <div className="text-xs mt-2">
                      {[
                        { label: "Mínimo 8 caracteres", valid: validations.length },
                        { label: "Al menos 1 letra", valid: validations.letter },
                        { label: "Al menos 1 número", valid: validations.number },
                        { label: "Al menos 1 carácter especial", valid: validations.special },
                      ].map(({ label, valid }, index) => (
                        <div key={index} className={`flex items-center gap-1 ${valid ? "text-green-500" : "text-red-500"}`}>
                          {valid ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17l-4.17-4.17-1.41 1.41L9 19 21.59 6.41 20.17 5z" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95 1.414-1.414z" />
                            </svg>
                          )}
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
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
                    
                    {/* Password match validation */}
                    {password.confirm && (
                      <div className={`text-xs mt-1 flex items-center gap-1 ${validations.match ? "text-green-500" : "text-red-500"}`}>
                        {validations.match ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17l-4.17-4.17-1.41 1.41L9 19 21.59 6.41 20.17 5z" />
                            </svg>
                            Las contraseñas coinciden
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95 1.414-1.414z" />
                            </svg>
                            Las contraseñas no coinciden
                          </>
                        )}
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
      </div>
      
      {/* Sidebar (Drawer) */}
      <DrawerSide />
    </div>
  );
};

export default EditProfilePage;