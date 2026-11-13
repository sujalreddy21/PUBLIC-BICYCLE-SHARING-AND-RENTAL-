@echo off
echo ====================================================================
echo Starting Public Bicycle Sharing and Rental Management System
echo Student: SUJAL REDDY ^| HT: 2303A51713 ^| Academic Year: 2026-2027
echo ====================================================================

echo [1/2] Starting Backend REST API Server on http://localhost:5000 ...
start "PBS Backend API" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend UI Server on http://localhost:3000 ...
start "PBS Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo Application successfully launched!
echo Access the web dashboard at: http://localhost:3000
echo.
pause
