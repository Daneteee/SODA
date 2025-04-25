"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function NewsDetailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState(null);
  const [otherNews, setOtherNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  const symbolFromQuery = searchParams.get("symbol");

  useEffect(() => {
    const articleData = searchParams.get("article");
    if (articleData) {
      try {
        setArticle(JSON.parse(articleData));
      } catch (err) {
        console.error("Error al parsear los datos de la noticia:", err);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (symbolFromQuery) {
      fetchOtherNews(symbolFromQuery);
    }
  }, [symbolFromQuery]);

  const fetchOtherNews = async (symbol) => {
    setNewsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/market/news?symbol=${symbol}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setOtherNews(data.articles || data);
      } else {
        console.error("Error al obtener noticias:", await res.json());
      }
    } catch (err) {
      console.error("Error en la carga de noticias:", err);
    }
    setNewsLoading(false);
  };

  if (!article) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <p className="text-xl text-base-content">
          No hay datos de la noticia.
        </p>
      </div>
    );
  }

  return (
    <div className="container bg-base-200 mx-auto p-4 md:p-6 min-h-screen">
      <button
        onClick={() => router.back()}
        className="btn btn-ghost mb-4 text-base-content"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalle principal */}
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
                <p className="mt-4 text-base-content">
                  {article.description}
                </p>
              )}
              <div className="divider" />
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

        {/* Otras noticias */}
        <div>
          <div className="card bg-base-100 shadow-xl h-full flex flex-col">
            <div className="card-body flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="card-title text-base-content">
                  Otras noticias de {symbolFromQuery}
                </h3>
                <button
                  className="btn btn-sm btn-ghost text-base-content"
                  onClick={() => setNewsOpen((o) => !o)}
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
                      {otherNews.map((news, i) => (
                        <li key={i} className="border-b pb-2">
                          <a
                            href={`/dashboard/news-detail?article=${encodeURIComponent(
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
