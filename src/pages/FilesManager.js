import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useSnackbar } from 'notistack';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

// بيانات وهمية للملفات
const initialFiles = [
  {
    id: 1,
    title: 'حصة رياضيات',
    description: 'ملف شرح الدرس الأول',
    type: 'lesson',
    fileUrl: '#',
    uploadedBy: 1,
    allowedRoles: ['student', 'parent'],
    createdAt: '2024-06-23',
  },
  {
    id: 2,
    title: 'نقاط الفصل',
    description: 'تقرير نقاط الطلاب',
    type: 'grade',
    fileUrl: '#',
    uploadedBy: 2,
    allowedRoles: ['student', 'parent'],
    createdAt: '2024-06-23',
  },
];

const fileTypes = [
  { value: 'lesson', labelAr: 'حصة', labelEn: 'Lesson' },
  { value: 'grade', labelAr: 'نقاط', labelEn: 'Grade' },
  { value: 'report', labelAr: 'تقرير', labelEn: 'Report' },
];

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'image/jpeg', 'image/png', 'image/jpg', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

const sortOptions = [
  { value: 'createdAt_desc', labelAr: 'الأحدث أولاً', labelEn: 'Newest First' },
  { value: 'createdAt_asc', labelAr: 'الأقدم أولاً', labelEn: 'Oldest First' },
  { value: 'title_asc', labelAr: 'الاسم (أ-ي)', labelEn: 'Title (A-Z)' },
  { value: 'title_desc', labelAr: 'الاسم (ي-أ)', labelEn: 'Title (Z-A)' },
  { value: 'type_asc', labelAr: 'النوع (تصاعدي)', labelEn: 'Type (A-Z)' },
  { value: 'type_desc', labelAr: 'النوع (تنازلي)', labelEn: 'Type (Z-A)' },
];

