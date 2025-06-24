const { File, User } = require('../models');
const path = require('path');
const fs = require('fs');

// رفع ملف جديد
exports.uploadFile = async (req, res) => {
  const { title, description, type, allowedRoles } = req.body;
  const uploadedBy = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const parsedAllowedRoles = allowedRoles ? JSON.parse(allowedRoles) : ['student', 'parent'];

    const file = await File.create({
      title,
      description,
      type,
      fileUrl,
      uploadedBy,
      allowedRoles: parsedAllowedRoles
    });

    // جلب الملف مع بيانات الرافع
    const fileWithUploader = await File.findByPk(file.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileWithUploader
    });
  } catch (err) {
    // حذف الملف في حالة حدوث خطأ
    if (req.file) {
      const filePath = path.join(process.env.UPLOAD_PATH || './uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ error: err.message });
  }
};

// جلب جميع الملفات (مع الفلترة حسب الدور)
exports.getFiles = async (req, res) => {
  const { type, page = 1, limit = 20 } = req.query;
  const userRole = req.user.role;

  try {
    const whereClause = {};
    
    // فلترة حسب النوع إذا تم تحديده
    if (type) {
      whereClause.type = type;
    }

    // فلترة حسب الأدوار المسموحة (إلا للإدارة)
    if (userRole !== 'admin') {
      whereClause.allowedRoles = {
        [require('sequelize').Op.contains]: [userRole]
      };
    }

    const offset = (page - 1) * limit;

    const files = await File.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      files: files.rows,
      totalCount: files.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(files.count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جلب ملف محدد
exports.getFile = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;

  try {
    const file = await File.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // التحقق من الصلاحيات
    if (userRole !== 'admin' && !file.allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تحديث ملف
exports.updateFile = async (req, res) => {
  const { id } = req.params;
  const { title, description, type, allowedRoles } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const file = await File.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // التحقق من الصلاحيات (المالك أو الإدارة)
    if (file.uploadedBy !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (allowedRoles) updateData.allowedRoles = JSON.parse(allowedRoles);

    await File.update(updateData, { where: { id } });

    const updatedFile = await File.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    res.json({
      message: 'File updated successfully',
      file: updatedFile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// حذف ملف
exports.deleteFile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const file = await File.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // التحقق من الصلاحيات (المالك أو الإدارة)
    if (file.uploadedBy !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // حذف الملف من النظام
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(file.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // حذف السجل من قاعدة البيانات
    await File.destroy({ where: { id } });

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تحميل ملف
exports.downloadFile = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;

  try {
    const file = await File.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // التحقق من الصلاحيات
    if (userRole !== 'admin' && !file.allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(file.fileUrl));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // تعيين headers للتحميل
    res.setHeader('Content-Disposition', `attachment; filename="${file.title}${path.extname(filePath)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // إرسال الملف
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جلب الملفات التي رفعها المستخدم
exports.getMyFiles = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const uploadedBy = req.user.id;

  try {
    const offset = (page - 1) * limit;

    const files = await File.findAndCountAll({
      where: { uploadedBy },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      files: files.rows,
      totalCount: files.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(files.count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};