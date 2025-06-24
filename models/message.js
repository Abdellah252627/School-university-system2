const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'conversation_id'
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_id'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'attachment_url'
  },
  attachmentSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'attachment_size'
  },
  replyToMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reply_to_message_id'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_read'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Message;