const sequelize = require('../db');
const User = require('./users');
const File = require('./file');
const Message = require('./message');
const Conversation = require('./conversation');
const ConversationParticipant = require('./conversationParticipant');

// تعريف العلاقات

// User - File relationships
User.hasMany(File, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });
File.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// User - Conversation relationships
User.hasMany(Conversation, { foreignKey: 'createdBy', as: 'createdConversations' });
Conversation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User - Message relationships
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Conversation - Message relationships
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// Message - Message relationships (for replies)
Message.hasMany(Message, { foreignKey: 'replyToMessageId', as: 'replies' });
Message.belongsTo(Message, { foreignKey: 'replyToMessageId', as: 'replyTo' });

// Conversation - ConversationParticipant relationships
Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', as: 'participants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User - ConversationParticipant relationships
User.hasMany(ConversationParticipant, { foreignKey: 'userId', as: 'participations' });
ConversationParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Many-to-Many relationship between User and Conversation through ConversationParticipant
User.belongsToMany(Conversation, { 
  through: ConversationParticipant, 
  foreignKey: 'userId', 
  otherKey: 'conversationId',
  as: 'conversations'
});

Conversation.belongsToMany(User, { 
  through: ConversationParticipant, 
  foreignKey: 'conversationId', 
  otherKey: 'userId',
  as: 'users'
});

// تصدير جميع النماذج
module.exports = {
  sequelize,
  User,
  File,
  Message,
  Conversation,
  ConversationParticipant
};