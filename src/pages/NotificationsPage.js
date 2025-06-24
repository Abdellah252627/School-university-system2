import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Autocomplete from '@mui/material/Autocomplete';

const mockNotifications = [
  { id: 1, title: 'تنبيه حضور', message: 'تم تسجيل غيابك اليوم', date: '2024-07-01', read: false, role: 'student' },
  { id: 2, title: 'مستحقات مالية', message: 'يرجى دفع الرسوم قبل 10-07-2024', date: '2024-06-30', read: false, role: 'parent' },
  { id: 3, title: 'إشعار عام', message: 'تم إضافة درس جديد', date: '2024-06-29', read: true, role: 'teacher' },
  { id: 4, title: 'تنبيه إداري', message: 'يرجى تحديث بياناتك', date: '2024-06-28', read: true, role: 'admin' },
];

const roleOptions = [
  { value: '', labelAr: 'الكل', labelEn: 'All' },
  { value: 'student', labelAr: 'طالب', labelEn: 'Student' },
  { value: 'parent', labelAr: 'ولي أمر', labelEn: 'Parent' },
  { value: 'teacher', labelAr: 'معلم', labelEn: 'Teacher' },
  { value: 'admin', labelAr: 'إدارة', labelEn: 'Admin' },
];

// بيانات وهمية للمستخدمين
const mockUsers = [
  { id: 1, name: 'محمد خالد', email: 'student1@email.com', role: 'student' },
  { id: 2, name: 'سلمى أحمد', email: 'parent1@email.com', role: 'parent' },
  { id: 3, name: 'أحمد علي', email: 'teacher1@email.com', role: 'teacher' },
  { id: 4, name: 'سارة محمد', email: 'parent2@email.com', role: 'parent' },
];

const NotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [readStatus, setReadStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: '', message: '', role: '', recipients: [] });
  const user = JSON.parse(localStorage.getItem('user'));
  const [usersList, setUsersList] = useState(mockUsers); // في التطبيق الفعلي: جلب من API
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/notifications')
      .then(res => setNotifications(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = notifications.filter(n =>
    (!search || n.title.includes(search) || n.message.includes(search)) &&
    (!role || n.role === role) &&
    (readStatus === 'all' || (readStatus === 'read' ? n.read : !n.read))
  );

  const handleMarkRead = (id) => {
    axios.patch(`/api/notifications/${id}/read`).then(() => {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    });
  };

  const handleSendNotif = async () => {
    try {
      const res = await axios.post('/api/notifications', newNotif);
      setNotifications([res.data, ...notifications]);
      enqueueSnackbar('تم إرسال الإشعار بنجاح!', { variant: 'success' });
      setOpenDialog(false);
      setNewNotif({ title: '', message: '', role: '', recipients: [] });
    } catch {
      enqueueSnackbar('حدث خطأ أثناء إرسال الإشعار!', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 6 }}>
      <Typography variant="h5" gutterBottom>{t('notifications_log', 'سجل الإشعارات')}</Typography>
      {user?.role === 'admin' && (
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpenDialog(true)}>
          {t('send_new_notification', 'إرسال إشعار جديد')}
        </Button>
      )}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField size="small" label={t('search', 'بحث')} value={search} onChange={e => setSearch(e.target.value)} />
        <TextField size="small" select label={t('role', 'الفئة')} value={role} onChange={e => setRole(e.target.value)} sx={{ minWidth: 120 }}>
          {roleOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{i18n.language === 'ar' ? opt.labelAr : opt.labelEn}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" select label={t('read_status', 'الحالة')} value={readStatus} onChange={e => setReadStatus(e.target.value)} sx={{ minWidth: 120 }}>
          <MenuItem value="all">{t('all', 'الكل')}</MenuItem>
          <MenuItem value="read">{t('read', 'مقروء')}</MenuItem>
          <MenuItem value="unread">{t('unread', 'غير مقروء')}</MenuItem>
        </TextField>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('title', 'العنوان')}</TableCell>
              <TableCell>{t('message', 'الرسالة')}</TableCell>
              <TableCell>{t('role', 'الفئة')}</TableCell>
              <TableCell>{t('sender', 'المرسل')}</TableCell>
              <TableCell>{t('date', 'التاريخ')}</TableCell>
              <TableCell>{t('status', 'الحالة')}</TableCell>
              <TableCell>{t('actions', 'إجراء')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center">{t('loading', 'جاري التحميل...')}</TableCell></TableRow>
            ) : filtered.map(n => (
              <TableRow key={n.id} sx={{ bgcolor: n.read ? '#fafafa' : '#e3f2fd' }}>
                <TableCell>{n.title}</TableCell>
                <TableCell>{n.message}</TableCell>
                <TableCell>{roleOptions.find(opt => opt.value === n.role)?.[i18n.language === 'ar' ? 'labelAr' : 'labelEn']}</TableCell>
                <TableCell>{n.senderName || t('system', 'النظام')}</TableCell>
                <TableCell>{n.date?.slice(0,10)}</TableCell>
                <TableCell>{n.read ? t('read', 'مقروء') : t('unread', 'غير مقروء')}</TableCell>
                <TableCell>
                  {!n.read && <Button size="small" onClick={() => handleMarkRead(n.id)}>{t('mark_as_read', 'تمييز كمقروء')}</Button>}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">{t('no_notifications', 'لا توجد إشعارات')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={()=>setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('send_new_notification', 'إرسال إشعار جديد')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('title', 'العنوان')}
            fullWidth
            sx={{ mb: 2 }}
            value={newNotif.title}
            onChange={e => setNewNotif(n => ({ ...n, title: e.target.value }))}
          />
          <TextField
            label={t('message', 'الرسالة')}
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 2 }}
            value={newNotif.message}
            onChange={e => setNewNotif(n => ({ ...n, message: e.target.value }))}
          />
          <TextField
            select
            label={t('role', 'الفئة')}
            fullWidth
            value={newNotif.role}
            onChange={e => setNewNotif(n => ({ ...n, role: e.target.value }))}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">{t('all', 'الكل')}</MenuItem>
            <MenuItem value="student">{t('student', 'طالب')}</MenuItem>
            <MenuItem value="parent">{t('parent', 'ولي أمر')}</MenuItem>
            <MenuItem value="teacher">{t('teacher', 'معلم')}</MenuItem>
          </TextField>
          <Autocomplete
            multiple
            options={usersList}
            getOptionLabel={option => `${option.name} (${option.email})`}
            value={usersList.filter(u => newNotif.recipients.includes(u.email))}
            onChange={(_, value) => setNewNotif(n => ({ ...n, recipients: value.map(v => v.email) }))}
            renderInput={params => <TextField {...params} label={t('recipients', 'المستلمون (اختياري)')} placeholder={t('choose_recipients', 'اختر مستلمين محددين')} />}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>{t('cancel', 'إلغاء')}</Button>
          <Button onClick={handleSendNotif} variant="contained" color="primary" disabled={!newNotif.title || !newNotif.message}>{t('send', 'إرسال')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPage; 