const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// إنشاء محادثة جديدة
router.post('/conversations', authenticateToken, chatController.createConversation);

// جلب محادثات المستخدم
router.get('/conversations', authenticateToken, chatController.getUserConversations);

// جلب رسائل محادثة معينة
router.get('/conversations/:conversationId/messages', authenticateToken, chatController.getMessages);

// إرسال رسالة جديدة
router.post('/conversations/:conversationId/messages', 
  authenticateToken,
  upload.single('attachment'),
  handleUploadError,
  chatController.sendMessage
);

// تمييز الرسائل كمقروءة
router.put('/conversations/:conversationId/read', authenticateToken, chatController.markMessagesAsRead);

module.exports = router;