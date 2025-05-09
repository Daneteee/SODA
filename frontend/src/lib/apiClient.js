const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // Verificar si esta cookie comienza con el nombre que buscamos
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

async function request(endpoint, options = {}) {
  // Obtener el token de autenticación desde las cookies
  const token = getCookie('token');

  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }), // Añadir token si existe
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    credentials: 'include', // Importante: incluir las cookies en las solicitudes
    ...options,
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`)
  }

  return res.json()
}

export const apiClient = {
  get: (endpoint, customOptions = {}) => 
    request(endpoint, customOptions),
  post: (endpoint, body, customOptions = {}) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...customOptions
    }),
  put: (endpoint, body, customOptions = {}) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...customOptions
    }),
  delete: (endpoint, customOptions = {}) =>
    request(endpoint, {
      method: "DELETE",
      ...customOptions
    }),
}