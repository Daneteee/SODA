"use client"

import { useState } from "react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { Cookie, Shield, Eye, Clock, Server, ChevronDown, ChevronUp } from "lucide-react"

export default function CookiesPage() {
  const [openSection, setOpenSection] = useState("essential")

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const cookieTypes = [
    {
      id: "essential",
      title: "Cookies Esenciales",
      icon: Shield,
      color: "text-primary",
      description:
        "Estas cookies son necesarias para el funcionamiento básico del sitio web y no pueden ser desactivadas en nuestros sistemas. Generalmente solo se establecen en respuesta a acciones realizadas por ti que equivalen a una solicitud de servicios, como establecer tus preferencias de privacidad, iniciar sesión o completar formularios.",
      examples: [
        { name: "session_id", purpose: "Gestiona tu sesión activa", duration: "Sesión" },
        { name: "csrf_token", purpose: "Protege contra ataques de falsificación", duration: "Sesión" },
        { name: "cookieConsent", purpose: "Guarda tus preferencias de cookies", duration: "1 año" },
      ],
    },
    {
      id: "functional",
      title: "Cookies Funcionales",
      icon: Eye,
      color: "text-secondary",
      description:
        "Estas cookies permiten que el sitio web proporcione una funcionalidad y personalización mejoradas. Pueden ser establecidas por nosotros o por proveedores externos cuyos servicios hemos agregado a nuestras páginas. Si no permites estas cookies, es posible que algunos o todos estos servicios no funcionen correctamente.",
      examples: [
        { name: "theme_preference", purpose: "Recuerda tu tema preferido", duration: "1 año" },
        { name: "language", purpose: "Guarda tu preferencia de idioma", duration: "1 año" },
        { name: "recent_views", purpose: "Recuerda los últimos elementos vistos", duration: "30 días" },
      ],
    },
    {
      id: "analytics",
      title: "Cookies Analíticas",
      icon: Clock,
      color: "text-accent",
      description:
        "Estas cookies nos permiten contar visitas y fuentes de tráfico para poder medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y menos populares y ver cómo se mueven los visitantes por el sitio. Toda la información que recopilan estas cookies es agregada y, por lo tanto, anónima.",
      examples: [
        { name: "_ga", purpose: "Registra un ID único para estadísticas", duration: "2 años" },
        { name: "_gat", purpose: "Limita la tasa de solicitudes", duration: "1 día" },
        { name: "_gid", purpose: "Registra un ID único para estadísticas diarias", duration: "1 día" },
      ],
    }
  ]

  return (
    <div className="relative min-h-screen bg-base-200 overflow-hidden">
      {/* Fondo con burbujas animadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-16 h-16 rounded-full opacity-30 animate-bubble ${
              ["bg-primary", "bg-secondary", "bg-accent"][i % 3]
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `105vh`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 7}s`,
              transform: `scale(${0.5 + Math.random() * 1})`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/40 to-accent/40 text-center relative z-10">
        <div className="container mx-auto">
          <Cookie className="mt-10 w-20 h-20 mx-auto mb-6 text-white/90" />
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Política de Cookies
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Información detallada sobre cómo utilizamos las cookies para mejorar tu experiencia en SODA
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 px-6 bg-base-100 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web colocan en tu dispositivo cuando los
              visitas. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, así como
              para proporcionar información a los propietarios del sitio.
            </p>
            <p>
              En SODA, utilizamos cookies para diversos fines, como mejorar la funcionalidad de nuestro sitio,
              personalizar tu experiencia y analizar cómo utilizas nuestro sitio para mejorarlo continuamente.
            </p>
          </div>

          {/* Tipos de cookies */}
          <div className="space-y-6 mb-12">
            <h2 className="text-3xl font-bold text-primary mb-6">Tipos de cookies que utilizamos</h2>

            {cookieTypes.map((type) => (
              <div key={type.id} className="card bg-base-200 shadow-xl overflow-hidden border border-base-300">
                <div className="card-body p-0" onClick={() => toggleSection(type.id)}>
                  <div className="p-6 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <type.icon className={`w-8 h-8 ${type.color}`} />
                      <h3 className="text-xl font-bold m-0">{type.title}</h3>
                    </div>
                    {openSection === type.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>

                  {openSection === type.id && (
                    <div className="p-6 pt-0 border-t border-base-300 bg-base-100/50">
                      <p className="mb-4">{type.description}</p>

                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Propósito</th>
                              <th>Duración</th>
                            </tr>
                          </thead>
                          <tbody>
                            {type.examples.map((cookie, index) => (
                              <tr key={index}>
                                <td className="font-mono text-sm">{cookie.name}</td>
                                <td>{cookie.purpose}</td>
                                <td>{cookie.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Gestión de cookies */}
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Cómo gestionar tus cookies</h2>
            <p>
              La mayoría de los navegadores web permiten cierto control de la mayoría de las cookies a través de la
              configuración del navegador. Para saber más sobre las cookies, incluyendo cómo ver qué cookies se han
              establecido y cómo gestionarlas y eliminarlas, visita{" "}
              <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">
                www.allaboutcookies.org
              </a>
              .
            </p>
            <p>
              Para optar por no ser rastreado por Google Analytics en todos los sitios web, visita
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                {" "}
                https://tools.google.com/dlpage/gaoptout
              </a>
              .
            </p>
          </div>

          {/* Cambios en la política */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-primary mb-4">Cambios en nuestra política de cookies</h2>
            <p>
              Cualquier cambio que podamos hacer en nuestra política de cookies en el futuro se publicará en esta
              página. Por favor, comprueba con frecuencia para ver cualquier actualización o cambio en nuestra política
              de cookies.
            </p>
            <p>Última actualización: Mayo 2024</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary text-white relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes preguntas sobre nuestras cookies?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Si tienes alguna pregunta sobre cómo utilizamos las cookies o sobre nuestra política de privacidad, no dudes
            en ponerte en contacto con nosotros.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn btn-accent">
              Contactar con nosotros
            </Link>
            <Link href="/" className="btn btn-outline text-white border-white hover:bg-white hover:text-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Estilo de animación */}
      <style jsx>{`
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) scale(1.2);
            opacity: 0;
          }
        }
        .animate-bubble {
          animation: bubble linear infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  )
}
