# School-university-system2 (Frontend)

واجهة المستخدم لتطبيق إدارة المدرسة والجامعة.

## المتطلبات
- Node.js (يفضل الإصدار 14 أو أحدث)
- npm أو yarn

## خطوات التشغيل
1. تثبيت التبعيات:
   ```bash
   npm install
   ```
2. تشغيل التطبيق في وضع التطوير:
   ```bash
   npm start
   ```
   التطبيق سيفتح تلقائياً على: http://localhost:3000

## هيكل المجلدات
```
frontend/
  public/           # ملفات ثابتة وصور وأيقونات
  src/              # كود المصدر الرئيسي
    components/     # مكونات الواجهة
    context/        # إدارة الحالة والسياق
    hooks/          # هوكس مخصصة
    i18n/           # دعم تعدد اللغات
    layouts/        # تخطيطات الصفحات
    pages/          # صفحات التطبيق
    routes/         # حماية وتوجيه المسارات
    utils/          # دوال وأدوات مساعدة
  package.json      # تبعيات المشروع
  README.md         # هذا الملف
```

## ملاحظات
- تأكد من ضبط عنوان الخادم (backend) في ملفات البيئة أو في كود التطبيق حسب مكان تشغيل الواجهة والخلفية.
- التطبيق يدعم تعدد اللغات (عربي/إنجليزي).
- لتخصيص الأيقونات أو الصور، استخدم مجلد public.

---

# School Management System - Backend API

نظام إدارة مدرسة شامل مبني بـ Node.js و Express.js مع قاعدة بيانات PostgreSQL.

## 🚀 المميزات

- **نظام المصادقة**: تسجيل الدخول والخروج مع JWT
- **إدارة المستخدمين**: طلاب، معلمين، أولياء أمور، إدارة
- **نظام الملفات**: رفع وتحميل الملفات مع التحكم في الصلاحيات
- **نظام الدردشة**: محادثات فردية وجماعية
- **الأمان**: تشفير كلمات المرور وحماية المسارات
- **رفع الملفات**: دعم أنواع ملفات متعددة

## 🛠️ التقنيات المستخدمة

- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الخادم
- **PostgreSQL** - قاعدة البيانات
- **Sequelize** - ORM لقاعدة البيانات
- **JWT** - المصادقة والتوكن
- **bcryptjs** - تشفير كلمات المرور
- **Multer** - رفع الملفات
- **CORS** - السماح بالطلبات من مصادر مختلفة

## 📋 المتطلبات

- Node.js (v14 أو أحدث)
- PostgreSQL (v12 أو أحدث)
- npm أو yarn

## ⚙️ التثبيت والإعداد

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد قاعدة البيانات
قم بإنشاء قاعدة بيانات PostgreSQL جديدة:
```sql
CREATE DATABASE school_management_db;
```

### 3. إعداد متغيرات البيئة
قم بتحديث ملف `.env` بالمعلومات الصحيحة:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 4. تشغيل الخادم
```bash
npm start
```

الخادم سيعمل على: `http://localhost:5000`

## 📚 API Documentation

### 🔐 المصادقة (Authentication)

#### تسجيل مستخدم جديد
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "password123",
  "role": "student",
  "gender": "male"
}
```

#### تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

#### جلب الملف الشخصي
```http
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### 👥 المستخدمين (Users)

#### جلب جميع المستخدمين (للإدارة فقط)
```http
GET /api/users?page=1&limit=20&role=student&search=أحمد
Authorization: Bearer YOUR_JWT_TOKEN
```

#### جلب مستخدم محدد
```http
GET /api/users/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 📁 الملفات (Files)

#### رفع ملف جديد (للمعلمين والإدارة)
```http
POST /api/files
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "title": "درس الرياضيات",
  "description": "شرح الجبر",
  "type": "lesson",
  "allowedRoles": ["student", "parent"],
  "file": [FILE]
}
```

#### جلب جميع الملفات
```http
GET /api/files?page=1&limit=20&type=lesson
Authorization: Bearer YOUR_JWT_TOKEN
```

#### تحميل ملف
```http
GET /api/files/:id/download
Authorization: Bearer YOUR_JWT_TOKEN
```

### 💬 الدردشة (Chat)

#### إنشاء محادثة جديدة
```http
POST /api/chat/conversations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "مناقشة الواجب",
  "type": "private",
  "participantIds": [2, 3]
}
```

#### جلب محادثات المستخدم
```http
GET /api/chat/conversations
Authorization: Bearer YOUR_JWT_TOKEN
```

#### إرسال رسالة
```http
POST /api/chat/conversations/:conversationId/messages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "content": "مرحبا، كيف حالكم؟",
  "replyToMessageId": 123,
  "attachment": [FILE]
}
```

## 🗂️ هيكل المشروع

```
644b5e15/
├── controllers/          # المتحكمات
│   ├── authController.js
│   ├── chatController.js
│   └── fileController.js
├── middleware/           # الوسطاء
│   ├── auth.js
│   └── upload.js
├── models/              # نماذج قاعدة البيانات
│   ├── users.js
│   ├── file.js
│   ├── message.js
│   ├── conversation.js
│   ├── conversationParticipant.js
│   └── index.js
├── routes/              # المسارات
│   ├── auth.js
│   ├── users.js
│   ├── chat.js
│   └── files.js
├── uploads/             # مجلد الملفات المرفوعة
├── .env                 # متغيرات البيئة
├── db.js               # إعدادات قاعدة البيانات
├── server.js           # الخادم الرئيسي
└── package.json        # تبعيات المشروع
```

## 👤 أدوار المستخدمين

- **admin**: إدارة كاملة للنظام
- **teacher**: رفع الملفات وإدارة الفصول
- **student**: الوصول للملفات والدردشة
- **parent**: متابعة أطفالهم والتواصل

## 🔒 الأمان

- تشفير كلمات المرور باستخدام bcrypt
- مصادقة JWT للحماية
- التحقق من الصلاحيات لكل مسار
- فلترة أنواع الملفات المرفوعة
- حماية من SQL Injection

## 🚀 التطوير

### تشغيل في وضع التطوير
```bash
npm run dev
```

### فحص الصحة
```http
GET /health
```

## 📝 ملاحظات مهمة

1. **قاعدة البيانات**: تأكد من تشغيل PostgreSQL قبل بدء الخادم
2. **متغيرات البيئة**: قم بتحديث ملف `.env` بالمعلومات الصحيحة
3. **الملفات**: سيتم إنشاء مجلد `uploads` تلقائياً
4. **الأمان**: غير `JWT_SECRET` في الإنتاج
5. **الحجم**: الحد الأقصى لحجم الملف 10MB

## 🐛 استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
- تأكد من تشغيل PostgreSQL
- تحقق من معلومات الاتصال في `.env`

### خطأ في رفع الملفات
- تأكد من وجود مجلد `uploads`
- تحقق من صلاحيات الكتابة

### خطأ في JWT
- تأكد من وجود `JWT_SECRET` في `.env`
- تحقق من صحة التوكن

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
