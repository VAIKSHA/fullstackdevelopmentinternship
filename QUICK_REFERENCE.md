# Quick Reference Guide

## 🚀 Quick Start (3 Steps)

```bash
# 1. Setup
./setup.sh

# 2. Start Backend (Terminal 1)
cd backend && npm run dev

# 3. Start Frontend (Terminal 2)
cd frontend && npm run dev
```

Visit: http://localhost:3000

## 📋 Common Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Development mode
npm run build        # Build for production
npm start            # Run production build
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Development mode
npm run build        # Build for production
npm start            # Run production build
```

### Database
```bash
createdb dynamic_app              # Create database
psql dynamic_app                  # Connect to database
dropdb dynamic_app                # Delete database (careful!)
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
```

## 🔧 Configuration

### Load Config via API
```bash
curl -X POST http://localhost:3001/api/config/load \
  -H "Content-Type: application/json" \
  -d @shared/example-config.json
```

### Get Current Config
```bash
curl http://localhost:3001/api/config/current
```

## 🔐 Authentication

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get User Info
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 API Examples

### List Items
```bash
curl http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Item
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","status":"pending"}'
```

### Update Item
```bash
curl -X PUT http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### Delete Item
```bash
curl -X DELETE http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 CSV Import

### Parse CSV
```bash
curl -X POST http://localhost:3001/api/csv/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@data.csv"
```

### Import CSV
```bash
curl -X POST http://localhost:3001/api/csv/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@data.csv" \
  -F "table=tasks" \
  -F 'mapping={"Title":"title","Status":"status"}'
```

## 🚀 GitHub Export

```bash
curl -X POST http://localhost:3001/api/config/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/user/repo.git","token":"ghp_xxx"}'
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -ti:3001
# Kill process
kill -9 $(lsof -ti:3001)
```

### Database Connection Error
```bash
# Check PostgreSQL status
pg_isready
# Start PostgreSQL (macOS)
brew services start postgresql
```

### Reset Database
```bash
dropdb dynamic_app
createdb dynamic_app
# Restart backend to recreate tables
```

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/dynamic_app
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎯 Key Files

### Configuration
- `shared/example-config.json` - Default config
- `shared/ecommerce-config.json` - E-commerce example
- `shared/config-schema.json` - Config schema

### Backend Core
- `backend/src/index.ts` - Main server
- `backend/src/config/loader.ts` - Config loader
- `backend/src/db/schema.ts` - Schema manager
- `backend/src/services/api-generator.service.ts` - API generator

### Frontend Core
- `frontend/app/page.tsx` - Home page
- `frontend/components/DynamicPage.tsx` - Page renderer
- `frontend/components/DynamicForm.tsx` - Form renderer
- `frontend/components/DynamicTable.tsx` - Table renderer

## 🔍 Useful Queries

### Check Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check Columns
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'tasks';
```

### View Data
```sql
SELECT * FROM tasks WHERE user_id = 1;
```

## 📊 Health Checks

### Backend Health
```bash
curl http://localhost:3001/health
```

### Database Connection
```bash
psql -U postgres -d dynamic_app -c "SELECT 1"
```

## 🎨 UI Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Dashboard (auth required)
- `/import` - CSV import (auth required)
- `/export` - GitHub export (auth required)

## 🔗 Useful Links

- Backend API: http://localhost:3001
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432
- API Docs: See ARCHITECTURE.md
- Deployment: See DEPLOYMENT.md
- Edge Cases: See EDGE_CASES.md

## 💡 Pro Tips

1. **Use the setup script**: `./setup.sh` handles everything
2. **Check logs**: Backend logs show all SQL queries
3. **Test with curl**: Faster than UI for API testing
4. **Use example configs**: Start with provided examples
5. **Read error messages**: They're descriptive and helpful
6. **Check EDGE_CASES.md**: For testing scenarios
7. **Use Docker**: Easiest deployment method
8. **Keep it simple**: Start with basic config, add complexity

## 🆘 Getting Help

1. Check error logs in terminal
2. Review ARCHITECTURE.md for design
3. Check EDGE_CASES.md for known issues
4. Review example configs in `/shared`
5. Check database with psql
6. Test API with curl
7. Clear browser cache/localStorage

## ⚡ Performance Tips

1. Use pagination for large datasets
2. Add indexes on frequently queried columns
3. Enable connection pooling (already configured)
4. Use production builds for deployment
5. Enable gzip compression
6. Use CDN for static assets

## 🎓 Learning Resources

- Next.js: https://nextjs.org/docs
- Express: https://expressjs.com
- PostgreSQL: https://www.postgresql.org/docs
- TypeScript: https://www.typescriptlang.org/docs
- React: https://react.dev

---

**Need more help?** Check the full documentation in README.md, ARCHITECTURE.md, and DEPLOYMENT.md
