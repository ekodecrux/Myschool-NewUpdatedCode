# MySchool Platform - Product Requirements Document

## Original Problem Statement

Remove all AI commentary and meta tagging to make the codebase 100% humanized. Use developer names "Abhishek" and "Mahesh" for attribution. Create clean deployment guide for Hostinger Cloud Hosting and folder structure documentation.

## Project Overview

MySchool is a comprehensive educational platform with school management tools, image bank, and Learning Management System.

## Core Requirements

### Humanization Tasks (Completed)
- Removed AI-related terminology from code comments
- Updated chatbot widget references from "AI Assistant" to "Support"
- Changed "AI Tutor" to "Smart Tutor" in plan categories
- Updated email templates to remove "automated message" language
- Updated copyright years to 2026
- Added developer attribution (Abhishek & Mahesh)

### Documentation Created
1. `/README.md` - Main project documentation
2. `/docs/FOLDER_STRUCTURE.md` - Complete directory structure
3. `/deployment/HOSTINGER_DEPLOYMENT.md` - Deployment guide
4. `/frontend/README.md` - Frontend setup guide

## What's Been Implemented

### January 2026 - Humanization Update

**Files Modified:**
- `frontend/src/components/chatbot/ChatbotWidget.jsx` - Support widget
- `frontend/src/components/admin/tabs/SalesPlanTab.jsx` - Plan categories
- `frontend/src/components/admin/tabs/AnalyticsTab.jsx` - Labels
- `frontend/src/App.js` - Widget comment
- `frontend/src/customTheme/textField/MSTextField.jsx` - Comments
- `frontend/src/uicomponent/structureFiltering/constant/filterData.js` - Comments
- `backend/server.py` - Email templates
- `backend/services/email_service.py` - Email templates
- `backend/models/lms_schemas.py` - Docstrings
- `backend/routes/lms.py` - Docstrings

**Files Created:**
- `README.md` - Main documentation
- `docs/FOLDER_STRUCTURE.md` - Directory structure
- `deployment/HOSTINGER_DEPLOYMENT.md` - Deployment guide
- `frontend/README.md` - Frontend guide
- `.gitignore` - Git ignore rules

## User Personas

1. **Super Admin** - Platform administration
2. **School Admin** - School management
3. **Teacher** - Course and class management
4. **Student** - Learning activities
5. **Parent** - Child monitoring

## Tech Stack

- Frontend: React.js, Redux, Material UI
- Backend: FastAPI (Python), MongoDB
- Infrastructure: Nginx, Hostinger Cloud
- Integrations: Razorpay, Gmail SMTP, Firebase, Groq, Cloudflare R2

## Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Mobile app development
- Video lecture integration

### P2 (Medium Priority)
- Quiz builder with grading
- Discussion forums
- Learning path recommendations

### Future
- Offline mode support
- Parent mobile app
- Third-party LMS integration

## Next Steps

1. User to push code to GitHub using "Save to Github" feature
2. Deploy to Hostinger following the deployment guide
3. Configure environment variables on production
4. Set up SSL certificates

---

**Last Updated**: January 2026  
**Developers**: Abhishek & Mahesh
