const Message = require("../../models/message");
const User = require("../../models/user");
const Conversation = require("../../models/conversation");

// Obtener todas las conversaciones del usuario
const getChatUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar conversaciones donde el usuario actual es participante
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate({
      path: 'participants',
      match: { _id: { $ne: userId } }, // Excluir al usuario actual
      select: 'name profileImage'
    })
    .sort({ updatedAt: -1 });

    // Obtener el último mensaje de cada conversación
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          $or: [
            { from: userId, to: { $in: conv.participants.map(p => p._id) } },
            { to: userId, from: { $in: conv.participants.map(p => p._id) } }
          ]
        })
        .sort({ timestamp: -1 })
        .limit(1);
        
        return {
          id: conv._id,
          user: conv.participants[0] || {}, // El otro participante
          lastMessage: conv.lastMessage || (lastMessage ? lastMessage.text : ''),
          timestamp: conv.updatedAt
        };
      })
    );
    res.json(conversationsWithLastMessage);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ message: 'Error al obtener conversaciones' });
  }
};

// Obtener mensajes de una conversación específica
const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;

    // Verificar que la conversación exista y que el usuario sea participante
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate({
      path: 'participants',
      match: { _id: { $ne: userId } }, // Excluir al usuario actual
      select: '_id'
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversación no encontrada o no tienes acceso' });
    }

    // Obtener el otro participante de la conversación
    const otherParticipantId = conversation.participants[0]?._id;

    if (!otherParticipantId) {
      return res.status(404).json({ message: 'No se encontró el otro participante de la conversación' });
    }

    // Buscar mensajes entre estos dos usuarios
    const messages = await Message.find({
      $or: [
        { from: userId, to: otherParticipantId },
        { from: otherParticipantId, to: userId }
      ]
    })
    .sort({ timestamp: 1 }) // Ordenar por fecha, los más antiguos primero
    .select('text from to timestamp');

    // Formatear los mensajes para el cliente, indicando cuáles son del usuario actual
    const formattedMessages = messages.map(message => ({
      id: message._id,
      text: message.text,
      timestamp: message.timestamp,
      isMe: message.from.toString() === userId.toString()
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error al obtener mensajes de chat:', error);
    res.status(500).json({ message: 'Error al obtener mensajes de chat' });
  }
};

// Enviar un nuevo mensaje
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    }

    // Verificar que la conversación exista y que el usuario sea participante
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate({
      path: 'participants',
      match: { _id: { $ne: userId } }, // Excluir al usuario actual
      select: '_id'
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversación no encontrada o no tienes acceso' });
    }

    // Obtener el otro participante de la conversación
    const otherParticipantId = conversation.participants[0]?._id;

    if (!otherParticipantId) {
      return res.status(404).json({ message: 'No se encontró el otro participante de la conversación' });
    }

    // Crear y guardar el nuevo mensaje
    const newMessage = new Message({
      from: userId,
      to: otherParticipantId,
      text: text,
      timestamp: new Date()
    });

    await newMessage.save();

    // Actualizar el último mensaje y fecha de actualización de la conversación
    conversation.lastMessage = text;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Formatear el mensaje para la respuesta
    const formattedMessage = {
      id: newMessage._id,
      text: newMessage.text,
      timestamp: newMessage.timestamp,
      isMe: true
    };

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

// Crear una nueva conversación
const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    console.log('Creando conversación entre usuarios:', userId, 'y', targetUserId);

    // Verificar que el usuario destino exista
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      console.log('Usuario destino no encontrado:', targetUserId);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si ya existe una conversación entre estos usuarios
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, targetUserId] }
    });

    if (existingConversation) {
      console.log('Conversación existente encontrada:', existingConversation._id);
      return res.json({
        id: existingConversation._id,
        message: 'Ya existe una conversación con este usuario'
      });
    }

    console.log('Creando nueva conversación entre', userId, 'y', targetUserId);
    
    // Crear nueva conversación
    const newConversation = new Conversation({
      participants: [userId, targetUserId],
      updatedAt: new Date()
    });

    await newConversation.save();

    res.status(201).json({
      id: newConversation._id,
      message: 'Conversación creada con éxito'
    });
  } catch (error) {
    console.error('Error al crear conversación:', error);
    res.status(500).json({ message: 'Error al crear conversación' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    user = req.user.id;
    // Obtener todos los usuarios excepto el usuario actual
    const users = await User.find({ _id: { $ne: user } }).select("-password -email");
    res.json(users);
  } catch (err) {
    console.error("Error al obtener todos los usuarios:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};
module.exports = { 
  getChatUsers,
  getChatMessages,
  sendMessage,
  createConversation,
  getAllUsers
};