const FilesManager = () => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [files, setFiles] = useState(initialFiles);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('lesson');
  const [selectedFiles, setSelectedFiles] = useState([]); // array of File
  const [filePreviews, setFilePreviews] = useState([]); // array of {type, url, name}
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [search, setSearch] = useState('');

  // جلب الدور من localStorage (في التطبيق الفعلي من المصادقة)
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdminOrTeacher = user && (user.role === 'admin' || user.role === 'teacher');

  const handleFileChange = (e) => {
    const filesArr = Array.from(e.target.files);
    setSelectedFiles(filesArr);
    setFilePreviews(filesArr.map(f => {
      if (/image\//.test(f.type)) {
        return { type: 'image', url: URL.createObjectURL(f), name: f.name };
      } else if (/video\//.test(f.type)) {
        return { type: 'video', url: URL.createObjectURL(f), name: f.name };
      } else {
        return { type: 'file', url: '', name: f.name };
      }
    }));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFiles.length) return;
    if (!description.trim()) {
      enqueueSnackbar(t('description_required', 'الوصف مطلوب لشرح الملف أو الصورة أو الفيديو'), { variant: 'error' });
      return;
    }
    for (const file of selectedFiles) {
      if (!allowedMimeTypes.includes(file.type)) {
        enqueueSnackbar(t('file_type_error', 'الملف يجب أن يكون PDF أو Word أو Excel أو صورة أو فيديو أو PowerPoint فقط'), { variant: 'error' });
        return;
      }
    }
    const newFiles = selectedFiles.map((file, idx) => ({
      id: Date.now() + idx,
      title,
      description,
      type,
      fileUrl: filePreviews[idx] && filePreviews[idx].url ? filePreviews[idx].url : '#',
      uploadedBy: user ? user.fullname : 'admin',
      allowedRoles: ['student', 'parent'],
      createdAt: new Date().toISOString().slice(0, 10),
    }));
    setFiles([...newFiles, ...files]);
    setTitle('');
    setDescription('');
    setType('lesson');
    setSelectedFiles([]);
    setFilePreviews([]);
    enqueueSnackbar(t('upload_success', 'تم رفع الملف بنجاح!'), { variant: 'success' });
  };

  const handleDelete = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handlePreview = (file) => {
    if (file.fileUrl && file.fileUrl !== '#' && (/image\//.test(file.fileUrl) || /video\//.test(file.fileUrl))) {
      setFilePreviews([{
        type: /image\//.test(file.fileUrl) ? 'image' : 'video',
        url: file.fileUrl,
        name: file.title
      }]);
    }
  };

  const handleClose = () => setFilePreviews([]);

  // تصنيف وترتيب وبحث الملفات
  let filteredFiles = files;
  if (typeFilter) {
    filteredFiles = filteredFiles.filter(f => f.type === typeFilter);
  }
  if (search.trim()) {
    filteredFiles = filteredFiles.filter(f => f.title.toLowerCase().includes(search.trim().toLowerCase()));
  }
  filteredFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'createdAt_desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'createdAt_asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'type_asc':
        return a.type.localeCompare(b.type);
      case 'type_desc':
        return b.type.localeCompare(a.type);
      default:
        return 0;
    }
  });

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, position: 'relative' }}>
        <Typography variant="h5" align="center" gutterBottom>{t('files_manager', 'إدارة الملفات')}</Typography>
        {isAdminOrTeacher && (
          <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
            <TextField
              label={t('file_title', 'اسم الملف')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label={t('file_description', 'وصف الملف')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              select
              label={t('file_type', 'نوع الملف')}
              value={type}
              onChange={e => setType(e.target.value)}
              required
              fullWidth
              margin="normal"
            >
              {fileTypes.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {i18n.language === 'ar' ? opt.labelAr : opt.labelEn}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 160 }} size="small">
                <InputLabel>{t('file_type', 'نوع الملف')}</InputLabel>
                <Select
                  value={typeFilter}
                  label={t('file_type', 'نوع الملف')}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">{t('all_types', 'كل الأنواع')}</MenuItem>
                  {fileTypes.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {i18n.language === 'ar' ? opt.labelAr : opt.labelEn}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel>{t('sort_by', 'ترتيب حسب')}</InputLabel>
                <Select
                  value={sortBy}
                  label={t('sort_by', 'ترتيب حسب')}
                  onChange={e => setSortBy(e.target.value)}
                >
                  {sortOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {i18n.language === 'ar' ? opt.labelAr : opt.labelEn}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={t('search_by_name', 'بحث بالاسم')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
              />
            </Box>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ mt: 2, mb: 2 }}
              fullWidth
            >
              {t('choose_file', 'اختر ملفًا (PDF, Word, Excel, صورة, فيديو, PowerPoint)')}
              <input type="file" hidden multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/jpg,image/gif,video/mp4,video/quicktime,video/x-msvideo,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={handleFileChange} />
            </Button>
            {/* عرض معلومات الملفات المختارة */}
            {selectedFiles.length > 0 && (
              <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
                {selectedFiles.map((file, idx) => (
                  <Box key={file.name + idx} sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>{t('selected_file', 'الملف المختار')}: {file.name}</Typography>
                    <Typography variant="body2" gutterBottom>{t('file_size', 'الحجم')}: {(file.size / 1024).toFixed(1)} KB</Typography>
                    <Typography variant="body2" gutterBottom>{t('file_type', 'نوع الملف')}: {file.type}</Typography>
                    {/* معاينة فورية */}
                    {filePreviews[idx] && filePreviews[idx].type === 'image' && (
                      <img src={filePreviews[idx].url} alt="preview" style={{maxWidth: 120, maxHeight: 120, marginTop: 8, borderRadius: 4}} />
                    )}
                    {filePreviews[idx] && filePreviews[idx].type === 'video' && (
                      <video src={filePreviews[idx].url} controls style={{maxWidth: 180, maxHeight: 120, marginTop: 8, borderRadius: 4}} />
                    )}
                  </Box>
                ))}
              </Box>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={!selectedFiles.length}>
              {t('upload_file', 'رفع الملف')}
            </Button>
          </form>
        )}
        <Typography variant="h6" gutterBottom>{t('files_list', 'قائمة الملفات')}</Typography>
        <List>
          {filteredFiles.map(f => (
            <ListItem key={f.id} divider>
              {/* معاينة أو أيقونة حسب نوع الملف */}
              {(() => {
                if (f.fileUrl && f.fileUrl !== '#' && /image\//.test(f.fileUrl)) {
                  return <img src={f.fileUrl} alt={f.title} style={{width: 40, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 12, cursor: 'pointer'}} onClick={() => handlePreview(f)} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /video\//.test(f.fileUrl)) {
                  return <MovieIcon sx={{fontSize: 40, color: '#1976d2', mr: 1, cursor: 'pointer'}} onClick={() => handlePreview(f)} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /pdf/.test(f.fileUrl)) {
                  return <PictureAsPdfIcon sx={{fontSize: 40, color: 'red', mr: 1}} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /doc|docx/.test(f.fileUrl)) {
                  return <DescriptionIcon sx={{fontSize: 40, color: '#1976d2', mr: 1}} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /xls|xlsx/.test(f.fileUrl)) {
                  return <TableChartIcon sx={{fontSize: 40, color: 'green', mr: 1}} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /ppt|pptx/.test(f.fileUrl)) {
                  return <SlideshowIcon sx={{fontSize: 40, color: '#ff9800', mr: 1}} />;
                }
                return <InsertDriveFileIcon sx={{fontSize: 40, color: '#888', mr: 1}} />;
              })()}
              <ListItemText
                primary={f.title}
                secondary={
                  t('file_type', 'نوع الملف') + ': ' + (fileTypes.find(opt => opt.value === f.type)?.[i18n.language === 'ar' ? 'labelAr' : 'labelEn'] || f.type)
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" href={f.fileUrl} download>
                  <CloudDownloadIcon />
                </IconButton>
                {isAdminOrTeacher && (
                  <IconButton edge="end" color="error" onClick={() => handleDelete(f.id)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* نافذة المعاينة */}
      <Dialog open={!!filePreviews.length} onClose={handleClose} maxWidth="md">
        <DialogContent sx={{textAlign: 'center'}}>
          {filePreviews.length > 0 && filePreviews[0].type === 'image' && (
            <img src={filePreviews[0].url} alt={filePreviews[0].name} style={{maxWidth: '100%', maxHeight: 500}} />
          )}
          {filePreviews.length > 0 && filePreviews[0].type === 'video' && (
            <video src={filePreviews[0].url} controls style={{maxWidth: '100%', maxHeight: 500}} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FilesManager; 