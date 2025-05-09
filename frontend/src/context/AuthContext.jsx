"use client";
import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("jwtToken");
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Token inválido");

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      Cookies.remove("jwtToken");
      setUser(null);
    }
  };

  const login = (token) => {
    Cookies.set("jwtToken", token, { expires: 7, path: "/" });
    fetchUser(token);
    router.push("/dashboard");
  };

  const logout = () => {
    Cookies.remove("jwtToken");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};