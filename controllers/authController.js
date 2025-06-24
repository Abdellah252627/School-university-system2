const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
  const { name, email, password, role, gender } = req.body;

  try {
    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // تشفير كلمة المرور
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // إنشاء المستخدم
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      gender
    });

    // إنشاء التوكن
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // إرسال الاستجابة (بدون كلمة المرور)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تسجيل الدخول
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // البحث عن المستخدم
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // إنشاء التوكن
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // إرسال الاستجابة (بدون كلمة المرور)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تحديث الملف الشخصي
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, gender } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (gender) updateData.gender = gender;
    if (avatar) updateData.avatar = avatar;

    await User.update(updateData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'gender', 'avatar', 'createdAt']
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تغيير كلمة المرور
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    // جلب المستخدم
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // التحقق من كلمة المرور الحالية
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // تشفير كلمة المرور الجديدة
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // تحديث كلمة المرور
    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جلب الملف الشخصي
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'gender', 'avatar', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تحديث التوكن
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'gender', 'avatar', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // إنشاء توكن جديد
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Token refreshed successfully',
      user,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};