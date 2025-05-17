const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const  protect  = require('../middlewares/authMiddleware');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUser
} = require('../controllers/post/postController');
const commentController = require('../controllers/post/commentController');
const likeController = require('../controllers/post/likeController');

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  }
});

// Rutas públicas
router.get('/', getPosts);
router.get('/user/:userId', getPostsByUser);

// Rutas de comentarios (protegidas)
router.post('/:postId/comments', protect, commentController.createComment);
router.get('/:postId/comments', commentController.getCommentsByPost);
router.put('/comments/:id', protect, commentController.updateComment);
router.delete('/comments/:id', protect, commentController.deleteComment);

// Rutas de likes (protegidas)
router.post('/:postId/like', protect, likeController.likePost);
router.delete('/:postId/like', protect, likeController.unlikePost);
router.get('/:postId/likes', likeController.getPostLikes);
router.post('/comments/:commentId/like', protect, likeController.likeComment);
router.delete('/comments/:commentId/like', protect, likeController.unlikeComment);

// Rutas de posts (protegidas)
router.post('/', protect, upload.single('image'), createPost);
router.get('/:id', getPostById);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;