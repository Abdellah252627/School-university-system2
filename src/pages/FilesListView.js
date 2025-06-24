import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';

// بيانات وهمية للملفات (نفسها من FilesManager)
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
  {
    id: 3,
    title: 'تقرير نهاية الفصل',
    description: 'تقرير شامل',
    type: 'report',
    fileUrl: '#',
    uploadedBy: 1,
    allowedRoles: ['student', 'parent'],
    createdAt: '2024-06-23',
  },
];

const fileTypes = [
  { value: '', labelAr: 'الكل', labelEn: 'All' },
  { value: 'lesson', labelAr: 'حصة', labelEn: 'Lesson' },
  { value: 'grade', labelAr: 'نقاط', labelEn: 'Grade' },
  { value: 'report', labelAr: 'تقرير', labelEn: 'Report' },
];

const sortOptions = [
  { value: 'createdAt_desc', labelAr: 'الأحدث أولاً', labelEn: 'Newest First' },
  { value: 'createdAt_asc', labelAr: 'الأقدم أولاً', labelEn: 'Oldest First' },
  { value: 'title_asc', labelAr: 'الاسم (أ-ي)', labelEn: 'Title (A-Z)' },
  { value: 'title_desc', labelAr: 'الاسم (ي-أ)', labelEn: 'Title (Z-A)' },
  { value: 'type_asc', labelAr: 'النوع (تصاعدي)', labelEn: 'Type (A-Z)' },
  { value: 'type_desc', labelAr: 'النوع (تنازلي)', labelEn: 'Type (Z-A)' },
];

// دالة ترجع لون خاص لكل نوع ملف
const typeColor = (type) => {
  switch (type) {
    case 'lesson': return '#1976d2'; // أزرق
    case 'grade': return '#43a047'; // أخضر
    case 'report': return '#ff9800'; // برتقالي
    default: return '#888';
  }
};

// دالة استخراج الامتداد من الرابط
const getFileExtension = (url) => {
  if (!url || url === '#') return '';
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : '';
};

// دالة تنسيق الحجم
const formatSize = (size) => {
  if (!size || isNaN(size)) return '';
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
};

