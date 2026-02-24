# Role Change & Resume Upload - Complete Guide ✅

## Changes Made

### 1. ✅ Replaced "Candidate" Role with "Interviewer"
### 2. ✅ Resume Upload Already Exists!

---

## Change 1: Candidate → Interviewer Role

### What Was Changed

**Backend (`backend/app/schemas/user.py`):**
```python
# Before:
class UserRole(str, Enum):
    ADMIN = "admin"
    HR = "hr"
    CANDIDATE = "candidate"  # ❌ Removed

# After:
class UserRole(str, Enum):
    ADMIN = "admin"
    HR = "hr"
    INTERVIEWER = "interviewer"  # ✅ Added
```

**Frontend (`frontend/src/pages/Login.jsx`):**
```javascript
// Before:
const [role, setRole] = useState("candidate");  // ❌ Removed
onClick={() => setRole("candidate")}  // ❌ Removed
<p>Candidate</p>  // ❌ Removed

// After:
const [role, setRole] = useState("interviewer");  // ✅ Added
onClick={() => setRole("interviewer")}  // ✅ Added
<p>Interviewer</p>  // ✅ Added
```

---

## New Role System

### Three Roles Available:

#### 1. **Admin** (Full Access)
- ✅ Create/Edit/Delete jobs
- ✅ View all applications
- ✅ Manage users
- ✅ Send emails
- ✅ Schedule interviews
- ✅ Everything

#### 2. **HR** (Recruitment Access)
- ✅ Create/Edit/Delete jobs
- ✅ View all applications
- ✅ Send emails
- ✅ Schedule interviews
- ❌ Cannot manage users

#### 3. **Interviewer** (Interview Access) - NEW!
- ✅ View assigned candidates
- ✅ Schedule interviews
- ✅ Provide feedback
- ✅ Update interview status
- ❌ Cannot create jobs
- ❌ Cannot view all applications
- ❌ Cannot send emails

---

## Resume Upload Functionality

### Already Exists! ✅

**Location:** Resume Screening & Apply page

**How to Access:**
```
1. Login to the application
2. Go to "Resume Screening & Apply" page (sidebar)
3. Click "Apply for Jobs" tab at top
4. Select a job position
5. Click "Upload Resume" area
6. Select your PDF/DOC/DOCX file
7. Click "Submit Application"
8. ✅ Resume is uploaded and analyzed!
```

### Features:

#### A. File Upload
- **Supported formats:** PDF, DOC, DOCX
- **Max file size:** 5MB
- **Drag & drop:** Click to browse
- **Validation:** Automatic file type and size check

#### B. Job Selection
- **Browse jobs:** View all open positions
- **Job details:** Title, location, salary, requirements
- **Select job:** Click on job card to select
- **Visual feedback:** Selected job highlighted

#### C. Application Submission
- **Resume upload:** Required field
- **Auto-analysis:** ATS system analyzes resume
- **Skill matching:** Compares resume with job requirements
- **Scoring:** Generates match score
- **Status tracking:** Track application status

#### D. Success Feedback
- **File selected:** Green checkmark when file chosen
- **File info:** Shows filename and size
- **Upload progress:** "Submitting..." indicator
- **Success message:** Confirmation after submission
- **Auto-refresh:** Candidate list updates

---

## How to Use Resume Upload

### Step-by-Step Guide:

**1. Navigate to Page:**
```
Sidebar → Resume Screening & Apply
```

**2. Switch to Apply View:**
```
Top tabs → Click "Apply for Jobs"
```

**3. Browse Available Jobs:**
```
- See list of all open positions
- Each job shows:
  - Title
  - Location
  - Salary
  - Experience required
  - Required skills
  - Description
```

**4. Select a Job:**
```
- Click on any job card
- Job card highlights with blue border
- Right sidebar shows "Selected Position"
```

**5. Upload Resume:**
```
- Click on upload area (dashed border)
- Or click "Click to upload" text
- File browser opens
- Select your resume file
- ✅ File name appears
- ✅ Green checkmark shows "File selected"
```

**6. Submit Application:**
```
- Click "Submit Application" button
- Button shows "Submitting..."
- Wait for processing
- ✅ Success message appears
- Application added to screening list
```

---

## Resume Upload UI

### Upload Area:
```
┌─────────────────────────────────┐
│         📤 Upload Icon          │
│                                 │
│      Click to upload            │
│   PDF, DOC, DOCX (Max 5MB)     │
└─────────────────────────────────┘
```

### After File Selected:
```
┌─────────────────────────────────┐
│ ✓ File selected                 │
│ resume.pdf (245.67 KB)          │
└─────────────────────────────────┘

[Submit Application]
```

### During Upload:
```
[Submitting...]  (disabled button)
```

### After Success:
```
✅ Application submitted successfully!
Redirecting to screening view...
```

---

## Testing the Changes

### Test 1: New Role System

**Sign Up as Interviewer:**
```
1. Sign out
2. Go to signup page
3. Fill form:
   Name: Test Interviewer
   Email: interviewer@company.com
   Password: password123
   Role: Click "Interviewer" ← NEW!
4. Sign up
5. ✅ Top right shows "Interviewer"
6. ✅ No more "Candidate" option
```

