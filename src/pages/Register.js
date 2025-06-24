import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const Register = () => {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      enqueueSnackbar(t('passwords_not_match'), { variant: 'error' });
      return;
    }
    // هنا يمكن إرسال البيانات للسيرفر لاحقًا
    enqueueSnackbar(t('register_success'), { variant: 'success' });
    setEmail('');
    setFullname('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Box component={Paper} elevation={3} sx={{maxWidth: 400, margin: 'auto', mt: 8, p: 4}}>
      <Typography variant="h5" align="center" gutterBottom>{t('register')}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label={t('email')}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label={t('fullname')}
          value={fullname}
          onChange={e => setFullname(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label={t('password')}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label={t('confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt: 2}}>
          {t('register')}
        </Button>
      </form>
    </Box>
  );
};

export default Register; 