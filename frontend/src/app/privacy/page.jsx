"use client";

import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-base-200 overflow-hidden">
      {/* Fondo con burbujas animadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-16 h-16 rounded-full opacity-40 animate-bubble ${
              ["bg-primary", "bg-secondary", "bg-accent"][i % 3]
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `105vh`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
              transform: `scale(${0.5 + Math.random() * 1})`,
            }}
          />
        ))}
      </div>

      {/* Hero más luminoso */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/40 to-accent/40 text-center relative z-10">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Política de Privacidad
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Tu privacidad es importante para nosotros. Aquí te explicamos cómo protegemos tus datos.
          </p>
        </div>
      </section>

      {/* Secciones de la política */}
      <section className="py-16 px-6 bg-base-100 relative z-10">
        <div className="container mx-auto max-w-4xl space-y-10">
          {[
            {
              title: "1. Datos que Recopilamos",
              content:
                "Recopilamos información personal como nombre, correo electrónico y número de teléfono, así como datos de navegación y uso de la plataforma.",
            },
            {
              title: "2. Uso de la Información",
              content:
                "Utilizamos tus datos para mejorar tu experiencia en la plataforma, enviar notificaciones relevantes y personalizar el contenido.",
            },
            {
              title: "3. Compartir Información",
              content:
                "No compartimos tus datos personales con terceros sin tu consentimiento, salvo cuando sea requerido por ley o para servicios esenciales.",
            },
            {
              title: "4. Seguridad de los Datos",
              content:
                "Implementamos medidas de seguridad como cifrado y autenticación para proteger tu información contra accesos no autorizados.",
            },
            {
              title: "5. Cookies y Tecnologías",
              content:
                "Usamos cookies para recordar tus preferencias, mejorar la navegación y analizar el uso del sitio. Puedes gestionar tus cookies desde la configuración del navegador.",
            },
            {
              title: "6. Tus Derechos",
              content:
                "Puedes acceder, modificar o eliminar tus datos personales. También puedes solicitar una copia o retirar tu consentimiento en cualquier momento.",
            },
          ].map(({ title, content }, index) => (
            <div key={index}>
              <h2 className="text-2xl font-bold mb-2 text-accent">{title}</h2>
              <p className="text-base text-base-content/80">{content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary text-white relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes preguntas sobre tu privacidad?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Nuestro equipo de soporte está listo para ayudarte con cualquier duda o inquietud relacionada con tus datos.
          </p>
          <a
            href="mailto:soporte@archivador.com"
            className="btn btn-outline text-white border-white hover:bg-white hover:text-primary"
          >
            Contactar Soporte
          </a>
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
            opacity: 0.4;
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
  );
}
