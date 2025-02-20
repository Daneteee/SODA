"use client"
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Globe, Users, DollarSign, Activity, Award, Newspaper, AlertCircle, ChevronUp, ChevronDown, Clock } from 'lucide-react';

const StockDetail = () => {
  const [timeframe, setTimeframe] = useState('1D');

  // Datos simulados para el gráfico
  const stockData = {
    '1D': Array.from({length: 24}, (_, i) => ({
      time: `${i}:00`,
      price: 170 + Math.sin(i/2) * 5 + Math.random() * 2
    })),
    '1W': Array.from({length: 7}, (_, i) => ({
      time: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
      price: 168 + Math.sin(i) * 8 + Math.random() * 3
    })),
    '1M': Array.from({length: 30}, (_, i) => ({
      time: `${i + 1}`,
      price: 165 + Math.sin(i/3) * 10 + Math.random() * 5
    })),
  };

  const companyNews = [
    {
      id: 1,
      title: "Amazon expande su red logística con nuevos centros en Europa",
      time: "Hace 2 horas",
      source: "Financial Times",
      impact: "positive"
    },
    {
      id: 2,
      title: "Resultados Q4: Amazon supera expectativas con ingresos de $141B",
      time: "Hace 5 horas",
      source: "Bloomberg",
      impact: "positive"
    },
    {
      id: 3,
      title: "AWS lanza nueva tecnología de IA para competir con Microsoft",
      time: "Hace 1 día",
      source: "Reuters",
      impact: "neutral"
    },
    {
      id: 4,
      title: "Reguladores europeos investigan prácticas de Amazon",
      time: "Hace 2 días",
      source: "The Wall Street Journal",
      impact: "negative"
    }
  ];

  const volumeData = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    volume: Math.random() * 1000000 + 500000
  }));

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded-full bg-base-100 p-2">
              <img src="https://logo.clearbit.com/amazon.com" alt="Amazon Logo" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Amazon.com Inc (AMZN)</h1>
            <p className="text-base-content/60">NASDAQ • USD</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-3xl font-bold">$172.45</div>
          <div className="flex items-center gap-2 text-error">
            <TrendingDown className="h-5 w-5" />
            <span className="font-semibold">-1.12% (-$1.95)</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Gráfico de Precio</h2>
                <div className="join">
                  {['1D', '1W', '1M'].map((time) => (
                    <button
                      key={time}
                      className={`join-item btn btn-sm ${timeframe === time ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setTimeframe(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stockData[timeframe]}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--p))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--p))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="price" stroke="hsl(var(--p))" fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Volumen de Operaciones</h2>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--s))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--s))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="volume" stroke="hsl(var(--s))" fillOpacity={1} fill="url(#colorVolume)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section - 1 column */}
        <div className="space-y-6">
          {/* Company Stats */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Información de la Empresa</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>Capitalización</span>
                  </div>
                  <span className="font-mono font-bold">$1.79T</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Empleados</span>
                  </div>
                  <span className="font-mono font-bold">1.6M</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span>P/E Ratio</span>
                  </div>
                  <span className="font-mono font-bold">72.5</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>Beta</span>
                  </div>
                  <span className="font-mono font-bold">1.24</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Dividendo</span>
                  </div>
                  <span className="font-mono font-bold">N/A</span>
                </div>
              </div>
            </div>
          </div>

          {/* News Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <Newspaper className="h-5 w-5" />
                Últimas Noticias
              </h2>
              <div className="space-y-4">
                {companyNews.map((news) => (
                  <div key={news.id} className="border-b border-base-200 last:border-none pb-4 last:pb-0">
                    <div className="flex items-start gap-2">
                      <div className={`badge ${
                        news.impact === 'positive' ? 'badge-success' : 
                        news.impact === 'negative' ? 'badge-error' : 
                        'badge-ghost'
                      } badge-sm mt-1`}>
                        {news.impact === 'positive' ? <ChevronUp className="h-3 w-3" /> : 
                         news.impact === 'negative' ? <ChevronDown className="h-3 w-3" /> : 
                         <AlertCircle className="h-3 w-3" />}
                      </div>
                      <div>
                        <h3 className="font-medium leading-tight mb-1">{news.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                          <Clock className="h-3 w-3" />
                          <span>{news.time}</span>
                          <span>•</span>
                          <span>{news.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Acerca de Amazon</h2>
              <p className="text-base-content/80">
                Amazon.com, Inc. es una compañía tecnológica multinacional estadounidense que se centra en comercio electrónico, 
                computación en la nube, streaming digital y inteligencia artificial. Es una de las empresas más valiosas del mundo 
                y es considerada una de las cinco grandes empresas de tecnología junto con Google, Apple, Microsoft y Meta.
              </p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Sectores Principales</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="badge badge-primary">E-commerce</div>
                  <div className="badge badge-primary">Cloud Computing</div>
                  <div className="badge badge-primary">Streaming</div>
                  <div className="badge badge-primary">AI</div>
                  <div className="badge badge-primary">Retail</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;