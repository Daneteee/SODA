import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Configuración de axios con el token
const getAuthConfig = () => {
  /**
   * Obtiene la configuración de autenticación para axios
   * @function getAuthConfig
   * @returns {Object} Configuración de autenticación para axios
   */
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Crear un nuevo post
export const createPost = async (formData) => {
  /**
   * Crea un nuevo post
   * @function createPost
   * @param {Object} formData - Datos del formulario
   * @returns {Object} Objeto con el nuevo post
   */
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await axios.post(`${API_URL}/posts`, formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los posts
export const getPosts = async () => {
  /**
   * Obtiene todos los posts
   * @function getPosts
   * @returns {Object} Objeto con todos los posts
   */
  try {
    const response = await axios.get(`${API_URL}/posts`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un post por ID
export const getPostById = async (id) => {
  /**
   * Obtiene un post por ID
   * @function getPostById
   * @param {string} id - ID del post
   * @returns {Object} Objeto con el post
   */
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar un post
export const updatePost = async (id, formData) => {
  /**
   * Actualiza un post
   * @function updatePost
   * @param {string} id - ID del post
   * @param {Object} formData - Datos del formulario
   * @returns {Object} Objeto con el post actualizado
   */
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await axios.put(`${API_URL}/posts/${id}`, formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar un post
export const deletePost = async (id) => {
  /**
   * Elimina un post
   * @function deletePost
   * @param {string} id - ID del post
   * @returns {Object} Objeto con el post eliminado
   */
  try {
    const response = await axios.delete(`${API_URL}/posts/${id}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener posts por usuario
export const getPostsByUser = async (userId) => {
  /**
   * Obtiene los posts de un usuario
   * @function getPostsByUser
   * @param {string} userId - ID del usuario
   * @returns {Object} Objeto con los posts del usuario
   */
  try {
    const response = await axios.get(`${API_URL}/posts/user/${userId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
}; 