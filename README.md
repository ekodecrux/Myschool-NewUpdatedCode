# MySchool Platform with Integrated LMS

## Overview
MySchool is a comprehensive educational platform combining school management tools with a full-featured Learning Management System (LMS).

## Platform Components

### 1. MySchool Main Application
The core platform providing:
- Image Bank with 14,000+ educational resources
- Template Makers (Chart Maker, Worksheet Creator, etc.)
- School Management
- User Management
- Payment Integration
- Support System

### 2. MySchool LMS (Learning Management System) 🆕
Comprehensive LMS layer built on top of the main application with:
- **Multi-Role Support**: Super Admin, School Admin, Teacher, Student, Parent
- **Course Management**: Complete course lifecycle management
- **Assignment System**: Create, submit, and grade assignments
- **Attendance Tracking**: Daily attendance with parent notifications
- **Grading System**: Flexible grading with analytics
- **Analytics Dashboard**: Role-specific insights and reports
- **Communication**: Announcements, notifications, messaging
- **Calendar**: Events, exams, holidays
- **Bulk Operations**: Auto-password generation for bulk user creation

## Key Features

### For Super Admin
- School onboarding and management
- System-wide analytics across all schools
- Global user management
- Platform configuration

### For School Admin
- **Class Management**: Create and manage classes/sections
- **User Creation**: Bulk create teachers, students, parents with auto-generated passwords
- **Course Oversight**: Monitor all courses and curriculum
- **Staff Management**: Assign teachers to classes
- **Parent Linking**: Link parents to students with permission controls
- **Timetable Management**: Create class schedules
- **School Analytics**: Comprehensive performance reports

### For Teachers
- **Course Creation**: Design courses with syllabus
- **Assignment Management**: Create and publish assignments
- **Grading**: Grade submissions with detailed feedback
- **Attendance**: Mark and track student attendance
- **Exams**: Schedule and manage examinations
- **Communication**: Announcements and messaging
- **Analytics**: Class and student performance metrics

### For Students
- **Course Enrollment**: Access enrolled courses
- **Assignment Submission**: Submit work before deadlines
- **Grade Viewing**: View grades and teacher feedback
- **Attendance History**: Track personal attendance
- **Exam Schedule**: View upcoming exams
- **Notifications**: Stay updated with alerts
- **Performance Analytics**: Track academic progress

### For Parents
- **Child Monitoring**: Link and monitor multiple children
- **Grade Reports**: View children's academic performance
- **Attendance Alerts**: Receive absence notifications
- **Teacher Communication**: Direct messaging with teachers
- **Event Calendar**: Stay informed about school events

## Technology Stack

### Backend
- **Framework**: Python FastAPI
- **Database**: MongoDB (AsyncIOMotor)
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: SMTP (aiosmtplib)
- **Storage**: Cloudflare R2 / AWS S3
- **Payments**: Stripe integration

### Frontend
- **Framework**: React 19
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Forms**: React Hook Form

## Project Structure

```
myschoollocalnew/
├── backend/
│   ├── models/
│   │   ├── schemas.py          # Request/response models
│   │   ├── user_role.py        # User role definitions
│   │   └── lms_schemas.py      # LMS-specific models 🆕
│   ├── routes/
│   │   ├── auth.py             # Authentication routes
│   │   ├── users.py            # User management
│   │   ├── schools.py          # School management
│   │   ├── admin.py            # Admin operations
│   │   └── lms.py              # LMS routes 🆕
│   ├── services/
│   │   ├── email_service.py    # Email functionality
│   │   └── storage_service.py  # File storage
│   ├── utils/
│   │   └── auth.py             # Auth utilities
│   ├── config.py               # Configuration
│   ├── database.py             # Database connection
│   ├── requirements.txt        # Python dependencies
│   └── server.py               # Main FastAPI application
├── frontend/
│   ├── src/
│   │   ├── LMS/                # LMS Module 🆕
│   │   │   ├── pages/
│   │   │   │   ├── LMSDashboard.jsx
│   │   │   │   ├── Courses.jsx
│   │   │   │   ├── Assignments.jsx
│   │   │   │   ├── Grades.jsx
│   │   │   │   └── Attendance.jsx
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   │   └── lmsApi.js
│   │   │   └── utils/
│   │   ├── Routes/
│   │   ├── components/
│   │   ├── redux/
│   │   └── App.js
│   ├── package.json
│   └── craco.config.js
├── API_DOCUMENTATION.md        # Full API documentation
├── LMS_README.md               # LMS-specific documentation 🆕
└── README.md                   # This file
```

## API Endpoints

### Authentication (`/api/rest/auth/`)
- `POST /login` - User login
- `POST /register` - User registration
- `GET /forgotPassword` - Password reset request
- `POST /confirmPassword` - Confirm password reset
- `POST /changePassword` - Change password
- `POST /refreshToken` - Refresh access token

