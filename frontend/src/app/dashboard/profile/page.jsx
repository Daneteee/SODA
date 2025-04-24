"use client";

import React, { useEffect, useState } from "react";
import { User, Camera, Settings } from "lucide-react";
import Alert from "@/components/Alert";

const EditProfilePage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [validations, setValidations] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
    match: false,
  });

  const [alert, setAlert] = useState(null);
  const [showImageAlert, setShowImageAlert] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });

        if (!profileResponse.ok) throw new Error("Error obtaining user data");

        const profileData = await profileResponse.json();
        setUserData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          profileImage:
            profileData.profileImage ||
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        });
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

    if (name === "phone" && !/^\d*$/.test(value)) {
      return; // Only allow numbers in phone field
    }

    setUserData({ ...userData, [name]: value });
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
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
        match: value === newPasswordState.confirm,
      });
    }

    // Check if passwords match when confirm password changes
    if (name === "confirm") {
      setValidations({
        ...validations,
        match: newPasswordState.new === value,
      });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("profileImage", file);

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
  const handleProfileUpdate = async (e) => {
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
  const handlePasswordUpdate = async (e) => {
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
    <main className="flex-1 p-6 bg-base-200">
      {/* Aquí va el contenido del componente */}
    </main>
  );
};

export default EditProfilePage;