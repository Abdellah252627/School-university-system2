import React from 'react';
import LogoutButton from '../components/LogoutButton';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ProfileAvatar from '../components/ProfileAvatar';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';
import Chat from '../components/Chat';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = [
    { key: 'manage_students', icon: <PeopleIcon /> },
    { key: 'manage_lessons', icon: <MenuBookIcon /> },
    { key: 'manage_assignments', icon: <AssignmentIcon /> },
    { key: 'manage_grades', icon: <GradeIcon /> },
    { key: 'track_attendance', icon: <EventAvailableIcon /> },
    { key: 'send_notifications', icon: <NotificationsIcon /> },
    { key: 'view_salary', icon: <PaymentIcon /> },
  ];
  const [gender, setGender] = useState('male');
  const [avatar, setAvatar] = useState('');
  const [salaries, setSalaries] = useState([
    { id: 1, amount: 5000, fileUrl: '#', date: '2024-06-01' },
    { id: 2, amount: 5200, fileUrl: '#', date: '2024-07-01' },
  ]);
  const { enqueueSnackbar } = useSnackbar();

  // دالة محاكاة وصول راتب جديد
  const handleSimulateSalary = () => {
    const newSalary = {
      id: Date.now(),
      amount: 5300,
      fileUrl: '#',
      date: new Date().toISOString().slice(0, 10)
    };
    setSalaries([newSalary, ...salaries]);
    enqueueSnackbar('تم إضافة راتب جديد إلى حسابك!', { variant: 'success' });
  };

  return (
    <>
      <Paper elevation={3} sx={{ maxWidth: 500, margin: 'auto', mt: 8, p: 4, position: 'relative' }}>
        <LogoutButton />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <ProfileAvatar gender={gender} src={avatar} onChange={url => setAvatar(url)} />
          <Box sx={{ mt: 1 }}>
            <select value={gender} onChange={e => setGender(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
              <option value="male">معلم</option>
              <option value="female">معلمة</option>
            </select>
          </Box>
        </Box>
        <Typography variant="h5" align="center" gutterBottom>{t('teacher_dashboard', 'لوحة تحكم المعلم')}</Typography>
        <Button variant="contained" color="primary" fullWidth sx={{mb: 2}} onClick={() => navigate('/files')}>
          {t('files_manager', 'إدارة الملفات')}
        </Button>
        <List>
          {items.map((item, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.key)} />
            </ListItem>
          ))}
        </List>
        {/* قسم رواتبي */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>رواتبي</Typography>
          <Box sx={{ mb: 2, textAlign: 'left' }}>
            <Button variant="outlined" size="small" onClick={handleSimulateSalary}>محاكاة وصول راتب جديد</Button>
          </Box>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>الملف</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>تحميل</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaries.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.amount} ريال</TableCell>
                    <TableCell>{s.fileUrl !== '#' ? <VisibilityIcon color="primary" /> : '-'}</TableCell>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>
                      {s.fileUrl !== '#' && (
                        <IconButton href={s.fileUrl} download>
                          <CloudDownloadIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      <Chat />
    </>
  );
};

export default TeacherDashboard; 