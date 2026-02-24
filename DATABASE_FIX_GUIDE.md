# Database Connection & Data Insertion Fix 🔧

## Issue
Data is not being inserted into MongoDB database

## Root Causes & Solutions

---

## ✅ Solution 1: Login as Admin or HR

### Problem
You're logged in as **Candidate** (Mansi), but only **Admin** and **HR** can create jobs.

### Fix - Use Correct Admin Credentials

**Your actual admin credentials (from config):**
```
Email: admin@ats.local
Password: Admin@12345
```

**Steps:**
1. Sign out from current account
2. Login with admin credentials above
3. Try creating job again
4. ✅ Should work now!

---

## ✅ Solution 2: Verify Database Connection

### Check Database Name
Your backend is connected to: **`ATS_Tecnoprism`**

**In MongoDB Compass:**
1. Look at left sidebar
2. Find database: **`ATS_Tecnoprism`**
3. Click to expand
4. Should see collections:
   - `users` ✅ (You have 4 users)
   - `jobs` (Check if exists)
   - `applications` (Check if exists)

### Your Current Database
From your screenshot, I can see:
- ✅ Database: `ATS_tecnoprism` exists
- ✅ Collection: `users` exists with 4 users
- ❓ Collection: `jobs` - need to check
- ❓ Collection: `applications` - need to check

---

## ✅ Solution 3: Test Data Insertion

### Test 1: Create a User (Should Work)
```
1. Sign out
2. Go to signup page
3. Create new account:
   Name: Test User
   Email: test@example.com
   Password: password123
   Role: HR
4. Sign up
5. Check MongoDB Compass
6. ✅ New user should appear in `users` collection
```

### Test 2: Create a Job (Requires Admin/HR)
```
1. Login as: admin@ats.local / Admin@12345
2. Go to Jobs page
3. Click "Post New Job"
4. Fill form:
   Title: Test Job
   Location: Test City
   Type: Full-time
   Salary: 10-15 LPA
   Experience: 2
   Skills: React, Node.js
   Description: Test description
5. Click "Post Job"
6. Check MongoDB Compass
7. ✅ New job should appear in `jobs` collection
```

### Test 3: Apply for Job (As Candidate)
```
1. Login as candidate (Mansi)
2. Go to Resume Screening & Apply
3. Select a job
4. Upload resume
5. Apply
6. Check MongoDB Compass
7. ✅ New application should appear in `applications` collection
```

---

## ✅ Solution 4: Check Backend Logs

### View Backend Terminal
Look at the terminal running the backend for errors:

**Common errors:**
```
❌ "Operation not permitted" → Wrong role (need Admin/HR)
❌ "Could not validate credentials" → Token expired, re-login
❌ "Email already registered" → User exists
❌ "Job not found" → Invalid job ID
```

**Success messages:**
```
✅ POST /api/v1/auth/register 200 OK
✅ POST /api/v1/jobs/ 200 OK
✅ POST /api/v1/applications/apply 200 OK
```

---

## ✅ Solution 5: Verify Collections Exist

### Check in MongoDB Compass

**Expected collections in `ATS_Tecnoprism` database:**

1. **`users`** ✅ (You have this)
   - Stores: User accounts
   - Your data: Mansi, Sujal, Mansi Parikh, Fiza

2. **`jobs`** ❓ (Check if exists)
   - Stores: Job postings
   - Created when: Admin/HR posts first job

3. **`applications`** ❓ (Check if exists)
   - Stores: Job applications
   - Created when: Candidate applies for first job

4. **`scoring_results`** ❓ (Optional)
   - Stores: Resume scoring results

**Note:** Collections are created automatically when first document is inserted.

---

## ✅ Solution 6: Test with Browser Console

### Check API Calls

**Open Browser Console (F12) → Network tab:**

1. Try creating a job
2. Look for request to: `POST http://localhost:8000/api/v1/jobs/`
3. Check response:
   - **200 OK** ✅ Success - check MongoDB
   - **403 Forbidden** ❌ Wrong role - login as Admin/HR
   - **401 Unauthorized** ❌ Not logged in or token expired
   - **400 Bad Request** ❌ Invalid data - check form fields

