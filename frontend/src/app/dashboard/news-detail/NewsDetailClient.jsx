"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, User } from "lucide-react";

export default function NewsDetailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState(null);

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

  if (!article) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-base-content">
          No hay datos de la noticia.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <button
        onClick={() => router.back()}
        className="btn btn-ghost mb-6 text-base-content hover:bg-base-200"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          {article.urlToImage && (
            <figure className="relative">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-base-100 to-transparent opacity-50"></div>
            </figure>
          )}
          <div className="card-body">
            <div className="flex items-center gap-4 text-sm text-base-content/60 mb-4">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(article.publishedAt).toLocaleString()}</span>
              </div>
            </div>

            <h1 className="card-title text-3xl font-bold text-base-content mb-4">
              {article.title}
            </h1>

            {article.description && (
              <p className="text-lg text-base-content/80 mb-6">
                {article.description}
              </p>
            )}

            <div className="divider" />

            {article.content && (
              <div className="prose prose-lg max-w-none">
                <p className="text-base-content whitespace-pre-line">
                  {article.content}
                </p>
              </div>
            )}

            <div className="mt-8">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                Leer noticia completa
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
