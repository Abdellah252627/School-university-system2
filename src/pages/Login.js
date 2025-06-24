import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const mockUsers = [
  { fullname: 'manger', password: 'admin123456', role: 'admin' },
  { fullname: 'teacher1', password: 'teacher123', role: 'teacher' },
  { fullname: 'student1', password: 'student123', role: 'student' },
  { fullname: 'parent1', password: 'parent123', role: 'parent' },
];

const roleToDashboard = {
  admin: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
  parent: '/dashboard/parent',
};

const Login = () => {
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = mockUsers.find(
      (u) => u.fullname === fullname && u.password === password
    );
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      enqueueSnackbar(t('login_success'), { variant: 'success' });
      navigate(roleToDashboard[user.role]);
    } else {
      enqueueSnackbar(t('login_error'), { variant: 'error' });
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{maxWidth: 400, margin: 'auto', mt: 8, p: 4}}>
      <Typography variant="h5" align="center" gutterBottom>{t('login')}</Typography>
      <form onSubmit={handleSubmit}>
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
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt: 2}}>
          {t('login')}
        </Button>
      </form>
    </Box>
  );
};

export default Login; 