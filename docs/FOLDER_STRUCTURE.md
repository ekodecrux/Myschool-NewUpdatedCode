# MySchool - Code Repository Structure

This document provides a detailed overview of the project directory structure.

## Root Directory

```
myschool/
├── backend/              # Python FastAPI backend
├── frontend/             # React.js frontend
├── deployment/           # Deployment configurations
├── docs/                 # Documentation
├── README.md             # Project overview
└── .gitignore            # Git ignore rules
```

## Backend Structure

```
backend/
├── models/
│   ├── __init__.py           # Model exports
│   ├── schemas.py            # Request/response models
│   ├── lms_schemas.py        # LMS data models
│   └── user_role.py          # User role definitions
│
├── routes/
│   ├── __init__.py           # Route exports
│   ├── auth.py               # Authentication endpoints
│   ├── users.py              # User management
│   ├── schools.py            # School operations
│   ├── admin.py              # Admin functions
│   └── lms.py                # LMS endpoints
│
├── services/
│   ├── __init__.py           # Service exports
│   ├── email_service.py      # Email functionality
│   └── storage_service.py    # File storage (R2)
│
├── utils/
│   ├── __init__.py           # Utility exports
│   ├── auth.py               # Auth helpers
│   └── image_deduplication.py # Image processing
│
├── config.py                 # Configuration settings
├── database.py               # MongoDB connection
├── server.py                 # Main FastAPI application
├── requirements.txt          # Python dependencies
├── validation_rules.py       # Input validation
└── .env                      # Environment variables
```

## Frontend Structure

```
frontend/
├── public/
│   ├── index.html            # HTML template
│   ├── manifest.json         # PWA manifest
│   └── favicon.ico           # Site icon
│
├── src/
│   ├── components/
│   │   ├── auth/             # Authentication views
│   │   │   ├── login/        # Login page
│   │   │   ├── signUp/       # Registration page
│   │   │   └── views/        # Dashboard views
│   │   │       ├── navbar/       # Navigation
│   │   │       ├── school/       # School management
│   │   │       ├── teacher/      # Teacher management
│   │   │       ├── student/      # Student management
│   │   │       ├── imageScreen/  # Image gallery
│   │   │       ├── profile/      # User profile
│   │   │       ├── subscription/ # Subscription plans
│   │   │       └── analytics/    # Analytics dashboard
│   │   │
│   │   ├── admin/            # Admin panel
│   │   │   ├── tabs/         # Admin tab views
│   │   │   └── dialogs/      # Modal dialogs
│   │   │
│   │   ├── common/           # Shared components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   │
│   │   ├── homeScreen/       # Landing page
│   │   ├── header/           # Header components
│   │   ├── footer/           # Footer components
│   │   ├── makers/           # Template makers
│   │   ├── chatbot/          # Chatbot widget
│   │   └── search/           # Search functionality
│   │
│   ├── LMS/                  # Learning Management System
│   │   ├── pages/
│   │   │   ├── LMSDashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Assignments.jsx
│   │   │   ├── Grades.jsx
│   │   │   └── Attendance.jsx
│   │   ├── components/       # LMS components
│   │   ├── services/         # LMS API services
│   │   └── utils/            # LMS utilities
│   │
│   ├── Routes/               # Application routing
│   ├── redux/                # State management
│   ├── assests/              # Static assets
│   ├── uicomponent/          # UI components
│   ├── customTheme/          # Theme customization
│   │
│   ├── App.js                # Root component
│   ├── App.css               # Global styles
│   ├── index.js              # Entry point
│   └── index.css             # Base styles
│
├── package.json              # Node dependencies
├── tailwind.config.js        # Tailwind CSS config
├── craco.config.js           # Create React App config
├── postcss.config.js         # PostCSS config
└── .env                      # Environment variables
```

## Deployment Structure

```
deployment/
├── HOSTINGER_DEPLOYMENT.md   # Hostinger deployment guide
└── nginx.conf                # Nginx configuration (if needed)
```

## Documentation Structure

```
docs/
├── FOLDER_STRUCTURE.md       # This file
├── API_DOCUMENTATION.md      # API reference (if exists)
└── LMS_README.md             # LMS documentation (if exists)
```

## Key Files Description

### Backend Files

| File | Description |
|------|-------------|
| `server.py` | Main FastAPI application with all routes |
| `config.py` | Environment configuration settings |
| `database.py` | MongoDB connection setup |
| `schemas.py` | Pydantic models for requests/responses |
| `email_service.py` | Email sending functionality |
| `storage_service.py` | Cloudflare R2 file operations |

### Frontend Files

| File | Description |
|------|-------------|
| `App.js` | Root React component |
| `index.js` | Application entry point |
| `package.json` | Dependencies and scripts |
| `tailwind.config.js` | Tailwind CSS configuration |

## Database Collections

```
myschool_db/
├── users                     # User accounts
├── schools                   # School records
├── classes                   # Class/section data
├── courses                   # Course information
├── assignments               # Assignment records
├── submissions               # Student submissions
├── grades                    # Grade records
├── attendance                # Attendance logs
├── announcements             # Announcements
├── notifications             # User notifications
├── events                    # Calendar events
├── timetables                # Class schedules
├── orders                    # Payment orders
├── my_images                 # User uploaded images
├── resource_images           # Platform image bank
└── user_logs                 # Activity logs
```

## Environment Files

### Backend (.env)
```
MONGO_URL=mongodb://...
DB_NAME=myschool_db
JWT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
```

### Frontend (.env)
```
REACT_APP_API_URL=...
REACT_APP_BACKEND_URL=...
```

---

**Maintained by**: Abhishek & Mahesh  
**Last Updated**: January 2026