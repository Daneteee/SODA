import React from 'react';
import Head from 'next/head';
import { UserCircle, Bell, Settings, LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        {/* Barra de navegación superior */}
        <div className="navbar bg-base-100 shadow-md">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl">Mi Dashboard</a>
          </div>
          <div className="flex-none gap-2">
            <div className="form-control">
              <input type="text" placeholder="Buscar..." className="input input-bordered" />
            </div>
            <button className="btn btn-ghost btn-circle">
              <Bell className="h-5 w-5" />
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <UserCircle className="h-10 w-10" />
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                <li><a>Perfil</a></li>
                <li><a>Configuración</a></li>
                <li><a>Cerrar Sesión</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <main className="flex-1 p-4 bg-base-200">
          <h2 className="text-2xl font-bold mb-6">Información del Usuario</h2>
          
          {/* Tarjetas de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-primary text-primary-content">
              <div className="card-body">
                <h2 className="card-title">Bienvenido, Usuario</h2>
                <p>Último acceso: 17/02/2025</p>
              </div>
            </div>
            
            <div className="card bg-secondary text-secondary-content">
              <div className="card-body">
                <h2 className="card-title">Tareas Pendientes</h2>
                <p className="text-3xl font-bold">12</p>
              </div>
            </div>
            
            <div className="card bg-accent text-accent-content">
              <div className="card-body">
                <h2 className="card-title">Notificaciones</h2>
                <p className="text-3xl font-bold">5</p>
              </div>
            </div>
            
            <div className="card bg-neutral text-neutral-content">
              <div className="card-body">
                <h2 className="card-title">Mensajes</h2>
                <p className="text-3xl font-bold">3</p>
              </div>
            </div>
          </div>
          
          {/* Información detallada */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl lg:col-span-2">
              <div className="card-body">
                <h2 className="card-title">Actividad Reciente</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Actividad</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>17/02/2025</td>
                        <td>Actualización de perfil</td>
                        <td><span className="badge badge-success">Completado</span></td>
                      </tr>
                      <tr>
                        <td>16/02/2025</td>
                        <td>Creación de proyecto</td>
                        <td><span className="badge badge-info">En progreso</span></td>
                      </tr>
                      <tr>
                        <td>15/02/2025</td>
                        <td>Modificación de documentos</td>
                        <td><span className="badge badge-warning">Pendiente</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Perfil de Usuario</h2>
                <div className="flex justify-center mb-4">
                  <div className="avatar">
                    <div className="w-24 rounded-full">
                      <UserCircle className="h-24 w-24" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p><strong>Nombre:</strong> Usuario Ejemplo</p>
                  <p><strong>Email:</strong> usuario@ejemplo.com</p>
                  <p><strong>Rol:</strong> Administrador</p>
                  <p><strong>Miembro desde:</strong> 01/01/2025</p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary">Editar Perfil</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Barra lateral */}
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <aside className="bg-base-200 w-64 h-full">
          <div className="flex items-center justify-center h-16 bg-primary text-primary-content">
            <h2 className="text-xl font-bold">Mi Aplicación</h2>
          </div>
          <ul className="menu p-4 w-full text-base-content">
            <li className="mb-2">
              <a className="active">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </a>
            </li>
            <li className="mb-2">
              <a>
                <Users className="h-5 w-5" />
                Usuarios
              </a>
            </li>
            <li className="mb-2">
              <a>
                <FileText className="h-5 w-5" />
                Documentos
              </a>
            </li>
            <li className="mb-2">
              <a>
                <Settings className="h-5 w-5" />
                Configuración
              </a>
            </li>
            <li className="mt-auto">
              <a className="text-error">
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}