"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, MessageCircle, ArrowLeft, Send, Plus, Users } from "lucide-react"
import axios from "axios"

function hasAuthToken() {
  if (typeof document === "undefined") return false
  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith("jwtToken=")) {
      return true
    }
  }
  return false
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeChat, setActiveChat] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([]) // Todos los usuarios disponibles
  const [messages, setMessages] = useState({})
  const [loading, setLoading] = useState(false)
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetchTimes, setLastFetchTimes] = useState({})
  const [isNewChat, setIsNewChat] = useState(false) // Estado para mostrar la búsqueda de usuarios
  const messagesEndRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const messagePollingIntervalRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Intervalos de polling (en milisegundos)
  const CONVERSATIONS_POLLING_INTERVAL = 5000 // 5 segundos
  const MESSAGES_POLLING_INTERVAL = 3000 // 3 segundos
  const SEARCH_DEBOUNCE_TIME = 300 // 300ms para debounce de búsqueda

  // Configuración para el auto-scroll al recibir nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Scroll al fondo cuando cambian los mensajes
    if (activeChat && messages[activeChat]?.length > 0) {
      scrollToBottom()
    }
  }, [messages, activeChat])

  // Iniciar/detener polling de conversaciones cuando el widget está abierto/cerrado
  useEffect(() => {
    if (isOpen) {
      fetchConversations()

      // Iniciar polling de conversaciones
      pollingIntervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible" && !isNewChat) {
          fetchConversations(false) // No mostrar loading en polling
        }
      }, CONVERSATIONS_POLLING_INTERVAL)
    } else {
      // Detener polling cuando se cierra el widget
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (messagePollingIntervalRef.current) {
        clearInterval(messagePollingIntervalRef.current)
      }
    }

    return () => {
      // Limpiar intervalos al desmontar
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      if (messagePollingIntervalRef.current) clearInterval(messagePollingIntervalRef.current)
    }
  }, [isOpen, isNewChat])

  // Gestionar el polling de mensajes cuando cambia el chat activo
  useEffect(() => {
    if (messagePollingIntervalRef.current) {
      clearInterval(messagePollingIntervalRef.current)
    }

    if (activeChat) {
      console.log("Chat activo cambiado a:", activeChat)
      fetchMessages(activeChat)

      // Iniciar polling de mensajes para el chat activo
      messagePollingIntervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchMessages(activeChat, false) // Sin loading en polling
        }
      }, MESSAGES_POLLING_INTERVAL)
    }

    // Si se activa un chat, asegurarse de que no estamos en modo "nuevo chat"
    if (activeChat) {
      setIsNewChat(false)
    }

    return () => {
      if (messagePollingIntervalRef.current) {
        clearInterval(messagePollingIntervalRef.current)
      }
    }
  }, [activeChat])

  // Pausar polling cuando la página no está visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isOpen) {
        // Al volver a la pestaña, actualizamos inmediatamente
        if (!isNewChat) {
          fetchConversations(false)
        }
        if (activeChat) {
          fetchMessages(activeChat, false)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isOpen, activeChat, isNewChat])

  // Efecto para manejar la búsqueda de usuarios con debounce
  useEffect(() => {
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
  }, [searchTerm, isNewChat])

  // Cargar todos los usuarios cuando se activa la vista de nuevo chat
  useEffect(() => {
    if (isNewChat) {
      fetchAllUsers()
    }
  }, [isNewChat])

  const fetchConversations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      // Verificar si hay token de autenticación en las cookies
      if (!hasAuthToken()) {
        setError("No has iniciado sesión")
        return
      }

      // Realizar la solicitud con axios
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/chats/conversations", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })

      if (res && res.data) {
        console.log("Conversaciones cargadas:", res.data)
        setUsers(res.data)
      } else {
        console.error("No se encontró 'data' en la respuesta:", res)
        setError("No se encontraron conversaciones.")
      }
    } catch (error) {
      console.error("Error al cargar conversaciones:", error)
      if (showLoading) {
        setError("Error al cargar conversaciones. Por favor intenta de nuevo.")
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      setUserSearchLoading(true)
      setError(null)

      // Verificar si hay token de autenticación en las cookies
      if (!hasAuthToken()) {
        setError("No has iniciado sesión")
        return
      }

      // Realizar la solicitud con axios
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/chats/users", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })

      if (res && res.data) {
        setAllUsers(res.data)
      } else {
        console.error("No se encontró 'data' en la respuesta:", res)
        setError("No se encontraron usuarios.")
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      setError("Error al cargar usuarios. Por favor intenta de nuevo.")
    } finally {
      setUserSearchLoading(false)
    }
  }

  const searchUsers = async (query) => {
    try {
      setUserSearchLoading(true)
      setError(null)

      // Verificar si hay token de autenticación en las cookies
      if (!hasAuthToken()) {
        setError("No has iniciado sesión")
        return
      }

      // Realizar la solicitud con axios
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })

      if (res && res.data) {
        setAllUsers(res.data)
      } else {
        console.error("No se encontró 'data' en la respuesta:", res)
        setError("No se encontraron usuarios.")
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error)
      setError("Error al buscar usuarios. Por favor intenta de nuevo.")
    } finally {
      setUserSearchLoading(false)
    }
  }

  const fetchMessages = async (conversationId, showLoading = true) => {
    try {
      if (showLoading) setMessageLoading(true)

      // Actualizamos el lastFetchTime para este chat
      const now = Date.now()

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chats/${conversationId}/messages`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })

      // Actualizar mensajes solo si hay nuevos o si es la primera carga
      const currentMessages = messages[conversationId] || []
      const newMessages = res.data

      // Comprobar si hay nuevos mensajes comparando longitudes o el último mensaje
      const hasNewMessages =
        newMessages.length !== currentMessages.length ||
        (newMessages.length > 0 &&
          currentMessages.length > 0 &&
          newMessages[newMessages.length - 1].id !== currentMessages[currentMessages.length - 1].id)

      if (!messages[conversationId] || hasNewMessages) {
        setMessages((prev) => ({ ...prev, [conversationId]: newMessages }))
      }

      // Actualizar el tiempo de la última consulta
      setLastFetchTimes((prev) => ({ ...prev, [conversationId]: now }))
    } catch (error) {
      console.error("Error al cargar mensajes:", error)
      if (showLoading) {
        setError("Error al cargar mensajes. Por favor intenta de nuevo.")
      }
    } finally {
      if (showLoading) setMessageLoading(false)
    }
  }

  const startNewChat = async (userId) => {
    try {
      console.log("Iniciando nuevo chat con usuario:", userId)
      setLoading(true)
      setError(null)

      // Crear una nueva conversación con el usuario seleccionado
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/new`,
        { targetUserId: userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      if (res && res.data && res.data.id) {
        console.log("Conversación creada con éxito:", res.data)
        
        // Activar el chat con la nueva conversación
        setActiveChat(res.data.id)
        setIsNewChat(false)
        
        // Actualizar la lista de conversaciones
        setTimeout(() => {
          fetchConversations(false)
        }, 500) // Pequeño delay para asegurar que el backend tenga tiempo de procesar
      } else {
        console.error("Respuesta inesperada al crear conversación:", res)
        setError("Error al crear la conversación. Respuesta incompleta.")
      }
    } catch (error) {
      console.error("Error al crear conversación:", error)
      setError("Error al crear conversación. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    try {
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        text: newMessage,
        isMe: true,
        pending: true,
      }

      // Actualizar UI inmediatamente con mensaje optimista
      setMessages((prev) => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), optimisticMessage],
      }))

      // Limpiar input inmediatamente para mejor UX
      setNewMessage("")

      // Scroll al fondo después de agregar mensaje optimista
      setTimeout(scrollToBottom, 50)

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/${activeChat}/messages`,
        { text: newMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      // Reemplazar el mensaje optimista con el real
      setMessages((prev) => {
        const updatedMessages = prev[activeChat].filter((msg) => msg.id !== optimisticMessage.id)
        return {
          ...prev,
          [activeChat]: [...updatedMessages, res.data],
        }
      })

      // Actualizar también la lista de conversaciones para mostrar el último mensaje
      fetchConversations(false)
    } catch (error) {
      console.error("Error al enviar mensaje:", error)

      // Marcar el mensaje optimista como fallido
      setMessages((prev) => {
        const updatedMessages = prev[activeChat].map((msg) =>
          msg.id === `temp-${Date.now()}` ? { ...msg, failed: true, pending: false } : msg,
        )
        return {
          ...prev,
          [activeChat]: updatedMessages,
        }
      })

      setError("Error al enviar mensaje. Por favor intenta de nuevo.")
    }
  }

  // Filtrar usuarios según la búsqueda
  const filteredUsers = users.filter((user) => user.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  // Filtrar todos los usuarios disponibles según la búsqueda
  const filteredAllUsers = allUsers.filter((user) => user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  
  const activeUser = activeChat ? users.find((user) => user.id === activeChat) : null

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 btn btn-circle btn-primary shadow-lg z-501 ${isOpen ? "hidden" : "flex"}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Panel de chat desplegable */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-base-100 shadow-xl z-1 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {!activeChat ? (
          // Vista de lista de chats o nuevo chat
          <>
            {/* Cabecera del panel */}
            <div className="p-4 border-b border-base-300">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{isNewChat ? "Nuevo chat" : "Mensajes"}</h1>
                <div className="flex gap-2">
                  {isNewChat ? (
                    <button className="btn btn-sm btn-ghost" onClick={() => setIsNewChat(false)}>
                      <ArrowLeft size={18} />
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => setIsNewChat(true)}>
                      <Plus size={18} />
                      <span className="hidden sm:inline">Nuevo chat</span>
                    </button>
                  )}
                  <button className="btn btn-circle btn-sm btn-ghost" onClick={() => setIsOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={isNewChat ? "Buscar usuarios..." : "Buscar chats..."}
                  className="input input-bordered w-full pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60"
                  size={18}
                />
              </div>
            </div>

            {/* Lista de usuarios */}
            <div className="overflow-y-auto" style={{ height: "calc(100vh - 120px)" }}>
              {isNewChat ? (
                // Vista de todos los usuarios disponibles
                userSearchLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <span className="loading loading-spinner text-primary"></span>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <p className="text-error mb-2">{error}</p>
                    <button className="btn btn-primary btn-sm" onClick={() => fetchAllUsers()}>
                      Reintentar
                    </button>
                  </div>
                ) : filteredAllUsers.length > 0 ? (
                  <div>
                    <div className="p-2 bg-base-200 text-sm font-medium">
                      <Users size={16} className="inline mr-2" />
                      Usuarios disponibles
                    </div>
                    <ul className="menu p-2 gap-1">
                      {filteredAllUsers.map((user) => (
                        <li key={user._id}>
                          <a
                            className="flex items-center p-3 hover:bg-base-200 rounded-lg"
                            onClick={() => startNewChat(user._id)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="avatar">
                                <div className="w-12 h-12 rounded-full">
                                  <img
                                    src={
                                      user.profileImage
                                        ? `${process.env.NEXT_PUBLIC_SERVER_URL}${user.profileImage}`
                                        : `${process.env.NEXT_PUBLIC_SERVER_URL}/default.jpg`
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <p className="text-base-content/60">No se encontraron usuarios</p>
                  </div>
                )
              ) : // Vista de chats existentes
              loading ? (
                <div className="flex justify-center items-center h-32">
                  <span className="loading loading-spinner text-primary"></span>
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-error mb-2">{error}</p>
                  <button className="btn btn-primary btn-sm" onClick={() => fetchConversations()}>
                    Reintentar
                  </button>
                </div>
              ) : filteredUsers.length > 0 ? (
                <ul className="menu p-2 gap-1">
                  {filteredUsers.map((user) => (
                    <li key={user.id}>
                      <a
                        className="flex items-center p-3 hover:bg-base-200 rounded-lg"
                        onClick={() => setActiveChat(user.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full">
                              <img
                                src={
                                  user.user?.profileImage
                                    ? `${process.env.NEXT_PUBLIC_SERVER_URL}${user.user.profileImage}`
                                    : `${process.env.NEXT_PUBLIC_SERVER_URL}/default.jpg`
                                }
                                alt={user.user?.name || "Usuario"}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{user.user?.name || "Usuario"}</h3>
                            <p className="text-sm text-base-content/70 truncate">
                              {user.lastMessage || "No hay mensajes"}
                            </p>
                          </div>
                          {user.unreadCount > 0 && (
                            <span className="badge badge-primary badge-sm">{user.unreadCount}</span>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-base-content/60">No se encontraron conversaciones</p>
                  <button className="btn btn-primary mt-4" onClick={() => setIsNewChat(true)}>
                    <Plus size={18} className="mr-2" />
                    Iniciar nuevo chat
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Vista de conversación simplificada
          <div className="flex flex-col h-full">
            {/* Cabecera de la conversación */}
            <div className="p-4 border-b border-base-300 flex items-center gap-3">
              <button className="btn btn-circle btn-sm btn-ghost" onClick={() => setActiveChat(null)}>
                <ArrowLeft size={18} />
              </button>

              {activeUser && (
                <>
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={
                          activeUser.user?.profileImage
                            ? `${process.env.NEXT_PUBLIC_SERVER_URL}${activeUser.user.profileImage}`
                            : `${process.env.NEXT_PUBLIC_SERVER_URL}/default.jpg`
                        }
                        alt={activeUser.user?.name || "Usuario"}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold truncate">{activeUser.user?.name || "Usuario"}</h2>
                  </div>
                </>
              )}
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 bg-base-200">
              {messageLoading && !messages[activeChat]?.length ? (
                <div className="flex justify-center items-center h-32">
                  <span className="loading loading-spinner text-primary"></span>
                </div>
              ) : messages[activeChat]?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {messages[activeChat].map((message) => (
                    <div key={message.id} className={`chat ${message.isMe ? "chat-end" : "chat-start"}`}>
                      <div
                        className={`chat-bubble ${message.isMe ? "chat-bubble-primary" : ""} 
                                  ${message.pending ? "opacity-70" : ""} 
                                  ${message.failed ? "bg-error/20 text-error" : ""}`}
                      >
                        {message.text}
                        {message.pending && (
                          <span className="ml-2 inline-block">
                            <span className="loading loading-spinner loading-xs"></span>
                          </span>
                        )}
                        {message.failed && <span className="ml-2 text-xs">Error al enviar</span>}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-base-content/60">No hay mensajes aún</p>
                </div>
              )}

              {/* Indicador de que alguien está escribiendo (simulado) */}
              {messageLoading && messages[activeChat]?.length > 0 && (
                <div className="mt-2">
                  <div className="chat chat-start">
                    <div className="chat-bubble bg-base-300 min-h-0 h-8 flex items-center">
                      <span className="loading loading-dots loading-xs"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Área de entrada de mensaje simplificada */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300 bg-base-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="input input-bordered flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={messageLoading}
                />
                <button
                  type="submit"
                  className="btn btn-circle btn-primary"
                  disabled={!newMessage.trim() || messageLoading}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  )
}