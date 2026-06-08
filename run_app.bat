@echo off
echo ========================================================
echo Starting MRDACE Secure Medical Platform...
echo ========================================================
echo.

echo [1/2] Starting Backend Server...
start "MRDACE Backend" cmd /k "cd backend && echo Installing backend dependencies... && npm install && echo Starting backend server... && npm run dev"

echo [2/2] Starting Frontend Interface...
start "MRDACE Frontend" cmd /k "cd frontend && echo Installing frontend dependencies... && npm install && echo Starting frontend server... && npm run dev"

echo.
echo ========================================================
echo Systems are launching in separate windows.
echo - The Backend will connect to MongoDB.
echo - The Frontend will be available at http://localhost:5173
echo ========================================================
echo.
pause
