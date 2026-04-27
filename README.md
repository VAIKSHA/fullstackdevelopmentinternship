# Dynamic Application Generator

A production-ready, config-driven system that converts JSON configurations into fully functional web applications with frontend, backend, and database.

## 🎯 Features Implemented

### Core System
✅ **Dynamic Application Runtime**
- Reads JSON configuration
- Generates UI, APIs, and database schema dynamically
- Handles incomplete/invalid configs gracefully
- NOT hardcoded - fully extensible

### Tech Stack
- **Frontend**: Next.js 14 (React 18, TypeScript, Tailwind CSS)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL with dynamic schema generation
- **Auth**: JWT + OAuth (Google)

### 3 Mandatory Features

1. **✅ CSV Import System**
   - Upload CSV files
   - Auto-suggest column mappings
   - Map CSV columns to database fields
   - Batch import with error handling
   - User-scoped data

2. **✅ Multiple Login Methods**
   - Email/password authentication
   - Google OAuth integration
   - Customizable auth UI
   - JWT token management

3. **✅ Export to GitHub**
   - Generate complete project structure
   - Create frontend/backend boilerplate
   - Initialize Git repository
   - Push to GitHub (optional)

### Additional Capabilities
- Multi-language support (config-driven)
- Fully responsive design
- User-scoped data access
- Dynamic forms and tables
- Real-time validation
- Error handling and loading states

## 🚀 Quick Start

### Prerequisites
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or use Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres

# Create database
createdb dynamic_app
```

### Backend Setup
```bash
cd backend
npm install
# .env is already configured for local development
npm run dev
```

Backend runs on http://localhost:3001

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## 📋 Configuration Format

Place your config in `/shared/example-config.json` or load via API:

```json
{
  "app": {
    "name": "Task Manager",
    "version": "1.0.0",
    "locale": "en",
    "supportedLocales": ["en", "es", "fr"]
  },
  "database": {
    "tables": [
      {
        "name": "tasks",
        "fields": [
          { "name": "title", "type": "string", "required": true },
          { "name": "status", "type": "string", "default": "pending" },
          { "name": "priority", "type": "number", "default": 1 }
        ]
      }
    ]
  },
  "ui": {
    "pages": [
      {
        "path": "/tasks",
        "title": "Tasks",
        "type": "table",
        "dataSource": "tasks",
        "auth": true
      }
    ]
  },
  "api": {
    "endpoints": [
      { "path": "/api/tasks", "method": "GET", "table": "tasks", "action": "list", "auth": true },
      { "path": "/api/tasks", "method": "POST", "table": "tasks", "action": "create", "auth": true }
    ]
  }
}
```

## 🧪 Testing the System

### 1. Basic Flow
```bash
# Start backend and frontend
# Visit http://localhost:3000
# Register a new account
# System auto-loads example config
```

### 2. Test CSV Import
```bash
# Create a test CSV file
echo "title,status,priority\nTask 1,pending,1\nTask 2,completed,2" > test.csv

