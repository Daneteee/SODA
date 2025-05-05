"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import ConversationList from "./conversation-list"
import UserSearch from "./user-search"
import ChatView from "./chat-view"
import { useChatPolling } from "@/hooks/use-chat-polling"

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeChat, setActiveChat] = useState(null)
  const [isNewChat, setIsNewChat] = useState(false)
  const [error, setError] = useState(null)

  const {
    users,
    allUsers,
    messages,
    loading,
    userSearchLoading,
    messageLoading,
    fetchConversations,
    fetchAllUsers,
    searchUsers,
    fetchMessages,
    startNewChat,
    sendMessage,
  } = useChatPolling({
    isOpen,
    activeChat,
    isNewChat,
  })

  // Filtrar usuarios según la búsqueda
  const filteredUsers = users.filter((user) => user.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  // Filtrar todos los usuarios disponibles según la búsqueda
  const filteredAllUsers = allUsers.filter((user) => user.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  const activeUser = activeChat ? users.find((user) => user.id === activeChat) : null

  // Efecto para manejar la búsqueda de usuarios con debounce
  useEffect(() => {
    const SEARCH_DEBOUNCE_TIME = 300
    const searchTimeoutRef = { current: null }

    if (isNewChat) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      if (searchTerm.trim()) {
        searchTimeoutRef.current = setTimeout(() => {
          searchUsers(searchTerm)
        }, SEARCH_DEBOUNCE_TIME)
      } else {
        // Si no hay término de búsqueda, cargar todos los usuarios
        fetchAllUsers()
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, isNewChat, searchUsers, fetchAllUsers])

  // Cargar todos los usuarios cuando se activa la vista de nuevo chat
  useEffect(() => {
    if (isNewChat) {
      fetchAllUsers()
    }
  }, [isNewChat, fetchAllUsers])

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 btn btn-circle btn-primary shadow-lg z-50 ${isOpen ? "hidden" : "flex"}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Panel de chat desplegable */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-80 bg-base-100 shadow-xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {!activeChat ? (
          // Vista de lista de chats o nuevo chat
          isNewChat ? (
            <UserSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredAllUsers={filteredAllUsers}
              loading={userSearchLoading}
              error={error}
              onUserSelect={startNewChat}
              onBack={() => setIsNewChat(false)}
              onClose={() => setIsOpen(false)}
              fetchAllUsers={fetchAllUsers}
            />
          ) : (
            <ConversationList
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredUsers={filteredUsers}
              loading={loading}
              error={error}
              onChatSelect={setActiveChat}
              onNewChat={() => setIsNewChat(true)}
              onClose={() => setIsOpen(false)}
              fetchConversations={fetchConversations}
            />
          )
        ) : (
          // Vista de conversación
          <ChatView
            activeChat={activeChat}
            activeUser={activeUser}
            messages={messages[activeChat] || []}
            loading={messageLoading}
            onBack={() => setActiveChat(null)}
            onSendMessage={sendMessage}
          />
        )}
      </div>
    </>
  )
}
