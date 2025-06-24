const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } = require('../middleware/auth');

// جلب جميع المستخدمين (للإدارة فقط)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;

  try {
    const whereClause = {};
    
    // فلترة حسب الدور
    if (role) {
      whereClause.role = role;
    }

    // البحث في الاسم أو الإيميل
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'gender', 'avatar', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users: users.rows,
      totalCount: users.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جلب مستخدم محدد
router.get('/:id', authenticateToken, authorizeOwnerOrAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'gender', 'avatar', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تحديث مستخدم (للإدارة فقط)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, email, role, gender } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // التحقق من عدم تكرار الإيميل
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (gender) updateData.gender = gender;

    await User.update(updateData, { where: { id } });

    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'gender', 'avatar', 'createdAt']
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف مستخدم (للإدارة فقط)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // منع حذف الإدارة لنفسها
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await User.destroy({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جلب إحصائيات المستخدمين (للإدارة فقط)
router.get('/stats/overview', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const stats = await User.findAll({
      attributes: [
        'role',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['role']
    });

    const totalUsers = await User.count();

    res.json({
      totalUsers,
      roleStats: stats.map(stat => ({
        role: stat.role,
        count: parseInt(stat.dataValues.count)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 