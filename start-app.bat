@echo off
REM Start backend and frontend servers in separate windows

echo ============================================
echo Starting AI Lecture Assistant...
echo ============================================
echo.

cd /d "c:\AI LECTURE ASSISTANT(project1)"

REM Start backend server in a new window
echo Starting Backend Server on port 3000...
start "Backend - AI Lecture Assistant" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend server in a new window
echo Starting Frontend Server on port 3001...
start "Frontend - AI Lecture Assistant" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo Servers starting...
echo Frontend: http://localhost:3001
echo Backend: http://localhost:3000
echo ============================================
echo.
echo Keep this window open. Both servers will open in separate windows.
echo Close the server windows to stop the application.
pause
