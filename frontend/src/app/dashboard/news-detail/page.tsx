"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface NewsArticle {
  urlToImage?: string;
  title: string;
  author?: string;
  publishedAt: string;
  description?: string;
  content?: string;
  url: string;
}

export default function NewsDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState<{
    urlToImage?: string;
    title: string;
    author?: string;
    publishedAt: string;
    description?: string;
    content?: string;
    url: string;
  } | null>(null);
  const [otherNews, setOtherNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  // Se espera recibir también el símbolo para buscar otras noticias
  const symbolFromQuery = searchParams.get("symbol");

  useEffect(() => {
    const articleData = searchParams.get("article");
    if (articleData) {
      try {
        setArticle(JSON.parse(articleData));
      } catch (error) {
        console.error("Error al parsear los datos de la noticia:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (symbolFromQuery) {
      fetchOtherNews(symbolFromQuery);
    }
  }, [symbolFromQuery]);

  const fetchOtherNews = async (symbol: string) => {
    setNewsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/market/news?symbol=${symbol}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al obtener noticias:", errorData);
      } else {
        const data = await response.json();
        // Se espera que el backend devuelva { articles: [...] }
        setOtherNews(data.articles || data);
      }
    } catch (error) {
      console.error("Error en la carga de noticias:", error);
    }
    setNewsLoading(false);
  };

  if (!article) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <p className="text-xl text-base-content">No hay datos de la noticia.</p>
      </div>
    );
  }

  return (
    <div className="container bg-base-200 mx-auto p-4 md:p-6 min-h-screen">
        {/* Botón de regresar */}
        <button
            onClick={() => router.back()}
            className="btn btn-ghost mb-4 text-base-content"
        >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal: Detalle de la noticia */}
            <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
                {article.urlToImage && (
                <figure>
                    <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-80 object-cover"
                    />
                </figure>
                )}
                <div className="card-body">
                <h2 className="card-title text-2xl text-base-content">
                    {article.title}
                </h2>
                <p className="text-sm text-base-content/60">
                    {article.author ? `Por ${article.author} - ` : ""}
                    {new Date(article.publishedAt).toLocaleString()}
                </p>
                {article.description && (
                    <p className="mt-4 text-base-content">{article.description}</p>
                )}
                <div className="divider"></div>
                {article.content && (
                    <p className="text-base-content">{article.content}</p>
                )}
                <div className="mt-4">
                    <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    >
                    Leer noticia completa
                    </a>
                </div>
                </div>
            </div>
            </div>

            {/* Columna lateral: Otras noticias */}
            <div>
            <div className="card bg-base-100 shadow-xl h-full flex flex-col">
                <div className="card-body flex flex-col">
                <div className="flex justify-between items-center">
                    <h3 className="card-title text-base-content">
                    Otras noticias de {symbolFromQuery}
                    </h3>
                    <button
                    className="btn btn-sm btn-ghost text-base-content"
                    onClick={() => setNewsOpen(!newsOpen)}
                    >
                    {newsOpen ? "Ocultar" : "Mostrar"}
                    </button>
                </div>
                {newsOpen && (
                    <div className="mt-4 overflow-y-auto max-h-96">
                    {newsLoading ? (
                        <div className="flex justify-center py-4">
                        <RefreshCw className="animate-spin h-6 w-6 text-primary" />
                        </div>
                    ) : otherNews.length > 0 ? (
                        <ul className="space-y-4">
                        {otherNews.map((news, index) => (
                            <li key={index} className="border-b pb-2">
                            <a
                                href={`/news-detail?article=${encodeURIComponent(
                                JSON.stringify(news)
                                )}&symbol=${symbolFromQuery}`}
                                className="text-lg font-semibold text-primary hover:underline"
                            >
                                {news.title}
                            </a>
                            <p className="text-xs text-base-content/60">
                                {new Date(news.publishedAt).toLocaleString()}
                            </p>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-base-content/60">
                        No hay otras noticias disponibles.
                        </p>
                    )}
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
  );
}
