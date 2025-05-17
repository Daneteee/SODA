"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, MessageSquare, Tag, User, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function PostCard({ post }) {
  const [imageError, setImageError] = useState(false)

  // Formatear la fecha relativa (ej: "hace 2 horas")
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  })
  console.log(post)
  // Truncar el contenido para la vista previa
  const truncatedContent = post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content

  // Mapeo de categorías a colores
  const categoryColors = {
    stocks: "bg-primary/10 text-primary",
    crypto: "bg-secondary/10 text-secondary",
    forex: "bg-accent/10 text-accent",
    analysis: "bg-info/10 text-info",
    news: "bg-warning/10 text-warning",
    other: "bg-neutral/10 text-neutral-content",
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
  
  return (
    <Link href={`/dashboard/posts/${post._id}`}>
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
        {post.image && !imageError ? (
          <figure className="relative h-48 w-full">
            <Image
              src={`${process.env.NEXT_PUBLIC_SERVER_URL}${post.image}`}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </figure>
        ) : (
          <div className="h-48 bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
        )}

        <div className="card-body flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${categoryColors[post.category] || "badge-neutral"}`}>
              <Tag size={12} className="mr-1" />
              {categoryNames[post.category] || post.category || "General"}
            </span>
            <span className="text-xs text-base-content/60 flex items-center">
              <Clock size={12} className="mr-1" />
              {formattedDate}
            </span>
          </div>

          <h2 className="card-title">{post.title}</h2>

          <p className="text-base-content/70 mb-4 break-words line-clamp-1">{truncatedContent}</p>
          <div className="flex items-center mt-auto">
            <div className="avatar mr-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={post.author?.profileImage ? `${process.env.NEXT_PUBLIC_SERVER_URL}${post.author.profileImage}` : "/default-avatar.png"}
                  alt={post.author?.name || "Usuario"}
                  width={32}
                  height={32}
                  className="object-cover w-8 h-8"
                />
              </div>
            </div>
            <span className="text-sm font-medium">{post.author?.name || "Usuario"}</span>
          </div>

          <div className="flex items-center mt-auto pt-4 border-t border-base-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-error">
                <Heart size={16} className="mr-1" />
                <span className="text-sm">{post.likesCount || 0}</span>
              </div>
              <div className="flex items-center text-info">
                <MessageSquare size={16} className="mr-1" />
                <span className="text-sm">{post.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
