const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// استيراد المسارات
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const filesRoutes = require('./routes/files');

// استيراد النماذج لإنشاء الجداول
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// تقديم الملفات الثابتة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', filesRoutes);

// مسار الصحة
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'School Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// معالج المسارات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// بدء الخادم
const startServer = async () => {
  try {
    // مزامنة قاعدة البيانات
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 