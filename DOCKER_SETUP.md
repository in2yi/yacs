# YACS - Quick Start Guide

## 🚀 Option 1: Run with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- No other dependencies needed

### Steps
1. Navigate to the project directory:
```bash
cd c:\Users\yit2\Desktop\YACS\yacs
```

2. Start all services:
```bash
docker-compose up
```

3. Wait for all services to be ready. You'll see:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8000`
   - **Database**: Running on port 5433

4. Open `http://localhost:3000` in your browser

5. To stop, press `Ctrl+C` in the terminal, then run:
```bash
docker-compose down
```

### Troubleshooting
- **Port already in use**: Change ports in `docker-compose.yml`
- **Database connection error**: Wait 10-15 seconds for database to initialize
- **Frontend shows blank**: Check browser console (F12) for API errors

---

## 🛠️ Option 2: Local Development (npm + Python)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15

### Database Setup
1. Create database with user:
```bash
createdb yacsdb
psql -U postgres -d yacsdb -c "CREATE USER yacs WITH PASSWORD 'yacs';"
psql -U postgres -d yacsdb -c "GRANT ALL PRIVILEGES ON DATABASE yacsdb TO yacs;"
```

2. Create `.env.local` in project root:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yacsdb
DB_USER=yacs
DB_PASS=yacs
```

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm start
```

### Access Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📝 Environment Variables

### Backend (`.env.docker` or `.env.local`)
```
DB_HOST=localhost          # Database host
DB_PORT=5432             # Database port
DB_NAME=yacsdb           # Database name
DB_USER=yacs             # Database user
DB_PASS=yacs             # Database password
CORS_ORIGINS=http://localhost:3000   # Allowed origins
SECRET_KEY=your-secret   # Session secret
SESSION_SAME_SITE=lax    # Cookie same-site policy
SESSION_HTTPS_ONLY=false # HTTPS requirement
```

### Frontend (set in `docker-compose.yml`)
```
REACT_APP_API_BASE_URL=http://localhost:8000  # Backend API URL
NODE_ENV=development                          # Environment
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/session` - Login
- `DELETE /api/session` - Logout
- `GET /api/session/me` - Get current user

### User Management
- `POST /api/user` - Create account
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/preferred-semester` - Set semester

---

## 🔧 Database Management (Docker)

### Access Database Shell
```bash
docker-compose exec db psql -U yacs -d yacsdb
```

### Reset Database
```bash
docker-compose down -v
docker-compose up
```

---

## 📦 Project Structure

```
yacs/
├── frontend/              # React TypeScript app
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/              # FastAPI server
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml    # Docker orchestration
└── .env.docker          # Docker defaults
```

---

## ✅ Testing the Setup

### Test Backend API
```bash
curl http://localhost:8000/
# Should return: {"message": "YACS API is Up!"}
```

### Test Signup
```bash
curl -X POST http://localhost:8000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "",
    "major": "Computer Science",
    "degree": "BS",
    "preferred_semester": "Fall 2025"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/session \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

---

## 📞 Support

For issues:
1. Check Docker logs: `docker-compose logs backend` or `docker-compose logs frontend`
2. Verify database is running: `docker-compose ps`
3. Check `.env.docker` environment variables are set
4. Ensure ports 3000, 8000, 5433 are available
