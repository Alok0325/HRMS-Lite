# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7 |
| Backend | Python, FastAPI, Pydantic |
| Database | MongoDB Atlas |

## Features

- **Employee Management** — Add, view, search, and delete employees
- **Attendance Tracking** — Mark daily attendance (Present/Absent) with radio buttons, pagination, search
- **Dashboard** — Summary stats, department breakdown, attendance leaderboard
- **Validation** — Email validation, duplicate detection, required field checks
- **UI States** — Loading spinners, empty states, error handling with retry

## Project Structure

```
HRMS Lite/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # MongoDB connection
│   ├── models.py            # Pydantic models & validation
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   └── routes/
│       ├── employees.py     # Employee CRUD endpoints
│       ├── attendance.py    # Attendance endpoints
│       └── dashboard.py     # Dashboard summary endpoint
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root layout with router
│   │   ├── api.js           # API service layer
│   │   ├── index.css        # Tailwind CSS config
│   │   ├── components/      # Reusable UI components
│   │   └── pages/           # Dashboard, Employees, Attendance
│   ├── vercel.json          # Vercel deployment config
│   ├── .env                 # Local API URL
│   ├── .env.production      # Production API URL
│   └── package.json
└── README.md
```

## Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt

# Edit .env with your MongoDB URI
python main.py
```

Runs at **http://localhost:8000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at **http://localhost:5173**

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create a **Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables in the Render dashboard:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `DATABASE_NAME` = `HRMSLite`
   - `ALLOWED_ORIGINS` = your Vercel frontend URL
   - `ENV` = `production`

### Frontend → Vercel

1. Push code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to `Vite`
5. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://hrms-lite-api.onrender.com`)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Add new employee |
| GET | `/api/employees/{id}` | Get single employee |
| DELETE | `/api/employees/{id}` | Delete employee + attendance |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/{id}` | Get attendance records |
| GET | `/api/dashboard/summary` | Dashboard statistics |

## Assumptions & Limitations

- Single admin user (no authentication)
- Leave management, payroll, and advanced HR features are out of scope
- Attendance can be updated for the same date (upsert behavior)
- Employee ID is auto-uppercased for consistency
