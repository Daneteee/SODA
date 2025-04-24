import { RefreshCw } from "lucide-react";

export default function NewsPanel({
  stockSymbol,
  newsOpen,
  setNewsOpen,
  newsLoading,
  newsItems,
  companyName,
}) {
  return (
    <div className="card bg-base-100 shadow-xl h-full flex flex-col">
      <div className="card-body p-4 md:p-6 flex flex-col">
        <div className="flex justify-between items-center overflow-y">
          <h2 className="card-title">Noticias de {stockSymbol}</h2>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setNewsOpen(!newsOpen)}
          >
            {newsOpen ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {newsOpen && (
          <div className="mt-4">
            {newsLoading ? (
              <div className="flex justify-center">
                <RefreshCw className="animate-spin h-6 w-6 text-primary" />
              </div>
            ) : newsItems.length > 0 ? (
              <ul className="space-y-4">
                {newsItems.map((article, index) => (
                  <li key={index} className="border-b pb-2">
                    <a
                      href={`/dashboard/news-detail?article=${encodeURIComponent(
                        JSON.stringify(article)
                      )}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {article.title}
                    </a>
                    <p className="text-sm text-base-content/70">
                      {article.description}
                    </p>
                    <p className="text-xs text-base-content/50">
                      {new Date(article.publishedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base-content/70">No hay noticias disponibles.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
