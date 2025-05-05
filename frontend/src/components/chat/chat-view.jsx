"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send } from "lucide-react"

export default function ChatView({ activeChat, activeUser, messages, loading, onBack, onSendMessage }) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  // Configuración para el auto-scroll al recibir nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Scroll al fondo cuando cambian los mensajes
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    onSendMessage(activeChat, newMessage)
    setNewMessage("")

    // Scroll al fondo después de enviar mensaje
    setTimeout(scrollToBottom, 50)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera de la conversación */}
      <div className="p-4 border-b border-base-300 flex items-center gap-3">
        <button className="btn btn-circle btn-sm btn-ghost" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>

        {activeUser && (
          <>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img
                  src={
                    activeUser.user?.profileImage
                      ? `http://localhost:4000${activeUser.user.profileImage}`
                      : "http://localhost:4000/placeholder.svg"
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
        {loading && !messages.length ? (
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : messages.length > 0 ? (
          <MessageList messages={messages} messagesEndRef={messagesEndRef} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-base-content/60">No hay mensajes aún</p>
          </div>
        )}

        {/* Indicador de que alguien está escribiendo (simulado) */}
        {loading && messages.length > 0 && (
          <div className="mt-2">
            <div className="chat chat-start">
              <div className="chat-bubble bg-base-300 min-h-0 h-8 flex items-center">
                <span className="loading loading-dots loading-xs"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área de entrada de mensaje */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300 bg-base-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="input input-bordered flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-circle btn-primary" disabled={!newMessage.trim() || loading}>
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

function MessageList({ messages, messagesEndRef }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
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
  )
}
