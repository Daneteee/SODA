export function hasAuthToken() {
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
  