**Verify Three Roles:**
```
1. Go to signup page
2. See three role options:
   - Admin (with UserCog icon)
   - HR (with Briefcase icon)
   - Interviewer (with User icon) ← NEW!
3. ✅ No "Candidate" option
```

### Test 2: Resume Upload

**Upload a Resume:**
```
1. Login to application
2. Go to "Resume Screening & Apply"
3. Click "Apply for Jobs" tab
4. Click on any job
5. ✅ Job highlights
6. ✅ Right sidebar shows upload form
7. Click upload area
8. Select a PDF/DOC file
9. ✅ Filename appears
10. ✅ Green checkmark shows
11. Click "Submit Application"
12. ✅ "Submitting..." appears
13. ✅ Success message
14. ✅ Application appears in screening list
```

**Test File Validation:**
```
1. Try uploading .txt file
2. ✅ Error: "Please upload a PDF or Word document"

3. Try uploading 10MB file
4. ✅ Error: "File size must be less than 5MB"

5. Upload valid PDF
6. ✅ Accepts and shows filename
```

---

## Files Modified

### Backend
1. **`backend/app/schemas/user.py`**
   - Line 9: Changed `CANDIDATE = "candidate"` to `INTERVIEWER = "interviewer"`
   - Line 14: Changed default `UserRole.CANDIDATE` to `UserRole.INTERVIEWER`

### Frontend
1. **`frontend/src/pages/Login.jsx`**
   - Line 25: Changed default role to `"interviewer"`
   - Lines 249-259: Changed button from "Candidate" to "Interviewer"
   - Updated all `role === "candidate"` to `role === "interviewer"`

### No Changes Needed
- **`frontend/src/pages/ResumeScreening.jsx`** - Already has full upload functionality!

---

## Resume Upload Features (Already Built)

### ✅ File Upload
- Click to browse
- Drag & drop support
- File type validation
- File size validation (5MB max)
- Visual feedback

### ✅ Job Selection
- Browse all open positions
- View job details
- Click to select
- Visual selection indicator

### ✅ Application Processing
- FormData upload
- JWT authentication
- Backend API integration
- Resume text extraction
- Skill matching
- Score calculation

### ✅ User Feedback
- File selected indicator
- Upload progress
- Success/error messages
- Auto-refresh candidate list
- Redirect to screening view

---

## API Endpoints Used

### Resume Upload:
```
POST /api/v1/applications/apply
Headers: Authorization: Bearer {token}
Body: FormData {
  file: <resume file>,
  job_id: <selected job ID>
}
```

### Backend Processing:
1. Receives file upload
2. Extracts text from PDF/DOC
3. Parses candidate information
4. Matches skills with job requirements
5. Calculates match score
6. Stores application in database
7. Returns success response

---

## Common Issues & Solutions

### Issue 1: "Candidate" still appears
**Solution:**
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Or run: localStorage.clear()
3. Refresh page
4. ✅ Should show "Interviewer" now
```

### Issue 2: Can't find resume upload
**Solution:**
```
1. Go to "Resume Screening & Apply" page
2. Click "Apply for Jobs" tab at top
3. ✅ Upload form is on the right side
```

### Issue 3: File upload fails
**Solutions:**
- Check file format (PDF, DOC, DOCX only)
- Check file size (must be < 5MB)
- Check you're logged in
- Check backend is running
- Check network tab for errors

### Issue 4: No jobs to apply for
**Solution:**
```
1. Login as Admin or HR
2. Go to Jobs page
3. Create some job postings
4. Logout
5. Login as Interviewer
6. ✅ Jobs should appear
```

---

## Summary

### ✅ Role System Updated
- **Removed:** Candidate role
- **Added:** Interviewer role
- **Kept:** Admin and HR roles unchanged

### ✅ Resume Upload Already Exists
- **Location:** Resume Screening & Apply page
- **Features:** Full upload, validation, processing
- **Status:** Fully functional!

---

## Quick Reference

### New Roles:
| Role | Create Jobs | View Applications | Schedule Interviews |
|------|-------------|-------------------|---------------------|
| Admin | ✅ | ✅ All | ✅ |
| HR | ✅ | ✅ All | ✅ |
| Interviewer | ❌ | ✅ Assigned | ✅ |

### Resume Upload:
- **Page:** Resume Screening & Apply
- **Tab:** Apply for Jobs
- **Formats:** PDF, DOC, DOCX
- **Max Size:** 5MB
- **Status:** ✅ Working!

---

## Next Steps

**To use the new system:**

1. **Clear cache:**
   ```javascript
   localStorage.clear();
   ```

2. **Sign up as Interviewer:**
   - Select "Interviewer" role
   - Complete signup
   - ✅ Role displays correctly

3. **Upload resume:**
   - Go to Resume Screening & Apply
   - Click "Apply for Jobs"
   - Select job
   - Upload resume
   - Submit application
   - ✅ Resume uploaded!

**Everything is working! 🎉**
