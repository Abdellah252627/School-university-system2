import React from 'react';
import { Navigate } from 'react-router-dom';

// مثال: جلب بيانات المستخدم من localStorage أو context
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getUser();

  if (!user) {
    // إذا لم يكن المستخدم مسجلاً الدخول
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // إذا لم يكن الدور مسموحًا له
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 