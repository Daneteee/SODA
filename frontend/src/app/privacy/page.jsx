"use client"

import { useState } from "react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { Lock, Eye, Database, Shield, Server, ChevronDown, ChevronUp } from "lucide-react"

export default function PrivacyPage() {
  const [openSection, setOpenSection] = useState("data-collection")

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const privacySections = [
    {
      id: "data-collection",
      title: "1. Datos que Recopilamos",
      icon: Database,
      color: "text-primary",
      description:
        "Recopilamos información personal como nombre, correo electrónico y número de teléfono, así como datos de navegación y uso de la plataforma.",
      details: [
        { category: "Datos personales", description: "Nombre, dirección de correo electrónico, número de teléfono" },
        { category: "Datos de uso", description: "Información sobre cómo interactúas con nuestra plataforma" },
        { category: "Datos técnicos", description: "Dirección IP, tipo de navegador, dispositivo utilizado" },
      ],
    },
    {
      id: "information-use",
      title: "2. Uso de la Información",
      icon: Eye,
      color: "text-secondary",
      description:
        "Utilizamos tus datos para mejorar tu experiencia en la plataforma, enviar notificaciones relevantes y personalizar el contenido.",
      details: [
        { category: "Mejora del servicio", description: "Analizamos el uso para mejorar nuestras funcionalidades" },
        {
          category: "Comunicaciones",
          description: "Enviamos notificaciones sobre actualizaciones y nuevas características",
        },
        { category: "Personalización", description: "Adaptamos el contenido según tus preferencias y comportamiento" },
      ],
    },
    {
      id: "information-sharing",
      title: "3. Compartir Información",
      icon: Server,
      color: "text-accent",
      description:
        "No compartimos tus datos personales con terceros sin tu consentimiento, salvo cuando sea requerido por ley o para servicios esenciales.",
      details: [
        {
          category: "Proveedores de servicios",
          description: "Compartimos datos con proveedores que nos ayudan a operar la plataforma",
        },
        { category: "Requisitos legales", description: "Podemos divulgar información cuando sea requerido por ley" },
        {
          category: "Consentimiento",
          description: "Compartimos información con terceros solo con tu consentimiento explícito",
        },
      ],
    },
    {
      id: "data-security",
      title: "4. Seguridad de los Datos",
      icon: Shield,
      color: "text-info",
      description:
        "Implementamos medidas de seguridad como cifrado y autenticación para proteger tu información contra accesos no autorizados.",
      details: [
        { category: "Cifrado", description: "Utilizamos tecnología de cifrado para proteger tus datos sensibles" },
        {
          category: "Autenticación",
          description: "Implementamos sistemas de autenticación seguros para el acceso a cuentas",
        },
        {
          category: "Monitoreo",
          description: "Supervisamos continuamente nuestros sistemas para detectar vulnerabilidades",
        },
      ],
    },
    {
      id: "cookies",
      title: "5. Cookies y Tecnologías",
      icon: Database,
      color: "text-primary",
      description:
        "Usamos cookies para recordar tus preferencias, mejorar la navegación y analizar el uso del sitio. Puedes gestionar tus cookies desde la configuración del navegador.",
      details: [
        { category: "Cookies esenciales", description: "Necesarias para el funcionamiento básico del sitio" },
        { category: "Cookies analíticas", description: "Nos ayudan a entender cómo utilizas nuestra plataforma" },
        {
          category: "Cookies funcionales",
          description: "Permiten recordar tus preferencias y personalizar tu experiencia",
        },
      ],
    },
    {
      id: "your-rights",
      title: "6. Tus Derechos",
      icon: Lock,
      color: "text-secondary",
      description:
        "Puedes acceder, modificar o eliminar tus datos personales. También puedes solicitar una copia o retirar tu consentimiento en cualquier momento.",
      details: [
        { category: "Acceso", description: "Derecho a solicitar acceso a tus datos personales" },
        { category: "Rectificación", description: "Derecho a solicitar la corrección de datos inexactos" },
        { category: "Eliminación", description: "Derecho a solicitar la eliminación de tus datos personales" },
      ],
    },
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
          <Lock className="mt-10 w-20 h-20 mx-auto mb-6 text-white/90" />
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Política de Privacidad
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Información detallada sobre cómo protegemos y gestionamos tus datos personales en SODA
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 px-6 bg-base-100 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Tu Privacidad es Importante</h2>
            <p>
              En SODA, nos tomamos muy en serio la protección de tus datos personales. Esta Política de Privacidad
              describe cómo recopilamos, utilizamos y protegemos tu información cuando utilizas nuestra plataforma y
              servicios.
            </p>
            <p>
              Te recomendamos leer detenidamente esta política para entender nuestras prácticas con respecto a tus datos
              personales y cómo los trataremos.
            </p>
          </div>

          {/* Secciones de privacidad */}
          <div className="space-y-6 mb-12">
            <h2 className="text-3xl font-bold text-primary mb-6">Nuestra Política</h2>

            {privacySections.map((section) => (
              <div key={section.id} className="card bg-base-200 shadow-xl overflow-hidden border border-base-300">
                <div className="card-body p-0">
                  <div
                    className="p-6 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-4">
                      <section.icon className={`w-8 h-8 ${section.color}`} />
                      <h3 className="text-xl font-bold m-0">{section.title}</h3>
                    </div>
                    {openSection === section.id ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>

                  {openSection === section.id && (
                    <div className="p-6 pt-0 border-t border-base-300 bg-base-100/50">
                      <p className="mb-4">{section.description}</p>

                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr>
                              <th>Categoría</th>
                              <th>Descripción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.details.map((detail, index) => (
                              <tr key={index}>
                                <td className="font-medium">{detail.category}</td>
                                <td>{detail.description}</td>
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

          {/* Información adicional */}
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Cambios en la Política de Privacidad</h2>
            <p>
              Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio
              publicando la nueva Política de Privacidad en esta página y, si los cambios son significativos, te
              enviaremos una notificación.
            </p>
            <p>Última actualización: Mayo 2024</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary text-white relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes preguntas sobre tu privacidad?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Si tienes alguna pregunta sobre cómo gestionamos tus datos o sobre nuestra política de privacidad, no dudes
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
