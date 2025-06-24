import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
  fontWeight: 'bold',
  fontSize: '1rem',
  borderRadius: 24,
  minWidth: 120,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
  color: '#fff',
  '&:hover': {
    background: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)',
    transform: 'scale(1.08) rotate(-2deg)',
  },
}));

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';
  const handleSwitch = () => {
    i18n.changeLanguage(isAr ? 'en' : 'ar');
    document.body.dir = isAr ? 'ltr' : 'rtl';
  };
  React.useEffect(() => {
    document.body.dir = isAr ? 'rtl' : 'ltr';
  }, [isAr]);
  return (
    <AnimatedButton onClick={handleSwitch} sx={{ position: 'absolute', top: 16, right: 16 }}>
      {isAr ? t('english') : t('arabic')}
    </AnimatedButton>
  );
};

export default LanguageSwitcher; 