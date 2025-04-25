"use client";

import { LineChart, Newspaper, BarChart3, MessageCircle, Zap, Layout, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Descubre Archivador</h1>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            La plataforma de inversión más completa que combina datos de mercado en tiempo real, 
            noticias financieras y una comunidad activa para ayudarte a tomar mejores decisiones de inversión.
          </p>
          <button className="btn btn-primary btn-lg">Comenzar ahora</button>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Nuestras características principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <LineChart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="card-title text-2xl mb-2">Mercado en tiempo real</h3>
                <p>
                  Accede a datos de mercado en tiempo real con actualizaciones instantáneas de precios, 
                  gráficos interactivos y alertas personalizadas.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <Newspaper className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="card-title text-2xl mb-2">Noticias financieras</h3>
                <p>
                  Mantente informado con las últimas noticias sobre empresas, análisis de expertos y 
                  eventos que afectan a tus inversiones.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-accent" />
                </div>
                <h3 className="card-title text-2xl mb-2">Gestión de cartera</h3>
                <p>
                  Herramientas avanzadas para seguir y analizar tu cartera, con métricas de rendimiento 
                  y recomendaciones personalizadas.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="card-title text-2xl mb-2">Comunidad y chat</h3>
                <p>
                  Conecta con otros inversores, comparte estrategias y participa en discusiones 
                  en tiempo real sobre el mercado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 bg-base-100">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">¿Por qué elegirnos?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reason 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Zap className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Actualizaciones en tiempo real</h3>
                <p className="text-lg">
                  Nuestros datos se actualizan al instante, permitiéndote reaccionar rápidamente a los 
                  cambios del mercado y tomar decisiones informadas en el momento oportuno.
                </p>
              </div>
            </div>

            {/* Reason 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Layout className="w-12 h-12 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Interfaz intuitiva</h3>
                <p className="text-lg">
                  Diseñada pensando en la experiencia del usuario, nuestra plataforma es fácil de usar 
                  tanto para principiantes como para inversores experimentados.
                </p>
              </div>
            </div>

            {/* Reason 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <TrendingUp className="w-12 h-12 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Análisis completo</h3>
                <p className="text-lg">
                  Herramientas de análisis técnico y fundamental que te ayudan a entender el rendimiento 
                  pasado y predecir tendencias futuras.
                </p>
              </div>
            </div>

            {/* Reason 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Comunidad activa</h3>
                <p className="text-lg">
                  Forma parte de una comunidad vibrante de inversores que comparten conocimientos, 
                  estrategias y apoyo mutuo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h3 className="text-5xl font-bold text-primary mb-2">50K+</h3>
                <p className="text-xl">Usuarios activos</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h3 className="text-5xl font-bold text-secondary mb-2">10K+</h3>
                <p className="text-xl">Acciones seguidas</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h3 className="text-5xl font-bold text-accent mb-2">1M+</h3>
                <p className="text-xl">Transacciones diarias</p>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h3 className="text-5xl font-bold text-primary mb-2">5K+</h3>
                <p className="text-xl">Publicaciones en la comunidad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Lo que dicen nuestros usuarios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="avatar placeholder mr-4">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                      <span>MR</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold">María Rodríguez</h3>
                    <p className="text-sm opacity-70">Inversora particular</p>
                  </div>
                </div>
                <p className="italic">
                  "Archivador ha transformado mi forma de invertir. Los datos en tiempo real y las 
                  noticias me permiten tomar decisiones más informadas. ¡Mi cartera ha crecido un 30% desde que empecé a usar la plataforma!"
                </p>
                <div className="flex mt-4">
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="avatar placeholder mr-4">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                      <span>JL</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold">Javier López</h3>
                    <p className="text-sm opacity-70">Trader profesional</p>
                  </div>
                </div>
                <p className="italic">
                  "Como trader profesional, necesito herramientas rápidas y fiables. Archivador ofrece 
                  exactamente eso, con una interfaz intuitiva y datos precisos. La comunidad es un gran 
                  valor añadido para compartir estrategias."
                </p>
                <div className="flex mt-4">
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="avatar placeholder mr-4">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                      <span>AG</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold">Ana García</h3>
                    <p className="text-sm opacity-70">Inversora principiante</p>
                  </div>
                </div>
                <p className="italic">
                  "Empecé a invertir hace poco y Archivador ha sido mi guía. La plataforma es fácil de 
                  usar y la comunidad me ha ayudado a aprender rápidamente. Las noticias y análisis son 
                  perfectos para entender el mercado."
                </p>
                <div className="flex mt-4">
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5 mr-1" />
                  <CheckCircle className="text-success w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-content">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Únete a nuestra comunidad de inversores</h2>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            Comienza hoy mismo a tomar mejores decisiones de inversión con datos en tiempo real, 
            noticias actualizadas y una comunidad activa de inversores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-secondary btn-lg">Registrarse gratis</button>
            <button className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary">
              Ver planes
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
