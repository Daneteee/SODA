"use client"

import { useState } from "react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { FileText, Shield, Book, Scale, ChevronDown, ChevronUp } from 'lucide-react'

export default function TermsPage() {
  const [openSection, setOpenSection] = useState("acceptance")

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const termsSections = [
    {
      id: "acceptance",
      title: "1. Aceptación de los Términos",
      icon: Shield,
      color: "text-primary",
      description:
        "Al acceder a nuestra plataforma, aceptas estos términos. Si no estás de acuerdo, por favor no utilices nuestros servicios.",
      details: [
        { point: "Vinculación legal", description: "Estos términos constituyen un acuerdo legalmente vinculante entre tú y SODA." },
        { point: "Capacidad legal", description: "Al usar nuestros servicios, confirmas que tienes la capacidad legal para aceptar estos términos." },
        { point: "Actualizaciones", description: "Te recomendamos revisar periódicamente estos términos, ya que pueden ser actualizados." },
      ],
    },
    {
      id: "permitted-use",
      title: "2. Uso Permitido",
      icon: Book,
      color: "text-secondary",
      description:
        "SODA es una herramienta educativa. No somos asesores financieros ni garantizamos resultados. El uso indebido resultará en suspensión.",
      details: [
        { point: "Uso personal", description: "La plataforma está destinada únicamente para uso personal y no comercial." },
        { point: "Restricciones", description: "No está permitido usar la plataforma para actividades ilegales o que violen derechos de terceros." },
        { point: "Suspensión", description: "Nos reservamos el derecho de suspender o terminar tu acceso si detectamos uso indebido." },
      ],
    },
    {
      id: "security",
      title: "3. Seguridad y Cuenta",
      icon: Scale,
      color: "text-accent",
      description:
        "Es tu responsabilidad proteger tus credenciales. No compartas tu cuenta y notifícanos ante cualquier actividad sospechosa.",
      details: [
        { point: "Credenciales", description: "Eres responsable de mantener la confidencialidad de tus credenciales de acceso." },
        { point: "Uso no autorizado", description: "Debes notificarnos inmediatamente si sospechas de cualquier uso no autorizado de tu cuenta." },
        { point: "Verificación", description: "Podemos implementar medidas de verificación adicionales para proteger tu cuenta." },
      ],
    },
    {
      id: "intellectual-property",
      title: "4. Propiedad Intelectual",
      icon: FileText,
      color: "text-info",
      description:
        "Todo el contenido (gráficos, código, marca) pertenece a SODA. No está permitido copiar, modificar ni distribuir sin permiso.",
      details: [
        { point: "Derechos reservados", description: "Todos los derechos de propiedad intelectual sobre el contenido y software son propiedad de SODA." },
        { point: "Licencia limitada", description: "Se te otorga una licencia limitada, no exclusiva y no transferible para usar la plataforma." },
        { point: "Restricciones", description: "No puedes copiar, modificar, distribuir o crear trabajos derivados sin autorización expresa." },
      ],
    },
    {
      id: "modifications",
      title: "5. Modificaciones",
      icon: Book,
      color: "text-primary",
      description:
        "Nos reservamos el derecho de actualizar estos términos. Las modificaciones serán notificadas a través del sitio web.",
      details: [
        { point: "Notificaciones", description: "Te notificaremos sobre cambios significativos en los términos a través de la plataforma." },
        { point: "Aceptación implícita", description: "El uso continuado de la plataforma después de los cambios implica la aceptación de los nuevos términos." },
        { point: "Versiones anteriores", description: "Mantenemos un archivo de versiones anteriores de los términos que puedes consultar si lo solicitas." },
      ],
    },
    {
      id: "contact",
      title: "6. Contacto",
      icon: Shield,
      color: "text-secondary",
      description:
        "Para cualquier consulta legal o reporte de abuso, contáctanos en soporte@soda.com.",
      details: [
        { point: "Soporte legal", description: "Nuestro equipo legal está disponible para resolver cualquier duda sobre estos términos." },
        { point: "Reportes", description: "Puedes reportar cualquier violación de estos términos a través de nuestros canales de soporte." },
        { point: "Tiempo de respuesta", description: "Nos comprometemos a responder a tus consultas legales en un plazo razonable." },
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
          <FileText className="mt-10 w-20 h-20 mx-auto mb-6 text-white/90" />
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Información detallada sobre los términos legales que rigen el uso de SODA
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 px-6 bg-base-100 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Acuerdo de Uso</h2>
            <p>
              Estos Términos y Condiciones constituyen un acuerdo legalmente vinculante entre tú y SODA, que rige tu uso de nuestra plataforma y servicios. Al acceder o utilizar SODA, aceptas cumplir y quedar vinculado por estos términos.
            </p>
            <p>
              Te recomendamos leer detenidamente este documento, ya que contiene información importante sobre tus derechos y obligaciones al utilizar nuestra plataforma.
            </p>
          </div>

          {/* Secciones de términos */}
          <div className="space-y-6 mb-12">
            <h2 className="text-3xl font-bold text-primary mb-6">Nuestros Términos</h2>

            {termsSections.map((section) => (
              <div key={section.id} className="card bg-base-200 shadow-xl overflow-hidden border border-base-300">
                <div className="card-body p-0">
                  <div className="p-6 cursor-pointer flex items-center justify-between" onClick={() => toggleSection(section.id)}>
                    <div className="flex items-center gap-4">
                      <section.icon className={`w-8 h-8 ${section.color}`} />
                      <h3 className="text-xl font-bold m-0">{section.title}</h3>
                    </div>
                    {openSection === section.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>

                  {openSection === section.id && (
                    <div className="p-6 pt-0 border-t border-base-300 bg-base-100/50">
                      <p className="mb-4">{section.description}</p>

                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr>
                              <th>Punto</th>
                              <th>Descripción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.details.map((detail, index) => (
                              <tr key={index}>
                                <td className="font-medium">{detail.point}</td>
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
            <h2 className="text-3xl font-bold text-primary mb-4">Cambios en los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma. Tu uso continuado de SODA después de la publicación de los cambios constituirá tu aceptación de dichos cambios.
            </p>
            <p>Última actualización: Mayo 2024</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary text-white relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes preguntas sobre nuestros términos?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Si tienes alguna pregunta sobre nuestros términos y condiciones o sobre cualquier aspecto legal de nuestro servicio, no dudes en ponerte en contacto con nosotros.
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
