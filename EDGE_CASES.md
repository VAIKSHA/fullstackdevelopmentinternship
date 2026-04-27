# Edge Cases & Testing Guide

## Edge Cases Handled

### 1. Configuration Issues

#### Missing Required Fields
```json
{
  "app": {}  // Missing name, version
}
```
**Handling**: ConfigLoader provides defaults
- name: "Dynamic App"
- version: "1.0.0"
- locale: "en"

#### Invalid Field Types
```json
{
  "database": {
    "tables": [{
      "fields": [
        { "name": "test", "type": "invalid_type" }
      ]
    }]
  }
}
```
**Handling**: SchemaManager defaults to TEXT type

#### Missing Tables Array
```json
{
  "database": {}  // No tables
}
```
**Handling**: System works with empty array, no tables created

### 2. Database Issues

#### Schema Mismatch
- Config adds new field to existing table
- **Handling**: ALTER TABLE IF NOT EXISTS

#### Missing user_id
- Table doesn't have user_id column
- **Handling**: Auto-added by SchemaManager

#### Duplicate Entries
- Unique constraint violation
- **Handling**: Error returned to user with message

### 3. API Issues

#### Missing Endpoint Config
```json
{
  "api": {
    "endpoints": []  // Empty
  }
}
```
**Handling**: No dynamic routes created, system still works

#### Invalid Action
```json
{
  "path": "/api/test",
  "action": "invalid_action"
}
```
**Handling**: Returns 400 error with message

#### Unauthorized Access
- User tries to access another user's data
- **Handling**: WHERE user_id = ? filters all queries

### 4. UI Issues

#### Missing Page Config
```json
{
  "ui": {
    "pages": []  // No pages
  }
}
```
**Handling**: Shows default message "No configuration found"

#### Unknown Component Type
```json
{
  "components": [
    { "type": "unknown_component" }
  ]
}
```
**Handling**: Renders "Unknown component" message

#### Missing DataSource
```json
{
  "type": "table",
  "dataSource": ""  // Empty
}
```
**Handling**: Shows error message in UI

### 5. CSV Import Issues

#### Invalid File Type
- User uploads .xlsx instead of .csv
- **Handling**: Multer rejects with error message

#### Column Mismatch
- CSV has columns not in database
- **Handling**: User can skip unmapped columns

#### Invalid Data
- String in number field
- **Handling**: Row skipped, error logged, import continues

#### Large Files
- CSV with 10,000+ rows
- **Handling**: Batch processing, progress shown

### 6. Authentication Issues

#### Expired Token
- JWT token expired
- **Handling**: 401 error, redirect to login

#### Invalid Credentials
- Wrong email/password
- **Handling**: Error message shown

#### OAuth Failure
- Google OAuth fails
- **Handling**: Redirect to login with error

### 7. Concurrent Operations

#### Multiple Users Creating Same Record
- Race condition on unique fields
- **Handling**: Database constraint, second fails gracefully

#### Config Reload During Request
- Config changes while request processing
- **Handling**: Request uses loaded config, new requests use new config

## Testing Scenarios

### Scenario 1: Incomplete Config
```bash
# Create minimal config
echo '{"app":{"name":"Test"}}' > test-config.json

# Load it
curl -X POST http://localhost:3001/api/config/load \
  -H "Content-Type: application/json" \
  -d @test-config.json

# Expected: System works with defaults
```

### Scenario 2: Add Field to Existing Table
```bash
# Initial config with 'tasks' table
# Add new field 'priority' to tasks
# Reload config
# Expected: Column added automatically
```

### Scenario 3: CSV with Errors
```bash
# Create CSV with mixed valid/invalid data
echo "name,price,stock
Product1,10.99,5
Product2,invalid,10
Product3,20.00,abc" > test.csv

# Import
# Expected: Product1 imported, Product2 and Product3 errors logged
```

### Scenario 4: Unauthorized Access
```bash
# User A creates record
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -d '{"title":"Task A"}'

# User B tries to access
curl http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer USER_B_TOKEN"

# Expected: 404 Not Found (user_id mismatch)
```

### Scenario 5: Missing Required Fields
```bash
# Try to create without required field
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer TOKEN" \
  -d '{"description":"Test"}'  # Missing required 'name'

# Expected: Database error, handled gracefully
```

### Scenario 6: Schema Evolution
```bash
# Day 1: Config with fields [name, price]
# Day 2: Config with fields [name, price, category]
# Day 3: Config with fields [name, price, category, stock]

# Expected: Each reload adds new columns, old data preserved
```

### Scenario 7: Pagination Edge Cases
```bash
# Request page beyond available data
curl "http://localhost:3001/api/tasks?page=999&limit=20"

# Expected: Empty array, no error
```

### Scenario 8: Special Characters
```bash
# Create record with special characters
curl -X POST http://localhost:3001/api/tasks \
  -d '{"title":"Test <script>alert(1)</script>"}'

# Expected: Stored safely, rendered escaped in UI
```

### Scenario 9: Concurrent Updates
```bash
# Two users update same record simultaneously
# User A: PUT /api/tasks/1 {"status":"completed"}
# User B: PUT /api/tasks/1 {"status":"cancelled"}

# Expected: Last write wins, no data corruption
```

### Scenario 10: Config with All Optional Fields
```json
{
  "database": {
    "tables": [{
      "name": "flexible",
      "fields": [
        { "name": "field1", "type": "string" },
        { "name": "field2", "type": "number" },
        { "name": "field3", "type": "boolean" }
      ]
    }]
  }
}
```
**Expected**: All fields nullable, accepts partial data

## Performance Tests

### Large Dataset
```bash
# Import 10,000 records via CSV
# Expected: Completes in < 30 seconds
```

### Concurrent Requests
```bash
# 100 simultaneous API calls
# Expected: All succeed, no connection pool exhaustion
```

### Complex Queries
```bash
# List with filters and pagination
curl "http://localhost:3001/api/tasks?status=pending&priority=1&page=5"

# Expected: Fast response with correct data
```

## Error Recovery

### Database Connection Lost
- **Handling**: Connection pool retries, error message to user

### Invalid JSON in Config
- **Handling**: Parse error caught, default config used

### File System Errors
- **Handling**: Try-catch blocks, error messages

### Network Errors
- **Handling**: Frontend shows error, retry option

## Monitoring Points

1. **Config Load Time**: Should be < 1 second
2. **Schema Creation Time**: Should be < 5 seconds for 10 tables
3. **API Response Time**: Should be < 200ms for simple queries
4. **CSV Import Rate**: Should handle 1000 rows/second
5. **Memory Usage**: Should stay under 512MB for typical workload

## Known Limitations

1. **No Transactions Across Tables**: Each operation is isolated
2. **No Foreign Key Constraints**: Relations not enforced
3. **No Data Migration**: Schema changes don't migrate existing data
4. **No Rollback**: Config changes are immediate
5. **No Versioning**: Only current config is active

## Recommendations for Production

1. Add comprehensive error logging (Sentry, LogRocket)
2. Implement rate limiting (express-rate-limit)
3. Add request validation (Joi, Yup)
4. Implement caching (Redis)
5. Add database migrations (Knex, TypeORM)
6. Implement WebSocket for real-time updates
7. Add comprehensive test suite (Jest, Cypress)
8. Implement CI/CD pipeline
9. Add monitoring (Datadog, New Relic)
10. Implement backup strategy
