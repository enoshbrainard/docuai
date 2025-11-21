# 📄 DocuAI – AI-Powered Document Generator  
An end-to-end platform to generate **Word (.docx)** and **PowerPoint (.pptx)** documents using **AI (Google Gemini)**.  
Built with **FastAPI**, **MongoDB**, **React (Vite)**, and **Shadcn UI**.

---

# ⭐ Features

### 🔐 Authentication
- User registration & login  
- JWT protected routes  

### 📝 Project System
- Create Word or PowerPoint projects  
- AI-generated section/slide outlines  
- Store structure in MongoDB  

### 🤖 AI Generation
- Generate content per section/slide  
- Supports refinements (user prompts)  
- Supports feedback (like/dislike/comments)  
- Versioned content history  

### 📤 Export
- Export full .docx and .pptx documents  
- Preserves formatting and order  

---

# 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Shadcn UI, Tailwind |
| Backend | FastAPI |
| Database | MongoDB |
| AI Engine | Google Gemini 2.5 Flash |
| Auth | JWT |
| Hosting | Vercel (frontend), Render (backend) |

---

# 📦 Project Structure

```
/backend     → FastAPI + MongoDB  
/frontend    → React + Vite + Shadcn UI
```

---

# ⚙️ Backend Setup (FastAPI)

## 1️⃣ Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

## 2️⃣ Create `.env` in /backend

```
MONGO_URL=your_mongo_connection_string
DB_NAME=docuai_db
JWT_SECRET_KEY=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=*
```

## 3️⃣ Run FastAPI locally

```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

Backend URL now:

```
http://localhost:8000
```

---

# 🌐 Frontend Setup (React + Vite)

## 1️⃣ Install dependencies

```bash
cd frontend
npm install
```

## 2️⃣ Create `.env` in /frontend

```
VITE_BACKEND_URL=http://localhost:8000
```

⚠️ **No trailing slash!**  
Correct → `http://localhost:8000`  
Wrong ❌ → `http://localhost:8000/`

## 3️⃣ Start frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🌍 Deployment Instructions

## 🚀 Deploy Backend on Render

### Build Command
```
pip install -r requirements.txt
```

### Start Command
```
uvicorn server:app --host 0.0.0.0 --port $PORT
```

### Environment Variables
- MONGO_URL  
- DB_NAME  
- JWT_SECRET_KEY  
- GEMINI_API_KEY  
- CORS_ORIGINS=*

Set **PORT** automatically by Render (don’t hardcode it).

---

## 🚀 Deploy Frontend on Vercel

### Build Settings
- Framework: **Vite**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### Add Environment Variables
```
VITE_BACKEND_URL=https://your-render-backend.onrender.com
```

⚠️ Must NOT end with `/`

---

# 🔧 API Usage Examples

### ➤ Register

```
POST /api/auth/register

{
  "email": "test@example.com",
  "password": "secret123",
  "name": "John"
}
```

### ➤ Login

```
POST /api/auth/login

Response:
{
  "token": "...",
  "user": { ... }
}
```

### ➤ Create a Project

```
POST /api/projects

{
  "title": "AI Market Report",
  "document_type": "docx",
  "topic": "Impact of AI on Finance"
}
```

### ➤ Generate AI Outline

```
POST /api/ai/suggest-outline

{
  "topic": "Blockchain in Banking",
  "document_type": "docx"
}
```

### ➤ Generate Full Content

```
POST /api/projects/{project_id}/generate
```

### ➤ Refine Content

```
POST /api/projects/{project_id}/refine

{
  "section_id": "abc123",
  "prompt": "Make it more formal and structured"
}
```

### ➤ Export

```
GET /api/projects/{project_id}/export
```

Returns `.docx` or `.pptx`.

---

# 🎬 Demo Flow

Record these steps for your project video:

1. Register & login  
2. Create a new Word project  
3. Create a new PowerPoint project  
4. Generate AI outline  
5. Generate AI content  
6. Refine content  
7. Like/dislike & add comment  
8. Export `.docx` & `.pptx`  

---