### Check localStorage

**In Console:**
```javascript
// Check your current role
console.log(localStorage.getItem("ats-role"));
// Should show: "candidate", "hr", or "admin"

// Check your token
console.log(localStorage.getItem("ats-token"));
// Should show: JWT token string

// Check your name
console.log(localStorage.getItem("ats-user-name"));
// Should show: "Mansi"
```

---

## Complete Testing Checklist

### ✅ Step 1: Verify Database Connection
```
[ ] MongoDB is running (check MongoDB Compass)
[ ] Database `ATS_Tecnoprism` exists
[ ] Collection `users` exists with 4 users
```

### ✅ Step 2: Login as Admin
```
[ ] Sign out from current account
[ ] Login with: admin@ats.local / Admin@12345
[ ] Check top right shows "Admin" role
```

### ✅ Step 3: Create Test Job
```
[ ] Go to Jobs page
[ ] Click "Post New Job"
[ ] Fill all required fields
[ ] Click "Post Job"
[ ] Check for success message
[ ] Refresh MongoDB Compass
[ ] Verify job appears in `jobs` collection
```

### ✅ Step 4: Verify in MongoDB
```
[ ] Open MongoDB Compass
[ ] Select database: ATS_Tecnoprism
[ ] Click collection: jobs
[ ] See your test job
[ ] Note the _id field
```

---

## Common Issues & Fixes

### Issue 1: "Operation not permitted"
**Cause:** Logged in as Candidate
**Fix:** Login as `admin@ats.local` / `Admin@12345`

### Issue 2: No data in MongoDB
**Cause:** Looking at wrong database
**Fix:** Check database `ATS_Tecnoprism` (not `ATS_tecnoprism` or `hr_ats`)

### Issue 3: Collection doesn't exist
**Cause:** No data inserted yet
**Fix:** Collections are created on first insert - try creating data

### Issue 4: Backend not responding
**Cause:** Backend not running
**Fix:** Check terminal, restart if needed

### Issue 5: Token expired
**Cause:** Logged in too long ago
**Fix:** Logout and login again

---

## Correct Admin Credentials

**From your backend config:**
```
Email: admin@ats.local
Password: Admin@12345
```

**NOT:**
```
❌ admin@tecnoprism.com (This doesn't exist)
❌ admin123 (Wrong password)
```

---

## Database Configuration

**From your `.env` file:**
```
MONGODB_URL=mongodb://localhost:27017/
DB_NAME=ATS_Tecnoprism
```

**This means:**
- ✅ MongoDB running on localhost:27017
- ✅ Database name: `ATS_Tecnoprism`
- ✅ Your users are in this database

---

## Quick Test Script

**Run this in browser console after logging in as admin:**

```javascript
// Test API connection
fetch('http://localhost:8000/api/v1/jobs/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('ats-token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Jobs:', data))
.catch(err => console.error('Error:', err));
```

**Expected result:**
- ✅ Array of jobs (may be empty if no jobs created)
- ❌ 403 error → Wrong role
- ❌ 401 error → Not authenticated

---

## Summary

**To insert data into MongoDB:**

1. **Login as Admin:**
   ```
   Email: admin@ats.local
   Password: Admin@12345
   ```

2. **Create Job:**
   - Go to Jobs page
   - Post new job
   - Check MongoDB Compass → `ATS_Tecnoprism` → `jobs`

3. **Verify:**
   - Job appears in MongoDB
   - Success message shown
   - Job appears in jobs list

**Your data IS being inserted** - you have 4 users in the database. The issue is you're trying to create jobs as a Candidate, which is not permitted.

---

## Next Steps

1. ✅ Logout from Mansi account
2. ✅ Login as `admin@ats.local` / `Admin@12345`
3. ✅ Try creating a job
4. ✅ Check MongoDB Compass
5. ✅ Verify job was inserted

**The database connection is working - you just need the right permissions!**
