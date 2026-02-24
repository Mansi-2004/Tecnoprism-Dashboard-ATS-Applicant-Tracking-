# 🚀 Deployment Guide - Talent Prism Dashboard

This guide explains how to upload your code to GitHub and deploy it so others can use it.

## Part 1: Upload to GitHub

1. **Initialize Git**:
   Open a terminal in the root folder (`talent-prism-dashboard-main`) and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ready for deployment"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com/new).
   - Name it `talent-prism-dashboard`.
   - Click **Create repository**.

3. **Push Code**:
   Copy the commands from GitHub's "push an existing repository" section:
   ```bash
   git remote add origin https://github.com/Mansi-2004/talent-prism-dashboard.git
   git branch -M main
   git push -u origin main
   ```

---

## Part 2: Set Up Database (MongoDB Atlas)

Since your local database won't be accessible online, you need a cloud database:

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Cluster**.
3. Under **Network Access**, add `0.0.0.0/0` (allows access from hosting providers).
4. Under **Database Access**, create a user (keep the username and password).
5. Click **Connect** -> **Drivers** to get your connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`

---

## Part 3: Deploy Backend (FastAPI)

I recommend **Render** or **Railway** for the backend.

### Using Render (Free Tier):
1. [Create a Render account](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Environment**: `Python`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**: Add your `.env` variables (e.g., `MONGODB_URL` with your Atlas string).

---

## Part 4: Deploy Frontend (React/Vite)

I recommend **Vercel** or **Netlify**.

### Using Vercel:
1. Connect GitHub to [Vercel](https://vercel.com/).
2. Import the `talent-prism-dashboard` repository.
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Add `VITE_API_BASE_URL` pointing to your Render backend URL (e.g., `https://your-backend.onrender.com/api/v1`).

---

## ✅ Final Verification
Once both are deployed:
1. Update any API links in your frontend to point to the new backend URL.
2. Verify that you can login and upload resumes.
