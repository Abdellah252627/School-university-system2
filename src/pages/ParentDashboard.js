import React from 'react';
import LogoutButton from '../components/LogoutButton';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ProfileAvatar from '../components/ProfileAvatar';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Chat from '../components/Chat';

const ParentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = [
    { key: 'track_children', icon: <FamilyRestroomIcon /> },
    { key: 'receive_notifications', icon: <NotificationsIcon /> },
    { key: 'view_payments', icon: <PaymentIcon /> },
  ];
  const [gender, setGender] = useState('male');
  const [avatar, setAvatar] = useState('');
  return (
    <>
      <Paper elevation={3} sx={{ maxWidth: 500, margin: 'auto', mt: 8, p: 4, position: 'relative' }}>
        <LogoutButton />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <ProfileAvatar gender={gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'male'} src={avatar} onChange={url => setAvatar(url)} />
          <Box sx={{ mt: 1 }}>
            <select value={gender} onChange={e => setGender(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
              <option value="male">الأب</option>
              <option value="female">الأم</option>
              <option value="other">الوصي</option>
            </select>
          </Box>
        </Box>
        <Typography variant="h5" align="center" gutterBottom>{t('parent_dashboard', 'لوحة تحكم ولي الأمر')}</Typography>
        <Button variant="outlined" color="primary" fullWidth sx={{mb: 2}} onClick={() => navigate('/files-view')}>
          {t('files_list', 'قائمة الملفات')}
        </Button>
        <List>
          {items.map((item, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.key)} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Chat />
    </>
  );
};

export default ParentDashboard; 