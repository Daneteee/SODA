"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn m-1">
        Theme
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl"
      >
        {[
          { label: "Default", value: "default" },
          { label: "Light", value: "winter" },
          { label: "Lofi", value: "pastel" },
          { label: "Valentine", value: "valentine" },
          { label: "Aqua", value: "aqua" },
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
    </div>
  );
}