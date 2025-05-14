"use client";
import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/me", {
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const fetchUser = async (token = null) => {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/me", {
        credentials: 'include',
        headers,
      });

      if (!res.ok) throw new Error("Token inválido");

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const login = (token) => {
    fetchUser();
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/logout", {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
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