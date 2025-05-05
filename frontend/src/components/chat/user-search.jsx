"use client"

import { Search, ArrowLeft, X, Users } from "lucide-react"

export default function UserSearch({
  searchTerm,
  setSearchTerm,
  filteredAllUsers,
  loading,
  error,
  onUserSelect,
  onBack,
  onClose,
  fetchAllUsers,
}) {
  return (
    <>
      {/* Cabecera del panel */}
      <div className="p-4 border-b border-base-300">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Nuevo chat</h1>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost" onClick={onBack}>
              <ArrowLeft size={18} />
            </button>
            <button className="btn btn-circle btn-sm btn-ghost" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="input input-bordered w-full pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60" size={18} />
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="overflow-y-auto" style={{ height: "calc(100vh - 120px)" }}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchAllUsers} />
        ) : filteredAllUsers.length > 0 ? (
          <UserList users={filteredAllUsers} onUserSelect={onUserSelect} />
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  )
}

function UserList({ users, onUserSelect }) {
  return (
    <div>
      <div className="p-2 bg-base-200 text-sm font-medium">
        <Users size={16} className="inline mr-2" />
        Usuarios disponibles
      </div>
      <ul className="menu p-2 gap-1">
        {users.map((user) => (
          <li key={user._id}>
            <a className="flex items-center p-3 hover:bg-base-200 rounded-lg" onClick={() => onUserSelect(user._id)}>
              <div className="flex items-center gap-3 w-full">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img
                      src={
                        user.profileImage
                          ? `http://localhost:4000${user.profileImage}`
                          : "http://localhost:4000/placeholder.svg"
                      }
                      alt={user.name || "Usuario"}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{user.name || "Usuario"}</h3>
                  {user.email && <p className="text-sm text-base-content/70 truncate">{user.email}</p>}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center h-32">
      <span className="loading loading-spinner text-primary"></span>
    </div>
  )
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="p-4 text-center">
      <p className="text-error mb-2">{error}</p>
      <button className="btn btn-primary btn-sm" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <p className="text-base-content/60">No se encontraron usuarios</p>
    </div>
  )
}
