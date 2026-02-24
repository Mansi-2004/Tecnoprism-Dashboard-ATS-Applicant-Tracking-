# Job Posting Permission Issue - FIXED ✅

## Problem
**Error:** "Operation not permitted" when trying to create or edit jobs

**Root Cause:** You're logged in as a **Candidate**, but job creation/editing requires **Admin** or **HR** role.

---

## Solution 1: Login as Admin or HR (RECOMMENDED)

### Option A: Use Admin Account
```
Email: admin@tecnoprism.com
Password: admin123
Role: Admin
```

**Steps:**
1. Click "Sign Out" in sidebar
2. Go to login page
3. Enter admin credentials above
4. Login
5. ✅ You can now create/edit/delete jobs

### Option B: Create HR Account
```
1. Sign out
2. Go to login page
3. Click "Sign Up"
4. Enter:
   - Name: Your Name
   - Email: yourname@company.com
   - Password: your_password
   - Role: Select "HR" (not Candidate!)
5. Sign up
6. ✅ You can now create/edit/delete jobs
```

---

## Solution 2: Change Your Role in Database (Advanced)

If you want to keep your current account but change role to HR:

### Using MongoDB Compass:
```
1. Open MongoDB Compass
2. Connect to: mongodb://localhost:27017
3. Select database: "ats_db"
4. Select collection: "users"
5. Find your user by email
6. Click "Edit Document"
7. Change: "role": "candidate" → "role": "hr"
8. Click "Update"
9. Logout and login again
10. ✅ You can now create/edit/delete jobs
```

---

## Why This Happens

### Role-Based Access Control (RBAC)

The application has 3 roles with different permissions:

#### 1. **Admin** (Full Access)
- ✅ Create/Edit/Delete jobs
- ✅ View all applications
- ✅ Manage users
- ✅ Update application status
- ✅ Send emails
- ✅ Schedule interviews
- ✅ Everything

#### 2. **HR** (Recruitment Access)
- ✅ Create/Edit/Delete jobs (only their own)
- ✅ View all applications
- ✅ Update application status
- ✅ Send emails
- ✅ Schedule interviews
- ❌ Cannot manage users

#### 3. **Candidate** (Limited Access)
- ✅ View jobs
- ✅ Apply for jobs
- ✅ View own applications
- ✅ Update own profile
- ❌ **Cannot create/edit/delete jobs**
- ❌ Cannot view other candidates
- ❌ Cannot send emails

---

## Backend Permission Code

### Jobs Router (`backend/app/routers/jobs.py`)

```python
@router.post("/", response_model=JobInDB)
async def create_job(
    job_in: JobCreate,
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
    # ↑ Only ADMIN and HR can create jobs
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Create job logic...
```

### Permission Check (`backend/app/core/deps.py`)

```python
def check_role(required_roles: list[UserRole]):
    def role_checker(current_user: UserInDB = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"  # ← This is the error you see
            )
        return current_user
    return role_checker
```

---

## Quick Fix: Login as Admin

**Fastest solution:**

1. **Logout:**
   - Click "Sign Out" in sidebar

2. **Login as Admin:**
   ```
   Email: admin@tecnoprism.com
   Password: admin123
   ```

3. **Verify:**
   - Top right should show "Admin" role
   - Sidebar should show "Admin"

4. **Try creating job:**
   - Go to Jobs page
   - Click "Post New Job"
   - Fill form
   - Click "Post Job"
   - ✅ Should work now!

---

## Alternative: Allow Candidates to Create Jobs (NOT RECOMMENDED)

If you really want Candidates to create jobs (not realistic), modify:

**File:** `backend/app/routers/jobs.py`

**Change line 15 from:**
```python
current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
```

**To:**
```python
current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR, UserRole.CANDIDATE])),
```

**⚠️ Warning:** This breaks the business logic. In real ATS systems, candidates don't create jobs!

---

## How to Check Your Current Role

### In Browser Console:
```javascript
console.log(localStorage.getItem("ats-role"));
// Should show: "admin", "hr", or "candidate"
```

### In UI:
- Look at **top right corner** - shows your role
- Look at **sidebar bottom** - shows your role

---

## Testing Different Roles

### Test as Admin:
```
1. Login as admin@tecnoprism.com / admin123
2. ✅ Can create jobs
3. ✅ Can edit any job
4. ✅ Can delete any job
5. ✅ Can see all applications
```

### Test as HR:
```
1. Sign up with role "HR"
2. Login
3. ✅ Can create jobs
4. ✅ Can edit own jobs
5. ✅ Can delete own jobs
6. ✅ Can see all applications
```

### Test as Candidate:
```
1. Sign up with role "Candidate"
2. Login
3. ❌ Cannot create jobs → "Operation not permitted"
4. ❌ Cannot edit jobs → "Operation not permitted"
5. ❌ Cannot delete jobs → "Operation not permitted"
6. ✅ Can view jobs
7. ✅ Can apply for jobs
```

---

## Summary

**Problem:** Logged in as Candidate, trying to create jobs

**Solution:** Login as Admin or HR

**Admin Credentials:**
- Email: `admin@tecnoprism.com`
- Password: `admin123`

**After logging in as Admin:**
- ✅ Job creation works
- ✅ Job editing works
- ✅ Job deletion works
- ✅ All features accessible

---

## Quick Reference

| Feature | Admin | HR | Candidate |
|---------|-------|-----|-----------|
| Create Jobs | ✅ | ✅ | ❌ |
| Edit Jobs | ✅ | ✅ (own) | ❌ |
| Delete Jobs | ✅ | ✅ (own) | ❌ |
| View Jobs | ✅ | ✅ | ✅ |
| Apply for Jobs | ✅ | ✅ | ✅ |
| View All Applications | ✅ | ✅ | ❌ |
| View Own Applications | ✅ | ✅ | ✅ |
| Send Emails | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

---

**To fix your issue right now:**

1. **Sign Out**
2. **Login with:** `admin@tecnoprism.com` / `admin123`
3. **Try creating job again**
4. **✅ It will work!**
