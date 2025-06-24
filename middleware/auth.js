const jwt = require('jsonwebtoken');
const User = require('../models/users');

// Middleware للتحقق من صحة التوكن
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware للتحقق من الأدوار
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

// Middleware للتحقق من أن المستخدم يصل لبياناته الخاصة أو أنه admin
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = parseInt(req.params.id);
  if (req.user.id === userId || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. You can only access your own data.' });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwnerOrAdmin
};