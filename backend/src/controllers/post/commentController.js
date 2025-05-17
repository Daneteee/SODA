const Comment = require('../../models/comment');
const Post = require('../../models/post');
const Like = require('../../models/like');

// Crear un nuevo comentario
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    
    // Verificar si el post existe
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }
    
    const comment = new Comment({
      postId,
      content,
      author: req.user.id
    });
    
    const savedComment = await comment.save();
    
    // Contar comentarios actuales y actualizar el post
    const commentsCount = await Comment.countDocuments({ postId });
    await Post.findByIdAndUpdate(postId, { commentsCount });
    
    // Poblar el autor antes de enviar la respuesta
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('author', 'name email profileImage');
    
    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el comentario',
      error: error.message
    });
  }
};

// Función para recalcular el contador de comentarios
const recalculateCommentCount = async (postId) => {
  try {
    const count = await Comment.countDocuments({ postId });
    await Post.findByIdAndUpdate(postId, { commentsCount: count });
    return count;
  } catch (error) {
    console.error('Error al recalcular contador de comentarios:', error);
    return 0;
  }
};

// Obtener comentarios de un post
const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 })
      .populate('author', 'name email profileImage');
    
    // Actualizar el contador de comentarios en el post
    await Post.findByIdAndUpdate(req.params.postId, { 
      commentsCount: comments.length 
    });
    
    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los comentarios',
      error: error.message
    });
  }
};

// Actualizar un comentario
const updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    // Verificar si el usuario es el autor del comentario
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este comentario'
      });
    }
    
    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    ).populate('author', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el comentario',
      error: error.message
    });
  }
};

// Eliminar un comentario
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    // Verificar si el usuario es el autor del comentario
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este comentario'
      });
    }
    
    // Eliminar los likes del comentario
    await Like.deleteMany({ comment: req.params.id });
    
    // Eliminar el comentario
    await Comment.findByIdAndDelete(req.params.id);
    
    // Contar comentarios actuales y actualizar el post
    const commentsCount = await Comment.countDocuments({ postId: comment.postId });
    await Post.findByIdAndUpdate(comment.postId, { commentsCount });
    
    res.status(200).json({
      success: true,
      message: 'Comentario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el comentario',
      error: error.message
    });
  }
}; 

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
};