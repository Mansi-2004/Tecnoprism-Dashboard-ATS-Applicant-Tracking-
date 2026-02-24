# 💎 Talent Prism Dashboard - AI-Powered ATS

**Talent Prism Dashboard** is a state-of-the-art Applicant Tracking System (ATS) designed to streamline the recruitment process using AI. It features a modern React frontend and a robust FastAPI backend with automated resume screening and scoring.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- **🚀 Smart Dashboard**: Comprehensive overview of recruitment metrics and applicant pipeline.
- **📄 AI Resume Screening**: Automated extraction and analysis of candidate resumes using OCR and NLP.
- **⚖️ Precision Scoring**: Intelligent scoring engine (powered by Sentence Transformers) to rank candidates based on skills, experience, and education.
- **🛠️ Role-Based Access**: Specialized views for Administrators, HR Managers, and Candidates.
- **📧 Integrated Communication**: Automated email notifications and status updates.

## 🏗️ Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn UI, TanStack Query.
- **Backend**: Python 3.10+, FastAPI, Motor (Async MongoDB), Pydantic.
- **Database**: MongoDB (Local or Atlas).

## 🚀 Quick Start

### 1. Prerequisites
- Node.js & npm
- Python 3.10+
- MongoDB

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📖 Documentation
Detailed documentation for specific features and deployment can be found in the [docs](./docs) directory.
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 👤 Author
**Mansi** - [GitHub Profile](https://github.com/Mansi-2004)

---
© 2026 Tecnoprism. All rights reserved.