### LMS Endpoints (`/api/rest/lms/`) 🆕

#### Classes
- `POST /classes` - Create class
- `GET /classes` - List classes
- `GET /classes/{id}` - Get class details
- `PATCH /classes/{id}` - Update class
- `DELETE /classes/{id}` - Delete class

#### Courses
- `POST /courses` - Create course
- `GET /courses` - List courses
- `GET /courses/{id}` - Get course details
- `POST /courses/enroll` - Enroll students

#### Assignments
- `POST /assignments` - Create assignment
- `GET /assignments` - List assignments
- `POST /submissions` - Submit assignment
- `POST /submissions/grade` - Grade submission

#### Attendance
- `POST /attendance/mark` - Mark attendance
- `GET /attendance/class/{id}` - Get class attendance
- `GET /attendance/student/{id}/report` - Student report

#### Analytics
- `GET /analytics/student/{id}` - Student analytics
- `GET /analytics/teacher/{id}` - Teacher analytics
- `GET /analytics/school` - School analytics

#### Notifications
- `GET /notifications` - Get notifications
- `PATCH /notifications/{id}/read` - Mark as read

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Database Models

### Core Collections
- `users` - User accounts and profiles
- `schools` - School information
- `institutes` - Institute/organization data
- `orders` - Payment orders
- `my_images` - User-uploaded images
- `resource_images` - Platform image resources

### LMS Collections 🆕
- `classes` - Class/section information
- `courses` - Course details and enrollment
- `assignments` - Assignment data
- `submissions` - Student submissions
- `grades` - Grade records
- `attendance` - Attendance records
- `announcements` - School announcements
- `notifications` - User notifications
- `events` - Calendar events
- `parent_student_links` - Parent-student relationships
- `timetables` - Class schedules
- `exams` - Exam information

## User Roles

### Existing Roles
- `INDIVIDUAL` - Individual users
- `PUBLICATION` - Publication/content creators

### LMS Roles 🆕
- `SUPER_ADMIN` - Platform administrator
- `SCHOOL_ADMIN` - School administrator
- `TEACHER` - Teaching staff
- `STUDENT` - Students
- `PARENT` - Parent/guardian

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=myschool_db
JWT_SECRET=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@myschoolct.com
STRIPE_API_KEY=your-stripe-key
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
EOF

# Run server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Run development server
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **LMS Dashboard**: http://localhost:3000/lms/dashboard

## Key Workflows

### 1. School Admin Onboarding Teachers
```
1. Login as School Admin
2. Navigate to LMS → Teachers
3. Click "Bulk Create Teachers"
4. Upload Excel file or enter manually
5. System generates secure passwords
6. Email credentials to teachers
```

### 2. Teacher Creating Assignment
```
1. Login as Teacher
2. Navigate to LMS → Assignments
3. Click "Create Assignment"
4. Select course, set due date
5. Add instructions and attachments
6. Publish assignment
7. Students receive notification
```

### 3. Student Submitting Assignment
```
1. Login as Student
2. View assignments in dashboard
3. Click on pending assignment
4. Upload submission files
5. Add submission text
6. Submit before deadline
```

### 4. Parent Monitoring Child
```
1. Login as Parent
2. View linked children
3. Select child
4. View grades, attendance, announcements
5. Contact teachers if needed
```

## Deployment

### Production Environment Variables
```bash
# Backend
MONGO_URL=mongodb://production-host:27017
JWT_SECRET=production-secret-key
CORS_ORIGINS=https://portal.myschoolct.com

# Frontend
REACT_APP_API_URL=https://portal.myschoolct.com/api
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- HTTPS enforcement in production
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Performance Optimizations

- Database indexing for fast queries
- Pagination for large datasets
- Caching for frequently accessed data
- CDN for static assets
- Lazy loading of images
- Optimized MongoDB queries

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Support

- **Email**: support@myschoolct.com
- **Documentation**: https://portal.myschoolct.com/docs
- **API Docs**: https://portal.myschoolct.com/api/docs

## Roadmap

### Completed ✅
- Core platform with image bank
- User authentication and authorization
- School management system
- LMS with all core features
- Multi-role support
- Analytics dashboards
- Notification system
- Bulk user operations

### In Progress 🚧
- Mobile app development
- Video lecture integration
- Real-time chat
- Advanced analytics with AI

### Planned 📋
- Quiz builder with auto-grading
- Discussion forums
- Learning path recommendations
- Integration with third-party LMS
- Parent mobile app
- Offline mode support

## License

Proprietary - MySchool Platform

## Credits

**Developed by**: MySchool Development Team  
**Version**: 2.0.0  
**Last Updated**: January 2026

---

For detailed LMS documentation, see [LMS_README.md](./LMS_README.md)  
For API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
