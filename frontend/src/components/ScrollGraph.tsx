"use client";
import { useEffect, useState } from "react";

export default function ScrollGraph() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tamaño del cuadrado y velocidad
  const size = 200; // Tamaño del cuadrado en px
  const speed = 0.5; // Ajusta esto para cambiar la velocidad

  // Determina en qué fase del cuadrado está
  const perimeter = size * 4; // Longitud total del recorrido
  const position = (scrollY * speed) % perimeter;

  let left = 0;
  let top = 0;

  if (position < size) {
    // 🟥 Fase 1: Sube (izquierda)
    left = 0;
    top = size - position;
  } else if (position < size * 2) {
    // 🟩 Fase 2: Derecha (arriba)
    left = position - size;
    top = 0;
  } else if (position < size * 3) {
    // 🟦 Fase 3: Baja (derecha)
    left = size;
    top = position - size * 2;
  } else {
    // 🟨 Fase 4: Izquierda (abajo)
    left = size * 4 - position;
    top = size;
  }

  return (
    <div className="relative h-[500px] w-[500px] mx-auto mt-20 border-2 border-dashed border-gray-400">
      {/* Punto verde */}
      <div
        className="absolute w-6 h-6 bg-green-500 rounded-full transition-transform duration-50"
        style={{
          left: `${left}px`,
          top: `${top}px`,
        }}
      />
    </div>
  );
}
