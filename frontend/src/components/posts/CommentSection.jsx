"use client"

import { useState } from "react"
import CommentItem from "./CommentItem"
import { MessageSquare, Send, User } from "lucide-react"

export default function CommentSection({ comments, postId, onAddComment, currentUser }) {
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const success = await onAddComment(newComment)

      if (success) {
        setNewComment("")
      } else {
        setError("No se pudo publicar el comentario. Inténtalo de nuevo.")
      }
    } catch (err) {
      console.error("Error submitting comment:", err)
      setError("Ocurrió un error al publicar el comentario.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-6 md:p-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <MessageSquare size={24} className="text-primary" />
          Comentarios ({comments.length})
        </h2>

        {/* Formulario para añadir comentario */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start gap-4">
            <div className="avatar placeholder hidden sm:flex">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center">
                <User size={20} />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="textarea textarea-bordered w-full min-h-[100px] focus:border-primary"
                rows="3"
                disabled={submitting}
              ></textarea>

              {error && <div className="text-error text-sm mt-2">{error}</div>}

              <div className="flex justify-end mt-3">
                <button type="submit" className="btn btn-primary gap-2" disabled={!newComment.trim() || submitting}>
                  {submitting ? <span className="loading loading-spinner loading-xs"></span> : <Send size={16} />}
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Separador */}
        <div className="divider my-2">
          <span className="text-base-content/50 text-sm">Comentarios recientes</span>
        </div>

        {/* Lista de comentarios */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} currentUser={currentUser} postId={postId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-base-200/50 rounded-lg">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-base-content/60 font-medium">No hay comentarios aún</p>
            <p className="text-sm text-base-content/50 mt-1">¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  )
}
