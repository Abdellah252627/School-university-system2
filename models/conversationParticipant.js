const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  role: {
    type: DataTypes.STRING, // 'admin', 'member'
    allowNull: false,
    defaultValue: 'member'
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'joined_at'
  },
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'left_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'conversation_participants',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['conversation_id', 'user_id']
    }
  ]
});

module.exports = ConversationParticipant;