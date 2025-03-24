"use client";

import Link from "next/link";
import { 
  Users, 
  Newspaper, 
  TrendingUp, 
  Shield, 
  MessageCircle, 
  PieChart 
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Comunidades de Inversión",
      description: "Conecta con inversores, comparte estrategias y aprende de expertos en nuestras comunidades interactivas.",
      color: "text-primary"
    },
    {
      icon: Newspaper,
      title: "Noticias en Tiempo Real",
      description: "Mantente informado con análisis de mercado, reportes exclusivos y alertas instantáneas.",
      color: "text-secondary"
    },
    {
      icon: TrendingUp,
      title: "Herramientas de Análisis",
      description: "Gráficos avanzados, predicciones algorítmicas y seguimiento de tendencias de mercado.",
      color: "text-accent"
    }
  ];

  const communityTestimonials = [
    {
      name: "María Rodríguez",
      role: "Inversora Principiante",
      quote: "Gracias a Soda, he aprendido más sobre inversiones en un mes que en años por mi cuenta.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Carlos Martínez",
      role: "Trader Profesional",
      quote: "Las comunidades de Soda me han permitido compartir mis estrategias y aprender de otros inversores.",
      avatar: "https://randomuser.me/api/portraits/men/79.jpg"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-200">
      {/* Bubble Animations (from original code) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-16 h-16 rounded-full opacity-50 animate-bubble ${["bg-primary", "bg-secondary", "bg-accent"][i % 3]}`}
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


      {/* Hero section (from original code) */}
      <div className="hero min-h-screen bg-transparent">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-7xl font-bold mb-8">
              <span className="text-primary drop-shadow-[0_0_30px_rgba(126,34,206,0.7)]">
                Burbujeando
              </span>
              {" "}tus inversiones
            </h1>
            <h2 className="text-5xl font-bold mb-8">
              La plataforma más segura
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                para tus finanzas
              </span>
            </h2>
            <p className="py-6 text-xl text-base-content/60">
              SODA añade la seguridad que necesitas a tus inversiones
              para que puedas hacer crecer tu dinero más rápido que nunca.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <button className="btn btn-primary btn-lg">Comenzar ahora →</button>
              <button className="btn btn-neutral btn-lg">Cómo funciona</button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-base-100 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Lo que hace único a <span className="bg-gradient-to-r from-pink-500 via-blue-500 to-cyan-500 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">SODA</span></h2>
            <p className="text-xl text-base-content/70">Descubre las herramientas que transformarán tu forma de invertir</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="card-body items-center text-center">
                  <feature.icon className={`w-16 h-16 mb-4 ${feature.color}`} />
                  <h3 className="card-title text-2xl mb-4">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestros <span className="text-primary">Inversores</span></h2>
            <p className="text-xl text-base-content/70">Historias reales de crecimiento y éxito</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {communityTestimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <div className="avatar mr-4">
                      <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={testimonial.avatar} alt={testimonial.name} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{testimonial.name}</h3>
                      <p className="text-base-content/70">{testimonial.role}</p>
                    </div>
                  </div>
                  <blockquote className="italic text-base-content/80">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-5xl font-bold mb-6">Comienza tu viaje financiero</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a miles de inversores que ya están transformando sus finanzas con SODA. 
            No dejes que el miedo te detenga, la inversión inteligente está a un clic de distancia.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn btn-ghost btn-lg text-white border-2">Más Información</button>
            <button className="btn btn-accent btn-lg">Crear Cuenta Gratis</button>
          </div>
        </div>
      </section>

      {/* Bubble Animation Styles (from original code) */}
      <style jsx>{`
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
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