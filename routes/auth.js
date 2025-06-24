const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// تسجيل مستخدم جديد
router.post('/register', authController.register);

// تسجيل الدخول
router.post('/login', authController.login);

// جلب الملف الشخصي
router.get('/profile', authenticateToken, authController.getProfile);

// تحديث الملف الشخصي
router.put('/profile', 
  authenticateToken, 
  upload.single('avatar'), 
  handleUploadError,
  authController.updateProfile
);

// تغيير كلمة المرور
router.put('/change-password', authenticateToken, authController.changePassword);

// تحديث التوكن
router.post('/refresh-token', authenticateToken, authController.refreshToken);

module.exports = router;