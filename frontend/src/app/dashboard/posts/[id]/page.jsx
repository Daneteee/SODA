"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw, Edit, Trash2, AlertTriangle } from "lucide-react"
import PostDetail from "@/components/posts/PostDetail" 
import CommentSection from "@/components/posts/CommentSection"
import DeleteConfirmModal from "@/components/posts/DeleteConfirmModal"

export default function PostDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthor, setIsAuthor] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Primero obtener el perfil del usuario
        const userProfile = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
          credentials: "include",
        })

        if (!userProfile.ok) {
          throw new Error("No se pudo cargar el perfil del usuario")
        }

        const userData = await userProfile.json()
        setCurrentUser(userData)

        // Fetch post details
        const postResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
          credentials: "include",
        })

        if (!postResponse.ok) {
          throw new Error("No se pudo cargar el post")
        }

        const postResult = await postResponse.json()
        setPost(postResult.data)
        setIsAuthor(userData._id === postResult.data.author._id)

        // Fetch likes del post
        const likesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/likes`, {
          credentials: "include",
        })

        if (likesResponse.ok) {
          const likesResult = await likesResponse.json()
          const likesData = Array.isArray(likesResult.data) ? likesResult.data : []
          setLikesCount(likesData.length)
          setUserLiked(likesData.some(like => like.user._id === userData._id))
        }

        // Fetch comments
        const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/comments`, {
          credentials: "include",
        })

        if (commentsResponse.ok) {
          const commentsResult = await commentsResponse.json()
          const commentsData = Array.isArray(commentsResult.data) ? commentsResult.data : []
          setComments(commentsData)
        }
      } catch (err) {
        console.error("Error fetching post data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    router.push(`/dashboard/posts/edit/${id}`)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        router.push("/dashboard/posts")
      } else {
        throw new Error("Error al eliminar el post")
      }
    } catch (err) {
      console.error("Error deleting post:", err)
      setError(err.message)
    }
  }

  const handleLikeToggle = async () => {
    try {
      const method = userLiked ? "DELETE" : "POST"
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/like`, {
        method,
        credentials: "include",
      })

      if (response.ok) {
        setUserLiked(!userLiked)
        setLikesCount((prevCount) => (userLiked ? prevCount - 1 : prevCount + 1))
      }
    } catch (err) {
      console.error("Error toggling like:", err)
    }
  }

  const handleAddComment = async (content) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        const newComment = result.data
        setComments((prevComments) => [newComment, ...prevComments])

        // Update comment count in post
        setPost((prevPost) => ({
          ...prevPost,
          commentsCount: (prevPost.commentsCount || 0) + 1,
        }))

        return true
      }
      return false
    } catch (err) {
      console.error("Error adding comment:", err)
      return false
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <RefreshCw className="animate-spin h-10 w-10 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-6">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body">
            <div className="flex items-center justify-center text-error mb-4">
              <AlertTriangle size={48} />
            </div>
            <h2 className="card-title justify-center mb-4">Error al cargar el post</h2>
            <p className="text-center mb-6">{error}</p>
            <div className="card-actions justify-center">
              <button className="btn btn-primary" onClick={handleBack}>
                Volver a Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-6">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body">
            <h2 className="card-title justify-center mb-4">Post no encontrado</h2>
            <p className="text-center mb-6">El post que buscas no existe o ha sido eliminado.</p>
            <div className="card-actions justify-center">
              <button className="btn btn-primary" onClick={handleBack}>
                Volver a Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 p-6 bg-base-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button onClick={handleBack} className="btn btn-ghost btn-sm">
            <ArrowLeft size={18} className="mr-2" />
            Volver
          </button>

          {isAuthor && (
            <div className="ml-auto flex gap-2">
              <button onClick={handleEdit} className="btn btn-outline btn-sm">
                <Edit size={16} className="mr-2" />
                Editar
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-error btn-sm">
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </button>
            </div>
          )}
        </div>

        <PostDetail post={post} likesCount={likesCount} userLiked={userLiked} onLikeToggle={handleLikeToggle} />

        <CommentSection comments={comments} postId={id} onAddComment={handleAddComment} currentUser={currentUser} />
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar post?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este post?"
      />
    </main>
  )
}
