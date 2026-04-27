# Architecture Documentation

## System Overview

This is a **config-driven application generator** that converts JSON configurations into fully functional web applications with frontend, backend, and database.

## Core Principles

1. **Configuration-Driven**: Everything is generated from JSON config
2. **Resilient**: Handles incomplete/invalid configurations gracefully
3. **Extensible**: Easy to add new components and features
4. **User-Scoped**: All data is isolated per user

## Architecture Layers

### 1. Configuration Layer
- **ConfigLoader** (`backend/src/config/loader.ts`)
  - Loads and validates JSON configurations
  - Normalizes incomplete configs with defaults
  - Provides fallback for missing fields

### 2. Database Layer
- **SchemaManager** (`backend/src/db/schema.ts`)
  - Dynamically creates tables from config
  - Maps JSON types to SQL types
  - Handles schema evolution (adding columns)
  - Auto-adds user_id for data scoping

### 3. API Layer
- **DynamicAPIGenerator** (`backend/src/services/api-generator.service.ts`)
  - Generates CRUD endpoints from config
  - Automatic user-scoped queries
  - Pagination, filtering, sorting
  - Validation and error handling

### 4. Authentication Layer
- **AuthService** (`backend/src/services/auth.service.ts`)
  - Email/password authentication
  - OAuth (Google, GitHub)
  - JWT token management
  - User session handling

### 5. Feature Services

#### CSV Import Service
- Parse CSV files
- Auto-suggest column mappings
- Batch import with error handling
- User-scoped data insertion

#### GitHub Export Service
- Generate complete project structure
- Create frontend/backend boilerplate
- Initialize Git repository
- Push to GitHub (optional)

### 6. Frontend Layer

#### Dynamic Components
- **DynamicForm**: Renders forms from config
- **DynamicTable**: Renders tables with CRUD
- **DynamicPage**: Orchestrates page rendering
- **CSVImport**: File upload and mapping UI

#### State Management
- React Context for auth
- Local state for component data
- API client with interceptors

## Data Flow

```
Config JSON → ConfigLoader → SchemaManager → Database Tables
                           ↓
                    APIGenerator → Express Routes
                           ↓
                    Frontend Components → UI
```

## Configuration Schema

```json
{
  "app": {
    "name": "string",
    "version": "string",
    "locale": "string",
    "supportedLocales": ["string"]
  },
  "database": {
    "tables": [
      {
        "name": "string",
        "fields": [
          {
            "name": "string",
            "type": "string|number|boolean|date|text|json",
            "required": boolean,
            "unique": boolean,
            "default": any
          }
        ]
      }
    ]
  },
  "ui": {
    "pages": [
      {
        "path": "string",
        "title": "string",
        "type": "form|table|dashboard|custom",
        "dataSource": "string",
        "components": [...]
      }
    ]
  },
  "api": {
    "endpoints": [
      {
        "path": "string",
        "method": "GET|POST|PUT|DELETE",
        "table": "string",
        "action": "list|read|create|update|delete",
        "auth": boolean
      }
    ]
  },
  "auth": {
    "enabled": boolean,
    "methods": ["email", "google", "github"]
  }
}
```

## Edge Case Handling

### Missing Fields
- Default values provided by ConfigLoader
- Optional fields handled gracefully
- UI shows placeholders for missing data

### Invalid Types
- Type mapping with fallbacks (defaults to TEXT)
- Frontend validates before submission
- Backend validates with try-catch

### Schema Mismatches
- ALTER TABLE IF NOT EXISTS for new columns
- Graceful degradation for missing tables
- Error messages instead of crashes

### Concurrent Requests
- PostgreSQL connection pooling
- Transaction support for critical operations
- Optimistic locking for updates

## Security Features

1. **Authentication**
   - JWT with expiration
   - Password hashing (bcrypt)
   - OAuth token validation

2. **Authorization**
   - User-scoped queries (WHERE user_id = ?)
   - Protected routes with middleware
   - Token validation on every request

3. **Input Validation**
   - SQL injection prevention (parameterized queries)
   - XSS prevention (React escaping)
   - File upload restrictions (CSV only)

4. **Data Isolation**
   - Every table has user_id
   - Queries automatically filtered by user
   - No cross-user data access

## Extensibility Points

### Adding New UI Components
1. Create component in `frontend/components/`
2. Add case in `DynamicPage.tsx` renderComponent
3. Define component schema in config

### Adding New Field Types
1. Add type mapping in `SchemaManager`
2. Add input type in `DynamicForm`
3. Update config schema

### Adding New API Actions
1. Add handler in `DynamicAPIGenerator`
2. Define action in config
3. Frontend calls new endpoint

### Adding New Auth Methods
1. Add Passport strategy in `auth.routes.ts`
2. Add route handler
3. Add UI button in login page

## Performance Considerations

1. **Database**
   - Connection pooling (max 20)
   - Indexes on user_id and created_at
   - Pagination for large datasets

2. **API**
   - Response caching (can add Redis)
   - Batch operations for imports
   - Async processing for exports

3. **Frontend**
   - Code splitting (Next.js automatic)
   - Lazy loading components
   - Optimistic UI updates

## Testing Strategy

### Unit Tests
- ConfigLoader validation
- SchemaManager type mapping
- API generator route creation

### Integration Tests
- End-to-end API flows
- Database operations
- Auth flows

### Edge Case Tests
- Empty configs
- Invalid field types
- Missing required fields
- Concurrent updates

## Deployment Architecture

```
Frontend (Vercel/Netlify)
    ↓
Backend (Railway/Heroku)
    ↓
PostgreSQL (Railway/AWS RDS)
```

## Monitoring & Logging

- Console logs for errors
- Request/response logging
- Database query logging
- Performance metrics (can add)

## Future Enhancements

1. **Real-time Updates**: WebSocket support
2. **Advanced Validation**: JSON Schema validation
3. **Caching Layer**: Redis integration
4. **File Storage**: S3 for uploads
5. **Analytics**: Usage tracking
6. **Versioning**: Config version control
7. **Rollback**: Revert to previous configs
8. **Multi-tenancy**: Organization support
9. **API Rate Limiting**: Prevent abuse
10. **Audit Logs**: Track all changes
