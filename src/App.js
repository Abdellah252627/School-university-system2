import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import FilesManager from './pages/FilesManager';
import FilesListView from './pages/FilesListView';
import NotificationsBell from './components/NotificationsBell';
import NotificationsPage from './pages/NotificationsPage';
import { Box } from '@mui/material';
import usePushSubscription from './hooks/usePushSubscription';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  usePushSubscription(user?.id);

  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Router>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1, bgcolor: '#f5f5f5' }}>
          <LanguageSwitcher />
          <NotificationsBell />
        </Box>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/files" element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <FilesManager />
            </ProtectedRoute>
          } />
          <Route path="/files-view" element={
            <ProtectedRoute allowedRoles={['student', 'parent']}>
              <FilesListView />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
