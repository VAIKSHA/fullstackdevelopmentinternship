# Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Local Development Setup

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb dynamic_app

# Or using psql
psql -U postgres
CREATE DATABASE dynamic_app;
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/dynamic_app
# JWT_SECRET=your-random-secret-key

# Start backend
npm run dev
```

Backend will run on http://localhost:3001

### 3. Frontend Setup
```bash
cd frontend
npm install

# Frontend is already configured with .env.local
# Start frontend
npm run dev
```

Frontend will run on http://localhost:3000

## Production Deployment

### Option 1: Vercel (Frontend) + Railway (Backend + DB)

#### Backend on Railway:
1. Create Railway account at railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy backend:
   - Connect GitHub repo
   - Set root directory to `/backend`
   - Add environment variables from .env.example
   - Railway will auto-deploy

#### Frontend on Vercel:
1. Create Vercel account at vercel.com
2. Import GitHub repository
3. Set root directory to `/frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`
5. Deploy

### Option 2: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Option 3: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# Install Node.js and PostgreSQL
# Clone repository
git clone <your-repo>

# Setup backend
cd backend
npm install
npm run build
pm2 start dist/index.js --name api

# Setup frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name frontend -- start

# Setup Nginx reverse proxy
# Configure SSL with Let's Encrypt
```

## Environment Variables

### Backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://your-frontend-url.com
NODE_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Configuration Loading

The system loads configuration from:
1. `/shared/example-config.json` (default)
2. Custom path via `CONFIG_PATH` environment variable
3. Runtime via `/api/config/load` endpoint

To use a custom config:
```bash
# Backend
export CONFIG_PATH=/path/to/your/config.json
npm run dev

# Or via API
curl -X POST http://localhost:3001/api/config/load \
  -H "Content-Type: application/json" \
  -d @your-config.json
```

## Testing the System

1. Start both backend and frontend
2. Visit http://localhost:3000
3. Register a new account
4. Load a configuration via API or use the default
5. Test features:
   - Dynamic forms and tables
   - CSV import
   - GitHub export
   - OAuth login

## Troubleshooting

### Database connection errors
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials

### CORS errors
- Check FRONTEND_URL in backend .env
- Ensure frontend URL is correct

### OAuth not working
- Configure OAuth apps in Google/GitHub
- Add correct callback URLs
- Set client IDs and secrets

## Performance Optimization

- Enable PostgreSQL connection pooling
- Add Redis for caching
- Use CDN for frontend assets
- Enable gzip compression
- Add database indexes for large tables

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable rate limiting
- [ ] Sanitize user inputs
- [ ] Use prepared statements (already implemented)
- [ ] Enable CORS only for trusted domains
- [ ] Rotate OAuth secrets regularly
- [ ] Keep dependencies updated
