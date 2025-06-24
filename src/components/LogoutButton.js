import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  return (
    <button onClick={handleLogout} style={{position: 'absolute', top: 16, left: 16}}>
      {t('logout')}
    </button>
  );
};

export default LogoutButton; 