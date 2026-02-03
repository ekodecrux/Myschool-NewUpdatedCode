# MySchool Platform

## About

MySchool is an educational platform built by Abhishek and Mahesh for schools and educational institutions. The platform provides school management tools, an image bank with over 14,000 educational resources, and a comprehensive Learning Management System.

## Key Features

### School Management
- School onboarding and administration
- User management for teachers, students, and parents
- Attendance tracking with notifications
- Performance analytics and reports

### Image Bank
- 14,000+ educational resources
- Template makers (Chart Maker, Worksheet Creator)
- Category-based organization
- Search with filters

### Learning Management
- Course creation and management
- Assignment submission and grading
- Class timetable management
- Parent-student communication
- Bulk user operations

## User Roles

- **Super Admin** - Platform administration
- **School Admin** - School-level management
- **Teacher** - Course and class management
- **Student** - Learning and assignments
- **Parent** - Child monitoring

## Technology Stack

### Frontend
- React.js with Material UI
- Redux for state management
- React Router for navigation
- Axios for HTTP requests

### Backend
- FastAPI (Python)
- MongoDB database
- JWT authentication
- Uvicorn server

### Infrastructure
- Nginx reverse proxy
- Hostinger Cloud Hosting
- Let's Encrypt SSL
- Cloudflare R2 storage

### Integrations
- Razorpay payment gateway
- Gmail SMTP for notifications
- Firebase push notifications
- Groq for chatbot

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB 4.4+
- Yarn package manager

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=myschool_db
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@myschoolct.com
```

Run server:
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Setup

```bash
cd frontend
yarn install
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:8001/api
```

Run development server:
```bash
yarn start
```

## Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

## Project Structure

See [FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) for detailed directory layout.

## Deployment

See [HOSTINGER_DEPLOYMENT.md](./deployment/HOSTINGER_DEPLOYMENT.md) for production deployment guide.

## Security

- JWT authentication with refresh tokens
- Role-based access control
- Password hashing with bcrypt
- HTTPS enforcement
- CORS configuration
- Input validation

## Support

- Email: support@myschoolct.com
- Documentation: https://portal.myschoolct.com/docs

## License

Proprietary - MySchool Platform

## Credits

**Developed by**: Abhishek & Mahesh  
**Version**: 2.0.0  
**Last Updated**: January 2026
