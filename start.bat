@echo off
echo Starting Resume AI Application...
echo.

echo Starting Backend (Java Spring Boot)...
cd backend
start "Resume AI Backend" cmd /k "mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak

echo Starting Frontend (React + Vite)...
cd ../frontend
start "Resume AI Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Resume AI Application is starting...
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause