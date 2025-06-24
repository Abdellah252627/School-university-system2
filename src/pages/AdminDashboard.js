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
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GradeIcon from '@mui/icons-material/Grade';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsIcon from '@mui/icons-material/Notifications';
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
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import * as XLSX from 'xlsx';
import axios from 'axios';
import EmailIcon from '@mui/icons-material/Email';
import dayjs from 'dayjs';
import Chat from '../components/Chat';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const items = [
    { key: 'manage_teachers', icon: <PeopleIcon /> },
    { key: 'manage_students', icon: <SchoolIcon /> },
    { key: 'reports_stats', icon: <AssessmentIcon /> },
    { key: 'manage_courses', icon: <EventNoteIcon /> },
    { key: 'manage_attendance', icon: <EventNoteIcon /> },
    { key: 'manage_grades', icon: <GradeIcon /> },
    { key: 'manage_payments', icon: <PaymentIcon /> },
    { key: 'send_notifications', icon: <NotificationsIcon /> },
  ];
  const [gender, setGender] = useState('male');
  const [avatar, setAvatar] = useState('');
  // بيانات وهمية للمعلمين
  const [teachers, setTeachers] = useState([
    { id: 1, name: 'أحمد علي', gender: 'male', avatar: '', salary: '', file: null },
    { id: 2, name: 'سارة محمد', gender: 'female', avatar: '', salary: '', file: null },
    { id: 3, name: 'خالد يوسف', gender: 'male', avatar: '', salary: '', file: null },
  ]);
  const [salaryStatus, setSalaryStatus] = useState('all'); // فلتر الحالة
  const [searchName, setSearchName] = useState(''); // فلتر الاسم
  const [importedSalaries, setImportedSalaries] = useState([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [reminderDialog, setReminderDialog] = useState({ open: false, student: null, amount: '', dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD') });
  // معالجة تغيير الراتب أو الملف
  const handleSalaryChange = (id, value) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, salary: value } : t));
  };
  const handleFileChange = (id, file) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, file } : t));
  };
  const handleSend = (id) => {
    enqueueSnackbar('تم إرسال الراتب للمعلم بنجاح!', { variant: 'success' });
    // هنا يمكن إضافة منطق إرسال فعلي لاحقاً
  };
  // معالجة رفع عدة ملفات دفعة واحدة
  const handleMultiFileChange = (e) => {
    const filesArr = Array.from(e.target.files);
    setTeachers(teachers => teachers.map((t, idx) => filesArr[idx] ? { ...t, file: filesArr[idx] } : t));
  };
  // فلترة المعلمين حسب الاسم والحالة
  const filteredTeachers = teachers.filter(t =>
    (!searchName || t.name.includes(searchName)) &&
    (salaryStatus === 'all' || (salaryStatus === 'sent' ? (t.salary || t.file) : !(t.salary || t.file)))
  );
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: 'أحمد علي', amount: 5000, date: '2024-07-01' },
      { name: 'سارة محمد', amount: 5200, date: '2024-07-01' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salaries');
    XLSX.writeFile(wb, 'salaries_template.xlsx');
  };
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    // رفع الملف للسيرفر دائماً
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/salaries/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data && Array.isArray(res.data.salaries)) {
        // تحديث الرواتب في الواجهة
        setTeachers(teachers => teachers.map(t => {
          const found = res.data.salaries.find(s => s.name === t.name);
          return found ? { ...t, salary: found.salary || found.amount || '', file: null } : t;
        }));
        enqueueSnackbar('تم استيراد الرواتب بنجاح من السيرفر!', { variant: 'success' });
      } else {
        enqueueSnackbar('تم رفع الملف وسيتم معالجته من قبل الإدارة.', { variant: 'info' });
      }
    } catch (err) {
      enqueueSnackbar('حدث خطأ أثناء رفع الملف!', { variant: 'error' });
    }
  };
  const [students, setStudents] = useState([
    { id: 1, name: 'محمد خالد', parent: 'خالد يوسف', due: 1500, paid: false },
    { id: 2, name: 'سلمى أحمد', parent: 'أحمد علي', due: 0, paid: true },
    { id: 3, name: 'ليان سارة', parent: 'سارة محمد', due: 800, paid: false },
  ]);
  const handleOpenReminder = (student) => {
    setReminderDialog({ open: true, student, amount: student.due || '', dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD') });
  };
  const handleCloseReminder = () => {
    setReminderDialog({ open: false, student: null, amount: '', dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD') });
  };
  const handleSendReminder = () => {
    enqueueSnackbar(`تم إرسال تذكير إلى ${reminderDialog.student.parent} بمبلغ ${reminderDialog.amount} وآخر يوم دفع ${reminderDialog.dueDate}!`, { variant: 'info' });
    handleCloseReminder();
    // هنا يمكن ربط الإرسال الفعلي لاحقاً
  };
  return (
    <>
      <Paper elevation={3} sx={{ maxWidth: 500, margin: 'auto', mt: 8, p: 4, position: 'relative' }}>
        <LogoutButton />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <ProfileAvatar gender={gender} src={avatar} onChange={url => setAvatar(url)} />
          <Box sx={{ mt: 1 }}>
            <select value={gender} onChange={e => setGender(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </Box>
        </Box>
        <Typography variant="h5" align="center" gutterBottom>{t('admin_dashboard', 'لوحة تحكم الإدارة')}</Typography>
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
        {/* قسم إدارة رواتب المعلمين */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>إدارة رواتب المعلمين</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField size="small" label="بحث بالاسم" value={searchName} onChange={e => setSearchName(e.target.value)} />
            <TextField size="small" select label="حالة الراتب" value={salaryStatus} onChange={e => setSalaryStatus(e.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="sent">تم الإرسال</MenuItem>
              <MenuItem value="not_sent">لم يُرسل</MenuItem>
            </TextField>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              رفع عدة ملفات رواتب
              <input type="file" hidden multiple onChange={handleMultiFileChange} accept=".pdf,.xlsx,.xls" />
            </Button>
            <Button variant="contained" color="info" startIcon={<UploadFileIcon />} onClick={handleDownloadTemplate}>
              تحميل قالب Excel للرواتب
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadFileIcon />} color="success">
              استيراد رواتب من ملف
              <input type="file" hidden onChange={handleImportFile} accept=".xlsx,.xls,.pdf,.doc,.docx" />
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>الجنس</TableCell>
                  <TableCell>الصورة</TableCell>
                  <TableCell>مبلغ الراتب</TableCell>
                  <TableCell>ملف الراتب</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>إرسال</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeachers.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.gender === 'male' ? 'معلم' : 'معلمة'}</TableCell>
                    <TableCell>
                      <ProfileAvatar gender={t.gender} src={t.avatar} />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={t.salary}
                        onChange={e => handleSalaryChange(t.id, e.target.value)}
                        placeholder="أدخل المبلغ"
                        sx={{ minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton component="label">
                        <AttachFileIcon />
                        <input type="file" hidden onChange={e => handleFileChange(t.id, e.target.files[0])} />
                      </IconButton>
                      {t.file && <span style={{fontSize:12}}>{t.file.name}</span>}
                    </TableCell>
                    <TableCell>
                      {(t.salary || t.file) ? <span style={{color:'#43a047'}}>تم الإرسال</span> : <span style={{color:'#888'}}>لم يُرسل</span>}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleSend(t.id)} disabled={!t.salary && !t.file}>
                        <SendIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* قسم تذكير الطلاب وأولياء الأمور بالمستحقات */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>تذكير الطلاب وأولياء الأمور بالمستحقات</Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>اسم الطالب</TableCell>
                  <TableCell>ولي الأمر</TableCell>
                  <TableCell>المستحقات</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تذكير</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.parent}</TableCell>
                    <TableCell>{s.due} ريال</TableCell>
                    <TableCell>{s.paid ? <span style={{color:'#43a047'}}>مدفوع</span> : <span style={{color:'#e65100'}}>غير مدفوع</span>}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenReminder(s)} disabled={s.paid || s.due === 0}>
                        <EmailIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* Dialog إدخال مبلغ وآخر يوم دفع */}
        <Dialog open={reminderDialog.open} onClose={handleCloseReminder} maxWidth="xs" fullWidth>
          <DialogTitle>إرسال تذكير بالمستحقات</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>اسم الطالب: {reminderDialog.student?.name}</Typography>
            <Typography gutterBottom>ولي الأمر: {reminderDialog.student?.parent}</Typography>
            <TextField
              label="المبلغ المستحق"
              type="number"
              fullWidth
              sx={{ my: 2 }}
              value={reminderDialog.amount}
              onChange={e => setReminderDialog(r => ({ ...r, amount: e.target.value }))}
            />
            <TextField
              label="آخر يوم للدفع"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={reminderDialog.dueDate}
              onChange={e => setReminderDialog(r => ({ ...r, dueDate: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReminder}>إلغاء</Button>
            <Button onClick={handleSendReminder} variant="contained" color="primary" disabled={!reminderDialog.amount || !reminderDialog.dueDate}>إرسال التذكير</Button>
          </DialogActions>
        </Dialog>
      </Paper>
      {/* مكون الدردشة الجديد */}
      <div style={{ maxWidth: 900, margin: '40px auto' }}>
        <Chat />
      </div>
    </>
  );
};

export default AdminDashboard; 