# Go to http://localhost:3000/import
# Upload CSV
# Map columns
# Import data
```

### 3. Test Config Changes
```bash
# Modify /shared/example-config.json
# Add a new field to tasks table
# Reload backend
# System auto-creates new column
```

### 4. Test GitHub Export
```bash
# Go to http://localhost:3000/export
# Click "Export Project"
# Check /tmp for generated project
```

## 🎬 Video Script (5-10 min)

### Introduction (1 min)
"Hi, I'm [Name]. I built a dynamic application generator that converts JSON configs into full-stack applications. Let me show you how it works."

### Architecture Overview (2 min)
"The system has 5 main components:
1. Config Loader - validates and normalizes JSON
2. Schema Manager - creates database tables dynamically
3. API Generator - creates REST endpoints automatically
4. Dynamic UI - renders forms and tables from config
5. Feature Services - CSV import, GitHub export, OAuth"

[Show ARCHITECTURE.md diagram]

### Live Demo (4 min)

**Part 1: Basic Usage**
"Let me start the system and register an account."
[Show registration, login]

"The system loaded this config automatically."
[Show example-config.json]

"Here's the dashboard with dynamically generated tables."
[Show dashboard with tasks table]

**Part 2: CSV Import**
"Now I'll import data from a CSV file."
[Upload CSV, show auto-mapping, import]
"Notice how it auto-suggested the column mappings."

**Part 3: Config Changes**
"Let me modify the config to add a new field."
[Edit config, add 'dueDate' field]
[Restart backend]
"The system automatically created the new column."
[Show new field in UI]

**Part 4: GitHub Export**
"Finally, I can export the entire project."
[Click export, show generated files]

### Edge Cases (2 min)
"The system handles edge cases gracefully:
- Missing fields → defaults provided
- Invalid types → fallback to TEXT
- Incomplete config → still works
- Schema mismatches → auto-resolved"

[Show examples of each]

### Decisions & Tradeoffs (1 min)
"Key decisions:
1. TypeScript for type safety
2. PostgreSQL for relational data
3. User-scoped queries for security
4. Config normalization for resilience
5. Modular architecture for extensibility"

"Tradeoffs:
- Flexibility vs Performance (chose flexibility)
- Type safety vs Dynamic (balanced both)
- Features vs Simplicity (focused on core features)"

### Conclusion (30 sec)
"This system is production-ready, handles real-world edge cases, and is fully extensible. Check out the GitHub repo for deployment instructions."

## 📁 Project Structure

```
dynamic-app-generator/
├── backend/
│   ├── src/
│   │   ├── config/         # Config loader
│   │   ├── db/             # Database & schema manager
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # Auth, CSV, config routes
│   │   ├── services/       # API generator, CSV, GitHub export
│   │   └── index.ts        # Main server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/                # Next.js pages
│   ├── components/         # Dynamic components
│   ├── lib/                # API client, auth context
│   ├── Dockerfile
│   └── package.json
├── shared/
│   ├── config-schema.json  # Config schema definition
│   └── example-config.json # Example configuration
├── ARCHITECTURE.md         # Architecture documentation
├── DEPLOYMENT.md           # Deployment guide
├── docker-compose.yml      # Docker setup
└── README.md              # This file
```

## 🔒 Security Features

- JWT authentication with expiration
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)
- User-scoped data isolation
- CORS configuration
- Input validation

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy with Docker:
```bash
docker-compose up -d
```

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Config
- `POST /api/config/load` - Load configuration
- `GET /api/config/current` - Get current config
- `POST /api/config/export` - Export to GitHub
- `GET /api/config/tables` - List tables

### CSV Import
- `POST /api/csv/parse` - Parse CSV file
- `POST /api/csv/import` - Import CSV data
- `GET /api/csv/columns/:table` - Get table columns
- `POST /api/csv/suggest-mapping` - Auto-suggest mappings

### Dynamic Endpoints
All endpoints defined in config are auto-generated:
- `GET /api/{table}` - List items
- `GET /api/{table}/:id` - Get item
- `POST /api/{table}` - Create item
- `PUT /api/{table}/:id` - Update item
- `DELETE /api/{table}/:id` - Delete item

## 🧩 Extensibility

### Add New UI Component
1. Create component in `frontend/components/`
2. Add case in `DynamicPage.tsx`
3. Use in config

### Add New Field Type
1. Add mapping in `SchemaManager`
2. Add input in `DynamicForm`
3. Use in config

### Add New Auth Method
1. Add Passport strategy
2. Add route handler
3. Add UI button

## 🐛 Troubleshooting

**Database connection error**
```bash
# Check PostgreSQL is running
pg_isready

# Create database if missing
createdb dynamic_app
```

**Port already in use**
```bash
# Change PORT in backend/.env
# Change port in frontend/.env.local
```

**OAuth not working**
```bash
# Configure OAuth apps in Google Console
# Add callback URL: http://localhost:3001/api/auth/google/callback
# Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env
```

## 📝 License

MIT

## 🤝 Contributing

This is an internship assignment project. For production use, consider adding:
- Unit tests
- Integration tests
- Rate limiting
- Caching (Redis)
- File storage (S3)
- Real-time updates (WebSocket)
- Advanced validation
- Audit logs

## 📧 Contact

For questions about this implementation, refer to the video walkthrough or documentation files.
