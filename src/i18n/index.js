import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      login: 'تسجيل الدخول',
      register: 'تسجيل حساب جديد',
      fullname: 'الاسم الكامل',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      email: 'البريد الإلكتروني',
      dashboard: 'لوحة التحكم',
      logout: 'تسجيل الخروج',
      admin_dashboard: 'لوحة تحكم الإدارة',
      teacher_dashboard: 'لوحة تحكم المعلم',
      student_dashboard: 'لوحة تحكم الطالب',
      parent_dashboard: 'لوحة تحكم ولي الأمر',
      login_success: 'تم تسجيل الدخول بنجاح',
      login_error: 'بيانات الدخول غير صحيحة',
      register_success: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.',
      passwords_not_match: 'كلمتا المرور غير متطابقتين',
      manage_teachers: 'إدارة المعلمين',
      manage_students: 'إدارة الطلاب',
      reports_stats: 'التقارير والإحصائيات',
      manage_courses: 'إدارة الدورات',
      manage_attendance: 'إدارة الحضور',
      manage_grades: 'إدارة الدرجات',
      manage_payments: 'إدارة المدفوعات',
      send_notifications: 'إرسال الإشعارات',
      manage_lessons: 'إدارة الدروس',
      manage_assignments: 'إدارة التمارين',
      track_attendance: 'تتبع الحضور',
      view_salary: 'عرض الرواتب',
      view_lessons: 'عرض الدروس',
      view_assignments: 'عرض التمارين',
      view_grades: 'عرض الدرجات',
      view_attendance: 'عرض الحضور',
      receive_notifications: 'استقبال الإشعارات',
      track_children: 'متابعة الأبناء (الدروس، الدرجات، الحضور)',
      view_payments: 'عرض المدفوعات المستحقة',
      arabic: 'العربية',
      english: 'English',
    }
  },
  en: {
    translation: {
      login: 'Login',
      register: 'Register',
      fullname: 'Full Name',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      email: 'Email',
      dashboard: 'Dashboard',
      logout: 'Logout',
      admin_dashboard: 'Admin Dashboard',
      teacher_dashboard: 'Teacher Dashboard',
      student_dashboard: 'Student Dashboard',
      parent_dashboard: 'Parent Dashboard',
      login_success: 'Login successful',
      login_error: 'Invalid login credentials',
      register_success: 'Account created successfully! You can now log in.',
      passwords_not_match: 'Passwords do not match',
      manage_teachers: 'Manage Teachers',
      manage_students: 'Manage Students',
      reports_stats: 'Reports & Statistics',
      manage_courses: 'Manage Courses',
      manage_attendance: 'Manage Attendance',
      manage_grades: 'Manage Grades',
      manage_payments: 'Manage Payments',
      send_notifications: 'Send Notifications',
      manage_lessons: 'Manage Lessons',
      manage_assignments: 'Manage Assignments',
      track_attendance: 'Track Attendance',
      view_salary: 'View Salary',
      view_lessons: 'View Lessons',
      view_assignments: 'View Assignments',
      view_grades: 'View Grades',
      view_attendance: 'View Attendance',
      receive_notifications: 'Receive Notifications',
      track_children: 'Track Children (Lessons, Grades, Attendance)',
      view_payments: 'View Due Payments',
      arabic: 'Arabic',
      english: 'English',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 