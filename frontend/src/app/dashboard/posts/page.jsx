"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Filter, Search, TrendingUp, Tag, RefreshCw, MessageSquare, Users, Newspaper, Bookmark } from 'lucide-react'
import PostCard from "@/components/posts/PostCard"
import CategoryFilter from "@/components/posts/CategoryFilter"

export default function PostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  // Categorías de ejemplo (puedes ajustarlas según tus necesidades)
  const categories = [
    { id: "all", name: "Todos", icon: <Newspaper size={16} /> },
    { id: "stocks", name: "Acciones", icon: <TrendingUp size={16} /> },
    { id: "crypto", name: "Criptomonedas", icon: <Tag size={16} /> },
    { id: "forex", name: "Forex", icon: <Tag size={16} /> },
    { id: "analysis", name: "Análisis", icon: <Tag size={16} /> },
    { id: "news", name: "Noticias", icon: <Tag size={16} /> },
  ]

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/posts`
      console.log(url)
      // Añadir filtro de categoría si no es "all"
      if (selectedCategory !== "all") {
        url += `?category=${selectedCategory}`
      }

      const response = await fetch(url, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Error al cargar los posts")
      }

      const result = await response.json()
      setPosts(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = () => {
    router.push("/dashboard/posts/create")
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  return (
    <main className="flex-1 p-6 bg-base-200">
      <div className="max-w-6xl mx-auto">
        {/* Header con título y botón de crear */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Comunidad de Inversión
            </h1>
            <p className="text-base-content/70 mt-1">Comparte y descubre estrategias de inversión con otros traders</p>
          </div>
          <button onClick={handleCreatePost} className="btn btn-primary gap-2">
            <Plus size={18} />
            Nuevo Post
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-base-100 rounded-xl shadow-md p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar posts por título, contenido o etiquetas..."
                className="input input-bordered w-full pl-10 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" size={18} />
            </div>
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} gap-2`} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filtros
              <span className="badge badge-sm">{selectedCategory !== "all" ? "1" : "0"}</span>
            </button>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-base-300">
              <h3 className="text-sm font-medium mb-3 text-base-content/70">Filtrar por categoría:</h3>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          )}
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <RefreshCw className="animate-spin h-12 w-12 text-primary mb-4" />
            <p className="text-base-content/70">Cargando publicaciones...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error shadow-lg">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
            <div className="flex-none">
              <button className="btn btn-sm btn-outline" onClick={fetchPosts}>
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            {/* Contador de resultados */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-base-content/70">
                Mostrando <span className="font-medium">{filteredPosts.length}</span> publicaciones
                {selectedCategory !== "all" && (
                  <> en <span className="font-medium">{categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span></>
                )}
                {searchTerm && (
                  <> para "<span className="font-medium">{searchTerm}</span>"</>
                )}
              </p>
              
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-ghost gap-2">
                  <Bookmark size={16} />
                  <span className="hidden sm:inline">Ordenar</span>
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a>Más recientes</a></li>
                  <li><a>Más populares</a></li>
                  <li><a>Más comentados</a></li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-base-100 rounded-xl shadow-md">
            <div className="text-6xl mb-6 flex justify-center">
              <MessageSquare className="h-24 w-24 text-base-content/20" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No hay posts disponibles</h3>
            <p className="text-base-content/70 mb-8 max-w-md mx-auto">
              {searchTerm
                ? "No se encontraron resultados para tu búsqueda."
                : selectedCategory !== "all"
                  ? `No hay posts en la categoría ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}.`
                  : "Sé el primero en compartir tus ideas de inversión."}
            </p>
            <button onClick={handleCreatePost} className="btn btn-primary btn-lg gap-2">
              <Plus size={20} />
              Crear el primer post
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
