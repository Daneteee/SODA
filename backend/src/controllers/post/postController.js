const Post = require('../../models/post');
const Comment = require('../../models/comment');
const Like = require('../../models/like');
const path = require('path');
const fs = require('fs');

// Crear un nuevo post
const createPost = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    const { title, content, category, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'El título y el contenido son requeridos'
      });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const post = new Post({
      title,
      content,
      image: imagePath,
      author: req.user.id,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    console.log('Post a crear:', post);
    const savedPost = await post.save();
    console.log('Post guardado:', savedPost);
    
    res.status(201).json({
      success: true,
      data: savedPost
    });
  } catch (error) {
    console.error('Error detallado al crear post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el post',
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
};

// Obtener todos los posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los posts',
      error: error.message
    });
  }
};

// Obtener un post por su ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email profileImage');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el post',
      error: error.message
    });
  }
};

// Actualizar un post
const updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    // Verificar si el usuario es el autor del post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este post'
      });
    }
    
    const { title, content, category, tags } = req.body;
    
    // Si hay una nueva imagen, eliminar la anterior
    if (req.file) {
      if (post.image) {
        const oldImagePath = path.join(__dirname, '../../..', post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      post.image = `/uploads/${req.file.filename}`;
    }
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
    
    const updatedPost = await post.save();
    
    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el post',
      error: error.message
    });
  }
};

// Eliminar un post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    // Verificar si el usuario es el autor del post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este post'
      });
    }
    
    // Eliminar la imagen si existe
    if (post.image) {
      const imagePath = path.join(__dirname, '../../..', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Eliminar los comentarios del post
    await Comment.deleteMany({ postId: req.params.id });
    
    // Eliminar los likes del post
    await Like.deleteMany({ post: req.params.id });
    
    // Eliminar el post
    await Post.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Post eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el post',
      error: error.message
    });
  }
};

// Obtener posts por usuario
const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('author', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los posts del usuario',
      error: error.message
    });
  }
}; 
// Exportar los controladores
module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUser
};