import Link from "next/link";

export default function Home() {
  return (

    <div className="min-h-screen bg-base-200">
      {/* Hero section */}
      <div className="hero min-h-[calc(100vh-64px)] bg-base-200">
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
    </div>
  );
}