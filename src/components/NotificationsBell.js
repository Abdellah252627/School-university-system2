import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const mockNotifications = [
  { id: 1, title: 'تنبيه حضور', message: 'تم تسجيل غيابك اليوم', date: '2024-07-01', read: false },
  { id: 2, title: 'مستحقات مالية', message: 'يرجى دفع الرسوم قبل 10-07-2024', date: '2024-06-30', read: false },
  { id: 3, title: 'إشعار عام', message: 'تم إضافة درس جديد', date: '2024-06-29', read: true },
];

const NotificationsBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleMarkRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1 }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 320, maxWidth: 360 } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" fontSize={17}>الإشعارات</Typography>
        </Box>
        <List sx={{ maxHeight: 320, overflow: 'auto' }}>
          {notifications.length === 0 && (
            <ListItem>
              <ListItemText primary="لا توجد إشعارات جديدة" />
            </ListItem>
          )}
          {notifications.map(n => (
            <ListItem key={n.id} alignItems="flex-start" sx={{ bgcolor: n.read ? '#fafafa' : '#e3f2fd', cursor: 'pointer' }} onClick={() => handleMarkRead(n.id)}>
              <ListItemText
                primary={<span style={{ fontWeight: n.read ? 400 : 700 }}>{n.title}</span>}
                secondary={<>
                  <span>{n.message}</span><br />
                  <span style={{ fontSize: 12, color: '#888' }}>{n.date}</span>
                </>}
              />
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};

export default NotificationsBell; 