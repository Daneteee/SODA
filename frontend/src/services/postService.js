import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Configuración de axios con el token
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Crear un nuevo post
export const createPost = async (formData) => {
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
  try {
    const response = await axios.get(`${API_URL}/posts`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un post por ID
export const getPostById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar un post
export const updatePost = async (id, formData) => {
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
  try {
    const response = await axios.delete(`${API_URL}/posts/${id}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener posts por usuario
export const getPostsByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/posts/user/${userId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
}; 