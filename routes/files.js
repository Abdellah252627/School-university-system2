const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// رفع ملف جديد (للمعلمين والإدارة)
router.post('/', 
  authenticateToken, 
  authorizeRoles('teacher', 'admin'),
  upload.single('file'),
  handleUploadError,
  fileController.uploadFile
);

// جلب جميع الملفات
router.get('/', authenticateToken, fileController.getFiles);

// جلب الملفات التي رفعها المستخدم
router.get('/my-files', authenticateToken, fileController.getMyFiles);

// جلب ملف محدد
router.get('/:id', authenticateToken, fileController.getFile);

// تحميل ملف
router.get('/:id/download', authenticateToken, fileController.downloadFile);

// تحديث ملف
router.put('/:id', authenticateToken, fileController.updateFile);

// حذف ملف
router.delete('/:id', authenticateToken, fileController.deleteFile);

module.exports = router;