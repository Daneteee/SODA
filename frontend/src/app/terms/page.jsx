"use client";

import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-base-200 overflow-hidden">
      {/* Burbuja Animada de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-16 h-16 rounded-full opacity-40 animate-bubble ${
              ["bg-primary", "bg-secondary", "bg-accent"][i % 3]
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `105vh`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${7 + Math.random() * 5}s`,
              transform: `scale(${0.5 + Math.random() * 1.2})`,
            }}
          />
        ))}
      </div>

      {/* Hero brillante y texto blanco */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/40 to-secondary/40 text-center relative z-10">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Última actualización: Abril 2025 — Por favor, revisa estos términos cuidadosamente.
          </p>
        </div>
      </section>

      {/* Contenido Legal */}
      <section className="py-16 px-6 bg-base-100 relative z-10">
        <div className="container mx-auto max-w-4xl space-y-10">
          {[
            {
              title: "1. Aceptación de los Términos",
              content:
                "Al acceder a nuestra plataforma, aceptas estos términos. Si no estás de acuerdo, por favor no utilices nuestros servicios.",
            },
            {
              title: "2. Uso Permitido",
              content:
                "Archivador es una herramienta educativa. No somos asesores financieros ni garantizamos resultados. El uso indebido resultará en suspensión.",
            },
            {
              title: "3. Seguridad y Cuenta",
              content:
                "Es tu responsabilidad proteger tus credenciales. No compartas tu cuenta y notifícanos ante cualquier actividad sospechosa.",
            },
            {
              title: "4. Propiedad Intelectual",
              content:
                "Todo el contenido (gráficos, código, marca) pertenece a Archivador. No está permitido copiar, modificar ni distribuir sin permiso.",
            },
            {
              title: "5. Modificaciones",
              content:
                "Nos reservamos el derecho de actualizar estos términos. Las modificaciones serán notificadas a través del sitio web.",
            },
            {
              title: "6. Contacto",
              content:
                "Para cualquier consulta legal o reporte de abuso, contáctanos en soporte@archivador.com.",
            },
          ].map(({ title, content }, index) => (
            <div key={index}>
              <h2 className="text-2xl font-bold mb-2 text-primary">{title}</h2>
              <p className="text-base text-base-content/80">{content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-accent text-white relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes dudas legales o necesitas ayuda?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Nuestro equipo de soporte puede aclarar cualquier detalle de nuestros términos de uso.
          </p>
          <a
            href="mailto:soporte@archivador.com"
            className="btn btn-outline text-white border-white hover:bg-white hover:text-primary"
          >
            Contactar Soporte Legal
          </a>
        </div>
      </section>

      <Footer />

      {/* Estilos de animación de burbujas */}
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
