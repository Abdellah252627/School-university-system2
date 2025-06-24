const { Message, Conversation, ConversationParticipant, User } = require('../models');

// إرسال رسالة جديدة
exports.sendMessage = async (req, res) => {
  const { conversationId, content, replyToMessageId } = req.body;
  const senderId = req.user.id;
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const attachmentSize = req.file ? req.file.size : null;

  try {
    // التحقق من أن المستخدم مشارك في المحادثة
    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId: senderId,
        isActive: true
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    // إنشاء الرسالة
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      attachmentUrl,
      attachmentSize,
      replyToMessageId: replyToMessageId || null
    });

    // تحديث وقت آخر رسالة في المحادثة
    await Conversation.update(
      { lastMessageAt: new Date() },
      { where: { id: conversationId } }
    );

    // جلب الرسالة مع بيانات المرسل
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: Message,
          as: 'replyTo',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    res.status(201).json(messageWithSender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جلب رسائل محادثة معينة
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user.id;

  try {
    // التحقق من أن المستخدم مشارك في المحادثة
    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId,
        isActive: true
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: Message,
          as: 'replyTo',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      messages: messages.rows.reverse(), // عكس الترتيب لعرض الأحدث في الأسفل
      totalCount: messages.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(messages.count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// إنشاء محادثة جديدة
exports.createConversation = async (req, res) => {
  const { title, type = 'private', participantIds } = req.body;
  const createdBy = req.user.id;

  try {
    // إنشاء المحادثة
    const conversation = await Conversation.create({
      title,
      type,
      createdBy
    });

    // إضافة المنشئ كمشارك
    await ConversationParticipant.create({
      conversationId: conversation.id,
      userId: createdBy,
      role: 'admin'
    });

    // إضافة المشاركين الآخرين
    if (participantIds && participantIds.length > 0) {
      const participants = participantIds.map(userId => ({
        conversationId: conversation.id,
        userId,
        role: 'member'
      }));
      
      await ConversationParticipant.bulkCreate(participants);
    }

    // جلب المحادثة مع المشاركين
    const conversationWithParticipants = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'avatar', 'role'],
          through: { attributes: ['role', 'joinedAt'] }
        }
      ]
    });

    res.status(201).json(conversationWithParticipants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جلب محادثات المستخدم
exports.getUserConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const conversations = await Conversation.findAll({
      include: [
        {
          model: ConversationParticipant,
          as: 'participants',
          where: { userId, isActive: true },
          attributes: []
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'avatar', 'role'],
          through: { 
            attributes: ['role', 'joinedAt'],
            where: { isActive: true }
          }
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      where: { isActive: true },
      order: [['lastMessageAt', 'DESC']]
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تمييز الرسائل كمقروءة
exports.markMessagesAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  try {
    // التحقق من أن المستخدم مشارك في المحادثة
    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId,
        isActive: true
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    // تمييز جميع الرسائل غير المقروءة كمقروءة
    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId,
          senderId: { [require('sequelize').Op.ne]: userId }, // ليس المرسل
          isRead: false
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 