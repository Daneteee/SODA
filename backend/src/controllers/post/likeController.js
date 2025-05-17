const Like = require('../../models/like');
const Post = require('../../models/post');
const Comment = require('../../models/comment');

// Dar like a un post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Verificar si el post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    // Verificar si el usuario ya dio like al post
    const existingLike = await Like.findOne({
      user: req.user.id,
      post: postId
    });
    
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dado like a este post'
      });
    }
    
    // Crear un nuevo like
    const like = new Like({
      user: req.user.id,
      post: postId
    });
    
    await like.save();
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    res.status(201).json({
      success: true,
      message: 'Like agregado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al dar like al post',
      error: error.message
    });
  }
};

// Quitar like de un post
const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Verificar si el post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    // Buscar y eliminar el like
    const like = await Like.findOneAndDelete({
      user: req.user.id,
      post: postId
    });
    
    if (!like) {
      return res.status(400).json({
        success: false,
        message: 'No has dado like a este post'
      });
    }
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
    res.status(200).json({
      success: true,
      message: 'Like eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al quitar like del post',
      error: error.message
    });
  }
};

// Dar like a un comentario
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Verificar si el comentario existe
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    // Verificar si el usuario ya dio like al comentario
    const existingLike = await Like.findOne({
      user: req.user.id,
      comment: commentId
    });
    
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dado like a este comentario'
      });
    }
    
    // Crear un nuevo like
    const like = new Like({
      user: req.user.id,
      comment: commentId
    });
    
    await like.save();
    
    res.status(201).json({
      success: true,
      message: 'Like agregado correctamente al comentario'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al dar like al comentario',
      error: error.message
    });
  }
};

// Quitar like de un comentario
const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Verificar si el comentario existe
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    // Buscar y eliminar el like
    const like = await Like.findOneAndDelete({
      user: req.user.id,
      comment: commentId
    });
    
    if (!like) {
      return res.status(400).json({
        success: false,
        message: 'No has dado like a este comentario'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Like eliminado correctamente del comentario'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al quitar like del comentario',
      error: error.message
    });
  }
};

// Obtener los likes de un post
const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const likes = await Like.find({ post: postId })
      .populate('user', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      count: likes.length,
      data: likes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los likes del post',
      error: error.message
    });
  }
};

// Obtener los likes de un comentario
const getCommentLikes = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const likes = await Like.find({ comment: commentId })
      .populate('user', '_id name email profileImage');
    
    res.status(200).json({
      success: true,
      count: likes.length,
      data: likes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los likes del comentario',
      error: error.message
    });
  }
};

// Exportar los controladores
module.exports = {
  likePost,
  unlikePost,
  likeComment,
  unlikeComment,
  getPostLikes,
  getCommentLikes
};