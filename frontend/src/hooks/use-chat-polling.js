"use client"

/**
 * @module useChatPolling
 * @description Hook personalizado para gestionar el sistema de chat en tiempo real mediante polling
 * @requires react
 * @requires axios
 * @requires auth-utils
 */

import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import { hasAuthToken } from "@/lib/auth-utils"

/**
 * Hook personalizado para gestionar conversaciones y mensajes de chat mediante polling
 * @function useChatPolling
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.isOpen - Indica si el widget de chat está abierto
 * @param {string|null} options.activeChat - ID de la conversación activa
 * @param {boolean} options.isNewChat - Indica si se está creando una nueva conversación
 * @returns {Object} Estado y funciones para gestionar el chat
 */
export function useChatPolling({ isOpen, activeChat, isNewChat }) {
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([]) // Todos los usuarios disponibles
  const [messages, setMessages] = useState({})
  const [loading, setLoading] = useState(false)
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetchTimes, setLastFetchTimes] = useState({})

  const pollingIntervalRef = useRef(null)
  const messagePollingIntervalRef = useRef(null)
  
  // Referencias para almacenar el estado actual sin causar re-renders
  const messagesRef = useRef(messages)
  const activeChatRef = useRef(activeChat)
  
  // Actualizar las referencias cuando cambian los valores
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Intervalos de polling (en milisegundos)
  const CONVERSATIONS_POLLING_INTERVAL = 5000 // 5 segundos
  const MESSAGES_POLLING_INTERVAL = 3000 // 3 segundos

  /**
   * Obtiene la lista de conversaciones del usuario
   * @function fetchConversations
   * @async
   * @param {boolean} showLoading - Indica si se debe mostrar el estado de carga
   * @description Obtiene todas las conversaciones del usuario desde el servidor
   */
  // Función fetchConversations memoizada para evitar recreaciones en cada render
  const fetchConversations = useCallback(async (showLoading = true) => {
    
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
  }, []);

  /**
   * Obtiene los mensajes de una conversación específica
   * @function fetchMessages
   * @async
   * @param {string} conversationId - ID de la conversación
   * @param {boolean} showLoading - Indica si se debe mostrar el estado de carga
   * @description Obtiene todos los mensajes de una conversación desde el servidor
   */
  // Función fetchMessages memoizada
  const fetchMessages = useCallback(async (conversationId, showLoading = true) => {
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

      // Usar la referencia para acceder al estado actual sin crear dependencias
      const currentMessages = messagesRef.current[conversationId] || []
      const newMessages = res.data

      // Comprobar si hay nuevos mensajes comparando longitudes o el último mensaje
      const hasNewMessages =
        newMessages.length !== currentMessages.length ||
        (newMessages.length > 0 &&
          currentMessages.length > 0 &&
          newMessages[newMessages.length - 1].id !== currentMessages[currentMessages.length - 1].id)

      if (!messagesRef.current[conversationId] || hasNewMessages) {
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
  }, []);

  const fetchAllUsers = useCallback(async () => {
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
  }, []);

  const searchUsers = useCallback(async (query) => {
    try {
      setUserSearchLoading(true)
      setError(null)

      // Verificar si hay token de autenticación en las cookies
      if (!hasAuthToken()) {
        setError("No has iniciado sesión")
        return
      }

      // Realizar la solicitud con axios
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/users/search?q=${encodeURIComponent(query)}`, {
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
  }, []);

  const startNewChat = useCallback(async (userId) => {
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
        
        // Actualizar inmediatamente la lista de conversaciones
        await fetchConversations(false)
        
        // Pre-cargar los mensajes para esta conversación
        await fetchMessages(res.data.id, false)
        
        return res.data.id
      } else {
        console.error("Respuesta inesperada al crear conversación:", res)
        setError("Error al crear la conversación. Respuesta incompleta.")
        return null
      }
    } catch (error) {
      console.error("Error al crear conversación:", error)
      setError("Error al crear conversación. Por favor intenta de nuevo.")
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchConversations, fetchMessages]);

  const sendMessage = useCallback(async (chatId, text) => {
    try {
      const tempId = `temp-${Date.now()}`
      const optimisticMessage = {
        id: tempId,
        text: text,
        isMe: true,
        pending: true,
      }

      // Actualizar UI inmediatamente con mensaje optimista
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), optimisticMessage],
      }))

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/${chatId}/messages`,
        { text: text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      // Reemplazar el mensaje optimista con el real
      setMessages((prev) => {
        const updatedMessages = prev[chatId].filter((msg) => msg.id !== tempId)
        return {
          ...prev,
          [chatId]: [...updatedMessages, res.data],
        }
      })

      // Actualizar también la lista de conversaciones para mostrar el último mensaje
      fetchConversations(false)

      return true
    } catch (error) {
      console.error("Error al enviar mensaje:", error)

      // Marcar el mensaje optimista como fallido
      setMessages((prev) => {
        const updatedMessages = prev[chatId].map((msg) =>
          msg.id === tempId ? { ...msg, failed: true, pending: false } : msg,
        )
        return {
          ...prev,
          [chatId]: updatedMessages,
        }
      })

      setError("Error al enviar mensaje. Por favor intenta de nuevo.")
      return false
    }
  }, [fetchConversations]);

  // Iniciar/detener polling de conversaciones cuando el widget está abierto/cerrado
  useEffect(() => {
    /**
     * Realiza polling de conversaciones cuando la página está visible
     * @function pollConversations
     * @description Actualiza periódicamente la lista de conversaciones si la página está visible
     */
    const pollConversations = () => {
      if (document.visibilityState === "visible" && !isNewChat) {
        fetchConversations(false) // No mostrar loading en polling
      }
    };

    if (isOpen) {
      // Cargar conversaciones iniciales
      fetchConversations()
      
      // Iniciar polling de conversaciones
      pollingIntervalRef.current = setInterval(pollConversations, CONVERSATIONS_POLLING_INTERVAL)
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
      // Limpiar intervalos al desmontar o cuando cambian las dependencias
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      if (messagePollingIntervalRef.current) clearInterval(messagePollingIntervalRef.current)
    }
  }, [isOpen, isNewChat, fetchConversations]);

  // Gestionar el polling de mensajes cuando cambia el chat activo
  useEffect(() => {
    /**
     * Realiza polling de mensajes cuando la página está visible
     * @function pollMessages
     * @description Actualiza periódicamente los mensajes de la conversación activa si la página está visible
     */
    const pollMessages = () => {
      if (document.visibilityState === "visible" && activeChatRef.current) {
        fetchMessages(activeChatRef.current, false) // Sin loading en polling
      }
    };
    
    // Limpiar el intervalo anterior si existe
    if (messagePollingIntervalRef.current) {
      clearInterval(messagePollingIntervalRef.current)
      messagePollingIntervalRef.current = null
    }

    if (activeChat) {
      console.log("Chat activo cambiado a:", activeChat)
      fetchMessages(activeChat)

      // Iniciar polling de mensajes para el chat activo
      messagePollingIntervalRef.current = setInterval(pollMessages, MESSAGES_POLLING_INTERVAL)
    }

    return () => {
      if (messagePollingIntervalRef.current) {
        clearInterval(messagePollingIntervalRef.current)
        messagePollingIntervalRef.current = null
      }
    }
  }, [activeChat, fetchMessages]);

  // Pausar polling cuando la página no está visible
  useEffect(() => {
    /**
     * Maneja cambios en la visibilidad de la página
     * @function handleVisibilityChange
     * @description Actualiza datos cuando el usuario vuelve a la pestaña del navegador
     */
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isOpen) {
        // Al volver a la pestaña, actualizamos inmediatamente
        if (!isNewChat) {
          fetchConversations(false)
        }
        if (activeChatRef.current) {
          fetchMessages(activeChatRef.current, false)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isOpen, isNewChat, fetchConversations, fetchMessages]);

  return {
    users,
    allUsers,
    messages,
    loading,
    userSearchLoading,
    messageLoading,
    error,
    fetchConversations,
    fetchAllUsers,
    searchUsers,
    fetchMessages,
    startNewChat,
    sendMessage,
  }
}