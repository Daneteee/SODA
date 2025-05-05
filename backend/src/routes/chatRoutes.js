// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas de chat
// Obtener todas las conversaciones del usuario
router.get('/conversations', authMiddleware, chatController.getChatUsers);
// Obtener mensajes de una conversación específica
router.get('/:conversationId/messages', authMiddleware, chatController.getChatMessages);
// Enviar un nuevo mensaje
router.post('/:conversationId/messages', authMiddleware, chatController.sendMessage);
// Crear una nueva conversación
router.post('/new', authMiddleware, chatController.createConversation);

// Obtener todos los usuarios
router.get('/users', authMiddleware, chatController.getAllUsers);
module.exports = router;