const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING, // مثال: lesson, grade, report
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploadedBy: {
    type: DataTypes.INTEGER, // معرّف المستخدم (معلم أو إدارة)
    allowNull: false,
  },
  allowedRoles: {
    type: DataTypes.ARRAY(DataTypes.STRING), // مثال: ['student', 'parent']
    allowNull: false,
    defaultValue: ['student', 'parent'],
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'files',
  timestamps: false,
});

module.exports = File; 