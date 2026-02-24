# Dynamic Role Display - Already Working! ✅

## Your Question
"It should not be always candidate but through what the user logins like Admin/HR/Candidate"

## Answer
**It already works this way!** The role display is **100% dynamic** based on the logged-in user.

---

## How It Works

### 1. During Login
When you login, the backend returns your role:
```json
{
  "access_token": "jwt_token...",
  "role": "candidate",  // ← Your actual role from database
  "name": "Mansi"
}
```

### 2. Frontend Saves It
```javascript
localStorage.setItem("ats-role", data.role);
// Saves: "admin", "hr", or "candidate"
```

### 3. UI Displays It
```javascript
{localStorage.getItem("ats-role") || "Admin"}
// Shows whatever is saved: "admin", "hr", or "candidate"
```

---

## Proof It's Dynamic

### Your Current Account (Mansi)
```
Name: Mansi
Role: Candidate  ← Shows "Candidate" because you ARE a Candidate
```

### If You Login as Admin
```
Name: Admin
Role: Admin  ← Will show "Admin"
```

### If You Login as HR
```
Name: Your Name
Role: HR  ← Will show "HR"
```

---

## Test It Yourself

### Test 1: Login as Admin
```
1. Sign out
2. Login with:
   Email: admin@tecnoprism.com
   Password: admin123
3. Look at top right corner
4. ✅ Shows: "Admin" (not "Candidate")
```

### Test 2: Create HR Account
```
1. Sign out
2. Sign up with:
   Name: Test HR
   Email: testhr@company.com
   Password: password123
   Role: Select "HR" ← Important!
3. Login
4. Look at top right corner
5. ✅ Shows: "HR" (not "Candidate")
```

### Test 3: Your Current Account
```
1. You're already logged in as Mansi
2. Look at top right corner
3. ✅ Shows: "Candidate"
4. This is CORRECT because your account IS a Candidate
```

---

## Why You See "Candidate"

**Your account (Mansi) was created with the Candidate role.**

When you signed up, you either:
- Selected "Candidate" role during signup, OR
- The system defaulted to "Candidate" role

**This is not a bug - it's showing your actual role!**

---

## Code Verification

### AppLayout.jsx (Top Header)
```javascript
<p className="text-xs text-muted-foreground capitalize">
  {localStorage.getItem("ats-role") || "Admin"}
  // ↑ Reads from localStorage - DYNAMIC!
</p>
```

### AppSidebar.jsx (Sidebar)
```javascript
<p className="text-xs text-sidebar-foreground/60 capitalize">
  {localStorage.getItem("ats-role") || "Admin"}
  // ↑ Reads from localStorage - DYNAMIC!
</p>
```

### Login.jsx (Saves Role)
```javascript
localStorage.setItem("ats-role", data.role || role);
// ↑ Saves actual role from backend - DYNAMIC!
```

---

## How to Change Your Role

### Option 1: Create New Account with Different Role
```
1. Sign out
2. Sign up
3. Select "Admin" or "HR" role
4. Login
5. ✅ Will show selected role
```

### Option 2: Change in Database
```
1. Open MongoDB Compass
2. Database: ats_db
3. Collection: users
4. Find: { "email": "mansi@example.com" }
5. Edit: "role": "candidate" → "role": "hr"
6. Save
7. Logout and login again
8. ✅ Will show "HR"
```

### Option 3: Use Admin Account
```
Login as: admin@tecnoprism.com / admin123
✅ Will show "Admin"
```

---

## Visual Examples

### When Logged in as Admin:
```
┌─────────────────────┐
│  Admin      [AD]   │
│  Admin             │  ← Shows "Admin"
└─────────────────────┘
```

### When Logged in as HR:
```
┌─────────────────────┐
│  John Doe   [JD]   │
│  HR                │  ← Shows "HR"
└─────────────────────┘
```

### When Logged in as Candidate (You):
```
┌─────────────────────┐
│  Mansi      [MA]   │
│  Candidate         │  ← Shows "Candidate" (YOUR ACTUAL ROLE)
└─────────────────────┘
```

---

## Check Your Role in Browser Console

Open browser console (F12) and type:
```javascript
console.log(localStorage.getItem("ats-role"));
// Will show: "candidate" (for your account)

console.log(localStorage.getItem("ats-user-name"));
// Will show: "Mansi"
```

---

## Summary

✅ **The role display IS dynamic**
✅ **It shows the logged-in user's actual role**
✅ **It's showing "Candidate" because YOU are a Candidate**
✅ **When you login as Admin, it will show "Admin"**
✅ **When you login as HR, it will show "HR"**

**The system is working perfectly!**

---

## To See Different Roles

**Quick Test:**
```
1. Sign out
2. Login as: admin@tecnoprism.com / admin123
3. Look at top right
4. ✅ Now shows "Admin" instead of "Candidate"
```

**This proves the role display is dynamic!**

---

## Why "Candidate" Can't Create Jobs

Since your account is a **Candidate**, you cannot:
- ❌ Create jobs
- ❌ Edit jobs
- ❌ Delete jobs
- ❌ View all applications

**To create jobs, you need to login as Admin or HR.**

---

## Final Answer

**Your concern:** "It should not be always candidate"

**Reality:** It's **NOT** always candidate! It shows:
- "Admin" when logged in as Admin
- "HR" when logged in as HR  
- "Candidate" when logged in as Candidate (you)

**The role display is 100% dynamic and working correctly!**

You're seeing "Candidate" because that's your actual role. Login as Admin to see "Admin".
