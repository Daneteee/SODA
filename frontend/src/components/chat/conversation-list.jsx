"use client"

import { Search, Plus, X } from "lucide-react"

export default function ConversationList({
  searchTerm,
  setSearchTerm,
  filteredUsers,
  loading,
  error,
  onChatSelect,
  onNewChat,
  onClose,
  fetchConversations,
}) {
  return (
    <>
      {/* Cabecera del panel */}
      <div className="p-4 border-b border-base-300">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={onNewChat}>
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo chat</span>
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
            placeholder="Buscar chats..."
            className="input input-bordered w-full pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60" size={18} />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="overflow-y-auto" style={{ height: "calc(100vh - 120px)" }}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchConversations} />
        ) : filteredUsers.length > 0 ? (
          <ConversationItems users={filteredUsers} onChatSelect={onChatSelect} />
        ) : (
          <EmptyState onNewChat={onNewChat} />
        )}
      </div>
    </>
  )
}

function ConversationItems({ users, onChatSelect }) {
  return (
    <ul className="menu p-2 gap-1">
      {users.map((user) => (
        <li key={user.id}>
          <a className="flex items-center p-3 hover:bg-base-200 rounded-lg" onClick={() => onChatSelect(user.id)}>
            <div className="flex items-center gap-3 w-full">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img
                    src={
                      user.user?.profileImage
                        ? `http://localhost:4000${user.user.profileImage}`
                        : "http://localhost:4000/placeholder.svg"
                    }
                    alt={user.user?.name || "Usuario"}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{user.user?.name || "Usuario"}</h3>
                <p className="text-sm text-base-content/70 truncate">{user.lastMessage || "No hay mensajes"}</p>
              </div>
              {user.unreadCount > 0 && <span className="badge badge-primary badge-sm">{user.unreadCount}</span>}
            </div>
          </a>
        </li>
      ))}
    </ul>
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

function EmptyState({ onNewChat }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <p className="text-base-content/60">No se encontraron conversaciones</p>
      <button className="btn btn-primary mt-4" onClick={onNewChat}>
        <Plus size={18} className="mr-2" />
        Iniciar nuevo chat
      </button>
    </div>
  )
}
