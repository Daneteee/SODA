import Link from "next/link";
"use client";
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-base-200">
      {/* SVGs de burbujas animadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-16 h-16 rounded-full opacity-50 animate-bubble`}
            style={{
              backgroundColor: ["#00CDB7", "#FF52D9", "#7480FF"][i % 3],
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 10}%`, // Empiezan desde abajo
              animationDelay: `${Math.random() * 10}s`, // Más variación en los delays
              animationDuration: `${8 + Math.random() * 7}s`, // Duraciones más largas
              transform: `scale(${0.5 + Math.random() * 1})`, // Tamaños variables
            }}
          />
        ))}
      </div>

      {/* Hero section */}
      <div className="hero min-h-screen bg-transparent relative z-10">
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

      {/* Animaciones CSS */}
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