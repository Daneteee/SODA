"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import Footer from "@/components/Footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real application, you would send the form data to your backend
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // if (!response.ok) throw new Error('Failed to submit form')

      setFormStatus({
        submitted: true,
        success: true,
        message: "¡Gracias por contactarnos! Te responderemos lo antes posible.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormStatus({
        submitted: true,
        success: false,
        message: "Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setLoading(false)
    }
  }

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
          <MessageSquare className="mt-10 w-20 h-20 mx-auto mb-6 text-white/90" />
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">Contacto</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte. Completa el formulario a continuación o
            utiliza nuestros datos de contacto.
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 px-6 bg-base-100 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6 text-primary">Envíanos un mensaje</h2>

                {formStatus.submitted ? (
                  <div
                    className={`alert ${
                      formStatus.success ? "bg-success/20 text-success" : "bg-error/20 text-error"
                    } mb-6`}
                  >
                    <div className="flex items-center gap-3">
                      {formStatus.success ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                      <span>{formStatus.message}</span>
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Nombre</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className="input input-bordered bg-base-100"
                      required
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className="input input-bordered bg-base-100"
                      required
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Asunto</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Asunto de tu mensaje"
                      className="input input-bordered bg-base-100"
                      required
                    />
                  </div>

                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text">Mensaje</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Escribe tu mensaje aquí..."
                      className="textarea textarea-bordered h-32 bg-base-100"
                      required
                    ></textarea>
                  </div>

                  <div className="form-control">
                    <button type="submit" className={`btn btn-primary ${loading ? "loading" : ""}`} disabled={loading}>
                      {loading ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-6">
              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 text-primary">Información de contacto</h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Email</h3>
                        <p className="text-base-content/80">dan.maldonado.2132@lacetania.cat</p>
                        <p className="text-base-content/80">samuel.hernan.2195@lacetania.cat</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Teléfono</h3>
                        <p className="text-base-content/80">+34 912 345 678</p>
                        <p className="text-base-content/80">Lun - Vie: 9:00 - 18:00</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Dirección</h3>
                        <p className="text-base-content/80">C\ Ubuntu, 404</p>
                        <p className="text-base-content/80">28013 Manresa, España</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="h-64 w-full relative overflow-hidden rounded-lg shadow-xl border border-base-300">
                <iframe
                  src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=es&amp;q=Lacetania+(Mi%20nombre%20de%20negocios)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Social Media */}
              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4 text-primary">Síguenos</h2>
                  <div className="flex gap-4">
                    <button className="btn btn-circle btn-outline">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-twitter"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </button>
                    <button className="btn btn-circle btn-outline">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-facebook"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </button>
                    <button className="btn btn-circle btn-outline">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-instagram"
                      >
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </button>
                    <button className="btn btn-circle btn-outline">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">Preguntas frecuentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h3 className="card-title text-xl text-secondary">¿Cómo puedo crear una cuenta?</h3>
                  <p>
                    Para crear una cuenta, haz clic en el botón "Registrarse" en la esquina superior derecha de la
                    página. Completa el formulario con tus datos y sigue las instrucciones.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h3 className="card-title text-xl text-secondary">¿Cómo funciona la compra de acciones?</h3>
                  <p>
                    Puedes comprar acciones navegando a la sección de mercado, seleccionando la acción que te interesa y
                    haciendo clic en el botón "Comprar". Luego, especifica la cantidad y confirma la transacción.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h3 className="card-title text-xl text-secondary">¿Cómo puedo depositar fondos?</h3>
                  <p>
                    Para depositar fondos, ve a la sección "Cartera" y haz clic en "Depositar". Sigue las instrucciones
                    para completar la transferencia utilizando el método de pago que prefieras.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h3 className="card-title text-xl text-secondary">¿Cómo puedo contactar con soporte?</h3>
                  <p>
                    Puedes contactar con nuestro equipo de soporte a través de este formulario de contacto, enviando un
                    email a soporte@soda.com o llamando al +34 912 345 678 en horario de oficina.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary text-white relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda inmediata?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Nuestro equipo de soporte está disponible para ayudarte con cualquier duda o problema que puedas tener.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="tel:+34912345678" className="btn btn-accent">
              <Phone className="h-5 w-5 mr-2" />
              Llamar ahora
            </Link>
            <Link
              href="mailto:soporte@soda.com"
              className="btn btn-outline text-white border-white hover:bg-white hover:text-primary"
            >
              <Mail className="h-5 w-5 mr-2" />
              Enviar email
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
