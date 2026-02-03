# MySchool - Hostinger Cloud Hosting Deployment Guide

This guide covers deploying MySchool to Hostinger Cloud Hosting.

**Authors**: Abhishek & Mahesh  
**Last Updated**: January 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Domain Configuration](#domain-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [SSL Configuration](#ssl-configuration)
7. [Nginx Setup](#nginx-setup)
8. [Database Setup](#database-setup)
9. [Environment Variables](#environment-variables)
10. [Service Management](#service-management)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Hostinger Cloud Hosting plan
- Domain name pointed to Hostinger
- SSH access enabled
- Git installed locally

## Server Setup

### 1. Access Your Server

```bash
ssh root@your-server-ip
```

### 2. Update System

```bash
apt update && apt upgrade -y
```

### 3. Install Required Software

```bash
# Python 3.9+
apt install python3 python3-pip python3-venv -y

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Yarn
npm install -g yarn

# Nginx
apt install nginx -y

# Poppler (for PDF thumbnails)
apt install poppler-utils -y

# Certbot for SSL
apt install certbot python3-certbot-nginx -y
```

## Domain Configuration

### DNS Settings

In Hostinger hPanel, set these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your Server IP |
| A | www | Your Server IP |
| A | api | Your Server IP |

## Backend Deployment

### 1. Create Application Directory

```bash
mkdir -p /var/www/myschool
cd /var/www/myschool
```

### 2. Clone Repository

```bash
git clone https://github.com/your-repo/myschool.git .
```

### 3. Setup Python Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Create Backend Environment File

```bash
nano .env
```

Add the following:

```
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net
DB_NAME=myschool_db

# JWT Authentication
JWT_SECRET=your-secure-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@myschoolct.com

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=myschool
R2_BASE_URL=https://pub-xxx.r2.dev

# CORS
CORS_ORIGINS=https://portal.myschoolct.com,https://www.myschoolct.com

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Groq (Chatbot)
GROQ_API_KEY=your-groq-api-key
```

### 5. Create Systemd Service

```bash
sudo nano /etc/systemd/system/myschool-backend.service
```

Add:

```ini
[Unit]
Description=MySchool Backend API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/myschool/backend
Environment="PATH=/var/www/myschool/backend/venv/bin"
ExecStart=/var/www/myschool/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 6. Start Backend Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable myschool-backend
sudo systemctl start myschool-backend
sudo systemctl status myschool-backend
```

## Frontend Deployment

### 1. Install Dependencies

```bash
cd /var/www/myschool/frontend
yarn install
```

### 2. Create Frontend Environment File

```bash
nano .env
```

Add:

```
REACT_APP_API_URL=https://api.myschoolct.com/api
REACT_APP_BACKEND_URL=https://api.myschoolct.com
```

### 3. Build Production Bundle

```bash
yarn build
```

The build output will be in `/var/www/myschool/frontend/build`

## SSL Configuration

### Obtain SSL Certificate

```bash
certbot --nginx -d myschoolct.com -d www.myschoolct.com -d api.myschoolct.com
```

### Auto-Renewal

```bash
certbot renew --dry-run
```

## Nginx Setup

### Create Configuration File

```bash
sudo nano /etc/nginx/sites-available/myschool
```

Add:

```nginx
# Frontend - Main Domain
server {
    listen 80;
    server_name myschoolct.com www.myschoolct.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name myschoolct.com www.myschoolct.com;

    ssl_certificate /etc/letsencrypt/live/myschoolct.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myschoolct.com/privkey.pem;

    root /var/www/myschool/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 80;
    server_name api.myschoolct.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.myschoolct.com;

    ssl_certificate /etc/letsencrypt/live/myschoolct.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myschoolct.com/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/myschool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at https://mongodb.com/atlas
2. Create a cluster (M0 free tier is fine for starting)
3. Create database user with read/write access
4. Whitelist your server IP (or use 0.0.0.0/0 for all IPs)
5. Get connection string and add to backend `.env`

## Service Management

### Start Services

```bash
sudo systemctl start myschool-backend
sudo systemctl start nginx
```

### Stop Services

```bash
sudo systemctl stop myschool-backend
```

### Restart Services

```bash
sudo systemctl restart myschool-backend
sudo systemctl reload nginx
```

### View Logs

```bash
# Backend logs
journalctl -u myschool-backend -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Updating the Application

### Pull Latest Code

```bash
cd /var/www/myschool
git pull origin main
```

### Update Backend

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart myschool-backend
```

### Update Frontend

```bash
cd frontend
yarn install
yarn build
```

## Troubleshooting

### Backend Won't Start

```bash
# Check service status
sudo systemctl status myschool-backend

# View detailed logs
journalctl -u myschool-backend -n 100

# Test manually
cd /var/www/myschool/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx config
sudo nginx -t

# View Nginx error log
tail -f /var/log/nginx/error.log
```

### Database Connection Issues

1. Verify MONGO_URL in backend `.env`
2. Check MongoDB Atlas IP whitelist
3. Verify database user credentials
4. Test connection:

```bash
cd backend
source venv/bin/activate
python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import asyncio; asyncio.run(AsyncIOMotorClient('your-mongo-url').admin.command('ping'))"
```

### SSL Certificate Issues

```bash
# Renew certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable firewall (UFW)
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor server logs

### Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

**Support**: support@myschoolct.com  
**Documentation**: https://portal.myschoolct.com/docs