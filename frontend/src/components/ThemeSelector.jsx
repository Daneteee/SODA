"use client";

import { useState, useRef } from "react";
import { Paintbrush } from "lucide-react";

export default function ThemeToggle() {
  // Inicializa el tema desde localStorage
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
        return savedTheme;
      }
    }
    return "default";
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsOpen(false); // Cierra el menú al seleccionar un tema
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  // Agrega y elimina el event listener manualmente
  if (typeof window !== "undefined") {
    window.addEventListener("mousedown", handleClickOutside);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn m-1"
        aria-label="Toggle theme menu"
      >
        <Paintbrush className="w-5 h-5" />
      </button>
      {isOpen && (
        <ul className="absolute left-1/2 -translate-x-1/2 mt-2 bg-base-100 rounded-box z-[9999] w-52 p-2 shadow-2xl">
          {[
            { label: "Default", value: "dark" },
            { label: "Light", value: "cupcake" },
            { label: "Emerald", value: "emerald" },
            { label: "Valentine", value: "valentine" },
            { label: "Darker", value: "night" },
          ].map((option) => (
            <li key={option.value}>
              <button
                onClick={() => handleThemeChange(option.value)}
                className={`theme-controller btn btn-sm btn-block btn-ghost justify-start ${
                  theme === option.value ? "bg-base-200" : ""
                }`}
                aria-label={option.label}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
