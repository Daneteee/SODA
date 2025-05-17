"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, ImageIcon, Tag, X } from "lucide-react"
import Alert from "@/components/Alert"
import { useDropzone } from "react-dropzone"

export default function CreatePostPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [],
    image: null,
  })
  const [currentTag, setCurrentTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Categorías disponibles
  const categories = [
    { id: "stocks", name: "Acciones" },
    { id: "crypto", name: "Criptomonedas" },
    { id: "forex", name: "Forex" },
    { id: "analysis", name: "Análisis" },
    { id: "news", name: "Noticias" },
    { id: "other", name: "Otros" },
  ]

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAlert(null)

    try {
      const dataToSend = new FormData()
      dataToSend.append("title", formData.title)
      dataToSend.append("content", formData.content)
      dataToSend.append("category", formData.category)
      dataToSend.append("tags", formData.tags.join(","))
      if (formData.image) {
        dataToSend.append("image", formData.image)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        credentials: "include",
        body: dataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el post")
      }

      router.push(`/dashboard/posts/${data.data._id}`)
    } catch (err) {
      console.error("Error creating post:", err)
      setAlert({
        type: "error",
        message: err.message || "Ha ocurrido un error al crear el post",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <main className="flex-1 p-6 bg-base-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button onClick={handleBack} className="btn btn-ghost btn-sm">
            <ArrowLeft size={18} className="mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold ml-4">Crear Nuevo Post</h1>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Título</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Escribe un título atractivo"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Categoría</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Imagen (opcional)</span>
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-base-300 hover:border-blue-500'}`}
                >
                  <input {...getInputProps()} />
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-500">
                        Haz clic o arrastra otra imagen para cambiar
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">
                        {isDragActive
                          ? 'Suelta la imagen aquí'
                          : 'Arrastra una imagen aquí o haz clic para seleccionar'}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Formatos permitidos: JPG, PNG, GIF (máx. 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Etiquetas</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 border border-blue-300">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Añadir etiqueta"
                    className="input input-bordered input-sm flex-1"
                    onKeyDown={e => { if (e.key === 'Enter') { handleAddTag(e); } }}
                  />
                  <button type="button" onClick={handleAddTag} className="btn btn-primary btn-sm px-4">
                    Añadir
                  </button>
                </div>
                <span className="text-xs text-gray-400 mt-1">Presiona Enter o haz clic en "Añadir" para agregar una etiqueta</span>
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">Contenido</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Comparte tus ideas, análisis o estrategias de inversión..."
                  className="textarea textarea-bordered h-64"
                  required
                ></textarea>
              </div>

              <div className="card-actions justify-end">
                <button type="button" onClick={handleBack} className="btn btn-ghost" disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Publicar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