const FilesListView = () => {
  const { t, i18n } = useTranslation();
  const [files] = useState(initialFiles);
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null); // {type, url, title}
  const { enqueueSnackbar } = useSnackbar();
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

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

  const handlePreview = async (file) => {
    if (file.fileUrl && file.fileUrl !== '#' && (/image\//.test(file.fileUrl) || /video\//.test(file.fileUrl))) {
      setPreview({
        type: /image\//.test(file.fileUrl) ? 'image' : 'video',
        url: file.fileUrl,
        title: file.title,
        description: file.description
      });
      setTextContent('');
    } else if (file.fileUrl && file.fileUrl !== '#' && (/\.txt$/.test(file.fileUrl) || /\.csv$/.test(file.fileUrl))) {
      setLoadingText(true);
      setPreview({
        type: 'text',
        url: file.fileUrl,
        title: file.title,
        description: file.description
      });
      try {
        const res = await fetch(file.fileUrl);
        const text = await res.text();
        setTextContent(text);
      } catch (e) {
        setTextContent('تعذر تحميل الملف');
      }
      setLoadingText(false);
    }
  };

  const handleClose = () => setPreview(null);

  // دالة نسخ الرابط
  const handleCopyLink = () => {
    if (preview && preview.url) {
      navigator.clipboard.writeText(preview.url);
      enqueueSnackbar('تم نسخ الرابط!', { variant: 'success' });
    }
  };

  // دالة مشاركة الرابط
  const handleShare = () => {
    if (preview && preview.url && navigator.share) {
      navigator.share({
        title: preview.title,
        text: preview.description || '',
        url: preview.url
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, position: 'relative' }}>
        <Typography variant="h5" align="center" gutterBottom>{t('files_list', 'قائمة الملفات')}</Typography>
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
        <List>
          {filteredFiles.map(f => (
            <ListItem key={f.id} divider alignItems="flex-start">
              {(() => {
                if (f.fileUrl && f.fileUrl !== '#' && /image\//.test(f.fileUrl)) {
                  return <img src={f.fileUrl} alt={f.title} style={{width: 40, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 12, cursor: 'pointer', background: typeColor(f.type)}} onClick={() => handlePreview(f)} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /video\//.test(f.fileUrl)) {
                  return <MovieIcon sx={{fontSize: 40, color: typeColor(f.type), mr: 1, cursor: 'pointer', bgcolor: '#f5f5f5', borderRadius: 1, p: 0.5}} onClick={() => handlePreview(f)} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /pdf/.test(f.fileUrl)) {
                  return <PictureAsPdfIcon sx={{fontSize: 40, color: typeColor(f.type), mr: 1, bgcolor: '#f5f5f5', borderRadius: 1, p: 0.5}} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /doc|docx/.test(f.fileUrl)) {
                  return <DescriptionIcon sx={{fontSize: 40, color: typeColor(f.type), mr: 1, bgcolor: '#f5f5f5', borderRadius: 1, p: 0.5}} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /xls|xlsx/.test(f.fileUrl)) {
                  return <TableChartIcon sx={{fontSize: 40, color: typeColor(f.type), mr: 1, bgcolor: '#f5f5f5', borderRadius: 1, p: 0.5}} />;
                }
                if (f.fileUrl && f.fileUrl !== '#' && /ppt|pptx/.test(f.fileUrl)) {
                  return <SlideshowIcon sx={{fontSize: 40, color: typeColor(f.type), mr: 1, bgcolor: '#f5f5f5', borderRadius: 1, p: 0.5}} />;
                }
                return <InsertDriveFileIcon sx={{fontSize: 40, color: typeColor(f.type), mr: 1, bgcolor: '#f5f5f5', borderRadius: 1, p: 0.5}} />;
              })()}
              <ListItemText
                primary={<Stack direction="row" alignItems="center" spacing={1}>
                  <span>{f.title}</span>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 14, bgcolor: f.uploadedBy === 'manger' || f.uploadedBy === 'admin' ? 'primary.main' : 'secondary.main' }}>
                    {f.uploadedBy && f.uploadedBy[0] ? f.uploadedBy[0].toUpperCase() : '?'}
                  </Avatar>
                  <span style={{fontSize: 13, color: '#888'}}>
                    {t('uploaded_by', 'تم الرفع بواسطة')}: {f.uploadedBy === 'manger' || f.uploadedBy === 'admin' ? t('admin', 'الإدارة') : t('teacher', 'معلم')}
                  </span>
                  {/* معلومات إضافية */}
                  <span style={{fontSize: 13, color: '#888'}}>
                    {getFileExtension(f.fileUrl) && ` • ${getFileExtension(f.fileUrl).toUpperCase()}`}
                    {f.fileSize && ` • ${formatSize(f.fileSize)}`}
                  </span>
                </Stack>}
                secondary={
                  <>
                    <span>{t('file_type', 'نوع الملف') + ': ' + (fileTypes.find(opt => opt.value === f.type)?.[i18n.language === 'ar' ? 'labelAr' : 'labelEn'] || f.type)}</span>
                    <br />
                    <span style={{fontSize: 13, color: '#888'}}>{t('uploaded_at', 'تاريخ الرفع')}: {f.createdAt}</span>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" href={f.fileUrl} download>
                  <CloudDownloadIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* نافذة المعاينة */}
      <Dialog open={!!preview} onClose={handleClose} maxWidth="md" PaperProps={{
        sx: { background: 'rgba(0,0,0,0.85)', boxShadow: 0, borderRadius: 2 }
      }}>
        <DialogContent sx={{textAlign: 'center', p: 3}}>
          {preview && (
            <>
              <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>{preview.title}</Typography>
              {preview.description && (
                <Typography variant="body2" sx={{ color: '#eee', mb: 1 }}>{preview.description}</Typography>
              )}
              {/* معلومات إضافية */}
              <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
                {getFileExtension(preview.url) && `${t('file_extension', 'الامتداد')}: ${getFileExtension(preview.url).toUpperCase()} `}
                {preview.fileSize && `• ${t('file_size', 'الحجم')}: ${formatSize(preview.fileSize)}`}
              </Typography>
              {preview.type === 'image' && (
                <img src={preview.url} alt={preview.title} style={{maxWidth: '100%', maxHeight: 500, borderRadius: 8, boxShadow: '0 2px 16px #222'}} />
              )}
              {preview.type === 'video' && (
                <video src={preview.url} controls style={{maxWidth: '100%', maxHeight: 500, borderRadius: 8, boxShadow: '0 2px 16px #222', background: '#000'}} />
              )}
              {preview.type === 'text' && (
                <Box sx={{ maxHeight: 400, overflow: 'auto', bgcolor: '#222', color: '#fff', borderRadius: 2, p: 2, textAlign: 'left', direction: 'ltr', fontFamily: 'monospace', fontSize: 15, mb: 2 }}>
                  {loadingText ? <CircularProgress size={32} sx={{ color: '#fff', mt: 2 }} /> : <pre style={{margin:0, whiteSpace:'pre-wrap'}}>{textContent}</pre>}
                </Box>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <a href={preview.url} download target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <IconButton sx={{ bgcolor: '#fff', color: '#1976d2', '&:hover': { bgcolor: '#1976d2', color: '#fff' } }}>
                    <CloudDownloadIcon />
                  </IconButton>
                </a>
                <IconButton onClick={handleCopyLink} sx={{ bgcolor: '#fff', color: '#43a047', '&:hover': { bgcolor: '#43a047', color: '#fff' } }}>
                  <ContentCopyIcon />
                </IconButton>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <IconButton onClick={handleShare} sx={{ bgcolor: '#fff', color: '#ff9800', '&:hover': { bgcolor: '#ff9800', color: '#fff' } }}>
                    <ShareIcon />
                  </IconButton>
                )}
                <IconButton onClick={handleClose} sx={{ bgcolor: '#fff', color: '#888', '&:hover': { bgcolor: '#888', color: '#fff' } }}>
                  <span style={{fontWeight: 'bold', fontSize: 18}}>×</span>
                </IconButton>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FilesListView; 