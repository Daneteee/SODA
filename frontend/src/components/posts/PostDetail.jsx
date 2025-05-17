"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageSquare, Calendar, Tag, Share2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PostDetail({ post, likesCount, userLiked, onLikeToggle }) {
  const [imageError, setImageError] = useState(false)

  // Formatear la fecha completa
  const formattedDate = format(new Date(post.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", {
    locale: es,
  })

  // Mapeo de categorías a colores
  const categoryColors = {
    stocks: "badge-primary",
    crypto: "badge-secondary",
    forex: "badge-accent",
    analysis: "badge-info",
    news: "badge-warning",
    other: "badge-neutral",
  }

  // Mapeo de categorías a nombres en español
  const categoryNames = {
    stocks: "Acciones",
    crypto: "Criptomonedas",
    forex: "Forex",
    analysis: "Análisis",
    news: "Noticias",
    other: "Otros",
  }

  // Función para compartir el post
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + "...",
        url: window.location.href,
      })
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Enlace copiado al portapapeles")
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl mb-8">

        <figure className="relative h-64 md:h-96 w-full">
            <img src={`${process.env.NEXT_PUBLIC_SERVER_URL}${post.image}`} alt={post.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover" 
            onError={() => setImageError(true)}/>
        </figure>


      <div className="card-body">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`badge ${categoryColors[post.category] || "badge-neutral"}`}>
            <Tag size={12} className="mr-1" />
            {categoryNames[post.category] || post.category || "General"}
          </span>

          {post.tags &&
            post.tags.map((tag) => (
              <span key={tag} className="badge badge-outline">
                #{tag}
              </span>
            ))}

          <span className="text-xs text-base-content/60 flex items-center ml-auto">
            <Calendar size={12} className="mr-1" />
            {formattedDate}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center mb-6">
          <div className="avatar mr-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral text-neutral-content flex items-center justify-center">
              <Image
                src={post.author?.profileImage ? `${process.env.NEXT_PUBLIC_SERVER_URL}${post.author.profileImage}` : "/default-avatar.png"}
                alt={post.author?.name || "Usuario"}
                width={40}
                height={40}
                className="object-cover w-10 h-10"
              />
            </div>
          </div>
          <span className="font-medium">{post.author?.name || "Usuario"}</span>
        </div>

        <div className="max-w-none mb-6 break-words">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-base-300">
          <div className="flex items-center gap-4">
            <button onClick={onLikeToggle} className={`btn btn-sm gap-2 ${userLiked ? "btn-error" : "btn-outline"}`}>
              <Heart size={16} className={userLiked ? "fill-current" : ""} />
              {likesCount}
            </button>

            <div className="flex items-center text-info">
              <MessageSquare size={16} className="mr-1" />
              <span>{post.commentsCount || 0}</span>
            </div>
          </div>

          <button onClick={handleShare} className="btn btn-ghost btn-sm">
            <Share2 size={16} className="mr-1" />
            Compartir
          </button>
        </div>
      </div>
    </div>
  )
}
