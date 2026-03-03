# Database Connection Guide - HR ATS System

## ✅ Current Status
- **MongoDB Service**: Running on `localhost:27017`
- **Database Name**: `ATS_Tecnoprism`
- **App Connection**: ✓ Active and configured
- **Collections**: ✓ Initialized (users, jobs, applications, scoring_results)

---

## Database Collections Overview

### 1. **users** Collection
Schema for storing user accounts (HR/Admin/Candidates)
```json
{
  "_id": ObjectId,
  "email": String (unique),
  "name": String,
  "role": String ("admin", "hr", "candidate"),
  "password_hash": String,
  "created_at": DateTime
}
```

### 2. **jobs** Collection
Schema for job postings
```json
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "location": String,
  "type": String,
  "salary": String,
  "required_skills": [String],
  "weighted_skills": [
    {
      "name": String,
      "weight": Float
    }
  ],
  "experience_required": Number,
  "education_required": String,
  "created_by": String (User ID),
  "created_at": DateTime
}
```

### 3. **applications** Collection
Schema for job applications
```json
{
  "_id": ObjectId,
  "job_id": String,
  "candidate_id": String,
  "candidate_name": String,
  "job_title": String,
  "resume_file_path": String,
  "extracted_text": String,
  "parsed_data": Object,
  "scoring": Object,
  "rule_score": Float,
  "semantic_score": Float,
  "final_score": Float,
  "ranking_position": Number,
  "status": String ("Applied", "Under Review", "Shortlisted", etc.),
  "applied_at": DateTime
}
```

### 4. **scoring_results** Collection
Schema for AI scoring results
```json
{
  "_id": ObjectId,
  "application_id": String (unique),
  "job_id": String,
  "scores": {
    "rule_based": Float,
    "semantic": Float,
    "final": Float
  },
  "reasoning": String,
  "created_at": DateTime
}
```

---

## How to Connect via MongoDB Compass

### Step 1: Download MongoDB Compass
- [MongoDB Compass Download](https://www.mongodb.com/products/compass)
- Choose the installer for Windows

### Step 2: Open MongoDB Compass
- Launch MongoDB Compass
- Click **New Connection**

### Step 3: Enter Connection String
```
mongodb://localhost:27017
```

### Step 4: Connect
- Click **Connect**
- You should now see the `ATS_Tecnoprism` database with 4 collections

---

## How the App Connects

### Connection Flow
1. **App starts** → `app.main:app` triggers startup event
2. **Startup event** → calls `connect_to_mongo()` from `app/db/mongodb.py`
3. **Connection established** → Motor AsyncIO client connects to MongoDB
4. **Routes access DB** → All endpoints use `get_db()` dependency injection

### Key Files
- `app/core/config.py` - Reads `.env` settings
- `app/db/mongodb.py` - Connection management (Motor AsyncIO)
- `app/core/deps.py` - Dependency injection for database access
- `.env` - Configuration file with `MONGODB_URL` and `DB_NAME`

### Current .env Settings
```
MONGODB_URL=mongodb://localhost:27017/
DB_NAME=ATS_Tecnoprism
```

---

## Verify Connection is Working

### Via API Docs
1. Open http://127.0.0.1:8000/docs
2. Look for this message in the terminal output:
   ```
   Connected to MongoDB: ATS_Tecnoprism
   ```

### Via MongoDB Compass
1. Open Compass
2. Connect to `mongodb://localhost:27017`
3. Browse to `ATS_Tecnoprism` database
4. You should see all 4 collections with 0 or more documents

### Via Python Script (Optional)
```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["ATS_Tecnoprism"]
    collections = await db.list_collection_names()
    print(f"Collections: {collections}")
    client.close()

asyncio.run(check())
```

---

## Initialization Script

The database was initialized with:
```bash
.venv\Scripts\python.exe scripts/init_db.py
```

This script:
- ✓ Creates `users` collection with unique email index
- ✓ Creates `jobs` collection with title and creator indexes
- ✓ Creates `applications` collection with compound indexes
- ✓ Creates `scoring_results` collection with unique application_id index

---

## API Endpoints That Use the Database

### Authentication
- `POST /api/v1/auth/register` - Create new user
- `POST /api/v1/auth/login` - Authenticate user

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile

### Jobs
- `POST /api/v1/jobs` - Create job posting (HR only)
- `GET /api/v1/jobs` - List all jobs
- `GET /api/v1/jobs/{job_id}` - Get job details

### Applications
- `POST /api/v1/applications` - Submit application
- `GET /api/v1/applications` - List applications
- `GET /api/v1/applications/{app_id}` - Get application details

---

## Troubleshooting

### Issue: "Connection refused"
**Solution**: Make sure MongoDB service is running
```bash
# Check if MongoDB is running
netstat -ano | findstr :27017

# If not running, start MongoDB:
# Windows: Use MongoDB service or mongod.exe
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Issue: "Cannot find database"
**Solution**: Run the initialization script
```bash
.venv\Scripts\python.exe scripts/init_db.py
```

### Issue: "Duplicate key error on insert"
**Solution**: The email unique index is enforced. Use a different email for each user.

---

## Next Steps

1. ✅ Database is connected and initialized
2. ✅ FastAPI server is running on http://127.0.0.1:8000
3. ✅ MongoDB is connected and ready at `localhost:27017`
4. → Use API docs at http://127.0.0.1:8000/docs to test endpoints
5. → (Optional) Use MongoDB Compass to browse/manage data visually

---

Generated: 2026-02-16
