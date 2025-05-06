"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Cookie, Info } from "lucide-react"

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Comprobar si el usuario ya ha dado su consentimiento
    const hasConsent = localStorage.getItem("cookieConsent")
    if (!hasConsent) {
      // Mostrar el banner después de un pequeño retraso para mejor UX
      const timer = setTimeout(() => {
        setShowConsent(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true")
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="container mx-auto">
        <div className="relative bg-base-100 rounded-xl shadow-2xl border border-primary/20 p-6 animate-slideUp">
          {/* Burbujas decorativas */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-12 h-12 rounded-full opacity-20 ${
                  ["bg-primary", "bg-secondary", "bg-accent"][i % 3]
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `scale(${0.5 + Math.random() * 1})`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative z-10">
            <div className="flex-shrink-0">
              <Cookie className="w-12 h-12 text-primary" />
            </div>

            <div className="flex-grow">
              <h3 className="text-xl font-bold mb-2">Utilizamos cookies</h3>
              <p className="text-base-content/70">
                Este sitio utiliza cookies para mejorar tu experiencia, personalizar contenido y analizar el tráfico. Al
                hacer clic en "Aceptar", consientes el uso de todas las cookies.
              </p>
              <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-2 mt-4">
                <Link href="/cookies" className="btn btn-outline btn-sm px-6 gap-2">
                  <Info className="w-4 h-4" />
                  Más información
                </Link>
                <button onClick={acceptCookies} className="btn btn-primary btn-sm px-6">
                  Aceptar cookies
                </button>
              </div>
            </div>

            <button
              onClick={acceptCookies}
              className="absolute top-2 right-2 btn btn-ghost btn-circle btn-sm"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Estilos para la animación */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default CookieConsent
