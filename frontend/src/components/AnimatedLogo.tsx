"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AnimatedLogo() {
  const [currentLogo, setCurrentLogo] = useState<number>(0);
  const logos = [
    "/blue_soda.svg",
    "/teal_soda.svg",
    "/pink_soda.svg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length);
    }, 3000); // Change logo every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[6vh] w-auto">
      {logos.map((logo, index) => (
        <div
          key={logo}
          className={`absolute top-0 left-0 h-full w-auto transition-opacity duration-1000 ${
            index === currentLogo ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={logo}
            alt={`Soda Logo ${index + 1}`}
            className="h-full w-auto transition-transform duration-200 hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
}