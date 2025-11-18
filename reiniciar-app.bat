@echo off
echo ========================================
echo  REINICIANDO APLICACION E-COMMERCE
echo ========================================

echo Matando procesos en puertos 3000, 3001 y 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul

echo.
echo Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Iniciando cliente frontend...
start "Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo  APLICACION INICIADA
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000 o 3001
echo.
pause