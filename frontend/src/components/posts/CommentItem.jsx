"use client"

import { useState } from "react"
import { Trash2, Clock, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import DeleteConfirmModal from "./DeleteConfirmModal"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CommentItem({ comment, currentUser, postId }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const router = useRouter()

  // Verificar si el usuario actual es el autor del comentario
  const isAuthor = currentUser && comment.author && currentUser._id === comment.author._id

  // Formatear la fecha relativa
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: es,
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/comments/${comment._id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        window.location.reload()
      } else {
        throw new Error("Error al eliminar el comentario")
      }
    } catch (err) {
      console.error("Error deleting comment:", err)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-4">
      <div className="avatar placeholder hidden sm:flex">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-base-300 text-base-content flex items-center justify-center">
          <Image
            src={comment.author?.profileImage ? `${process.env.NEXT_PUBLIC_SERVER_URL}${comment.author.profileImage}` : "/default-avatar.png"}
            alt={comment.author?.name || "Usuario"}
            width={40}
            height={40}
            className="object-cover w-10 h-10"
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-base-200/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="avatar placeholder sm:hidden mr-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-base-300 text-base-content flex items-center justify-center">
                  <Image
                    src={comment.author?.profileImage ? `${process.env.NEXT_PUBLIC_SERVER_URL}${comment.author.profileImage}` : "/default-avatar.png"}
                    alt={comment.author?.name || "Usuario"}
                    width={24}
                    height={24}
                    className="object-cover w-6 h-6"
                  />
                </div>
              </div>
              <div className="font-medium">{comment.author?.name || "Usuario"}</div>
              <div className="text-xs text-base-content/60 flex items-center">
                <Clock size={12} className="mr-1" />
                {formattedDate}
              </div>
            </div>

            {isAuthor && (
              <div className="relative">
                <button onClick={() => setShowOptions(!showOptions)} className="btn btn-ghost btn-xs btn-circle">
                  <MoreVertical size={14} />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-1 w-36 bg-base-100 shadow-lg rounded-lg p-2 z-10">
                    <button
                      onClick={() => {
                        setShowOptions(false)
                        setShowDeleteModal(true)
                      }}
                      className="flex items-center gap-2 w-full text-left p-2 text-sm text-error hover:bg-base-200 rounded-md"
                      disabled={isDeleting}
                    >
                      {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : <Trash2 size={14} />}
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="whitespace-pre-line text-base">{comment.content}</p>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar comentario?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este comentario?"
      />
    </div>
  )
}
