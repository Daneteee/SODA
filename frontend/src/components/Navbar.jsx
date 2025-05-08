"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import ThemeSelector from "@/components/ThemeSelector"

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState({
    profileImage: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
  })
  const router = useRouter()
  const pathname = usePathname()

  // Verificar autenticación y obtener datos del usuario
  useEffect(() => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("jwtToken="))
    setIsAuthenticated(!!token)
    setIsLoading(false)

    if (token) {
      const fetchUserData = async () => {
        try {
          const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
            method: "GET",
            credentials: "include",
          })
          if (!profileResponse.ok) throw new Error("Error obtaining user data")
          const profileData = await profileResponse.json()
          setUserData({
            profileImage:
              profileData.profileImage || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchUserData()
    }
  }, [pathname])

  const handleLogout = () => {
    document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    setIsAuthenticated(false)
    router.push("/")
  }

  // Common navigation items
  const navigationItems = (
    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
      <li>
        <Link href="/">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </div>
        </Link>
      </li>
      <li>
        <Link href="/dashboard/portfolio">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Portfolio
          </div>
        </Link>
      </li>
      <li>
        <Link href="/about">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            About
          </div>
        </Link>
      </li>
      <li>
        <Link href="/cookies">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Política de Cookies
          </div>
        </Link>
      </li>
    </ul>
  )

  // Common authenticated user controls
  const authenticatedControls = (
    <>
      <div className="hidden md:flex items-center gap-2">
        <button className="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </button>
      </div>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <img
              src={
                `http://localhost:4000${userData.profileImage || "/placeholder.svg"}` ||
                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              }
              alt="Profile"
            />
          </div>
        </div>
        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li>
            <Link href="/dashboard/market">Perfil</Link>
          </li>
          <li>
            <Link href="/dashboard/profile">Configuración</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
        </ul>
      </div>
    </>
  )

  // Common unauthenticated controls
  const unauthenticatedControls = (
    <div className="hidden md:flex gap-x-4">
      <Link href="/auth/login" className="btn btn-neutral">
        Iniciar sesión
      </Link>
      <Link href="/auth/register" className="btn btn-primary">
        Registrarse
      </Link>
    </div>
  )

  // Mobile menu items
  const mobileMenuItems = (
    <div className="dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
      <ul tabIndex={0} className="menu menu-sm">
        {isAuthenticated ? (
          <>
            <li>
              <Link href="/dashboard/market">Perfil</Link>
            </li>
            <li>
              <Link href="/dashboard/profile">Configuración</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/auth/login">Iniciar sesión</Link>
            </li>
            <li>
              <Link href="/auth/register">Registrarse</Link>
            </li>
          </>
        )}
      </ul>
      <div className="divider my-2"></div>
      <div className="flex justify-center p-2">
        <ThemeSelector />
      </div>
    </div>
  )

  // Mostrar un esqueleto de carga mientras se verifica la autenticación
  const loadingControls = (
    <div className="flex items-center gap-4">
      <div className="skeleton h-10 w-32"></div>
      <div className="skeleton h-11 w-11 shrink-0 rounded-full"></div>
    </div>
  )

  // Paginas con NavBar flotante
  const floatingNavPages = ["/", "/auth/login", "/auth/register", "/cookies", "/terms", "/policy", "/contact"]
  const isfloatingNavPages = floatingNavPages.includes(pathname)

  if (isfloatingNavPages) {
    return (
      <div
        className={`fixed top-4 left-1/2 z-50 w-[90%] max-w-6xl -translate-x-1/2 rounded-2xl bg-opacity-40 backdrop-blur-md shadow-lg bg-base-100 bg-opacity-80`}
      >
        <div className="navbar">
          <div className="navbar-start">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              {navigationItems}
            </div>
          </div>

          <div className="navbar-center">
            <Link href="/" className="p-1">
              <div className="flex items-center justify-center h-[6vh]">
                <img
                  src="/blue_soda.svg"
                  alt="Logo"
                  className="h-full w-auto transition-transform duration-200 hover:scale-110"
                />
              </div>
            </Link>
          </div>

          <div className="navbar-end">
            <div className="hidden md:block">
              <ThemeSelector />
            </div>
            {isLoading ? (
              loadingControls
            ) : isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  {authenticatedControls}
                </div>
                <div className="dropdown dropdown-end md:hidden">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={
                          `http://localhost:4000${userData.profileImage || "/placeholder.svg"}` ||
                          "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        }
                        alt="Profile"
                      />
                    </div>
                  </div>
                  {mobileMenuItems}
                </div>
              </>
            ) : (
              <>
                {unauthenticatedControls}
                <div className="dropdown dropdown-end md:hidden">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
                  {mobileMenuItems}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="navbar bg-base-100 h-auto">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          {navigationItems}
        </div>
      </div>

      <div className="navbar-center">
        <Link href="/" className="btn btn-ghost text-xl">
          SODA
        </Link>
      </div>

      <div className="navbar-end">
        <div className="hidden md:block">
          <ThemeSelector />
        </div>
        {isLoading ? (
          loadingControls
        ) : isAuthenticated ? (
          <>
            <div className="hidden md:flex items-center gap-2">
              {authenticatedControls}
            </div>
            <div className="dropdown dropdown-end md:hidden">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    src={
                      `http://localhost:4000${userData.profileImage || "/placeholder.svg"}` ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                    alt="Profile"
                  />
                </div>
              </div>
              {mobileMenuItems}
            </div>
          </>
        ) : (
          <>
            {unauthenticatedControls}
            <div className="dropdown dropdown-end md:hidden">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
              {mobileMenuItems}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

