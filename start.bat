@echo off
title NEURO-MATCH Launcher
color 0A

echo.
echo  ███╗   ██╗███████╗██╗   ██╗██████╗  ██████╗       ███╗   ███╗ █████╗ ████████╗ ██████╗██╗  ██╗
echo  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔═══██╗      ████╗ ████║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
echo  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║   ██║█████╗██╔████╔██║███████║   ██║   ██║     ███████║
echo  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║   ██║╚════╝██║╚██╔╝██║██╔══██║   ██║   ██║     ██╔══██║
echo  ██║ ╚████║███████╗╚██████╔╝██║  ██║╚██████╔╝      ██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╗██║  ██║
echo  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝       ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
echo.
echo  World's First Neurological Compatibility Platform
echo  --------------------------------------------------

:: Gereken klasörleri oluştur
if not exist "backend\logs" mkdir backend\logs
if not exist "backend\uploads" mkdir backend\uploads
echo [OK] Klasörler hazır

:: Backend bağımlılıkları kontrol et
if not exist "backend\node_modules" (
  echo [*] Backend bağımlılıkları kuruluyor...
  cd backend
  call npm install
  cd ..
  echo [OK] Backend hazır
) else (
  echo [OK] Backend node_modules mevcut
)

:: Frontend bağımlılıkları kontrol et
if not exist "frontend\node_modules" (
  echo [*] Frontend bağımlılıkları kuruluyor...
  cd frontend
  call npm install
  cd ..
  echo [OK] Frontend hazır
) else (
  echo [OK] Frontend node_modules mevcut
)

echo.
echo [*] Sunucular başlatılıyor...
echo.

:: Backend'i arka planda başlat
start "NEURO Backend (Port 5000)" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

:: Frontend'i başlat
start "NEURO Frontend (Port 3000)" cmd /k "cd frontend && npm start"

echo.
echo [OK] NEURO-MATCH çalışıyor!
echo.
echo     Backend:  http://localhost:5000
echo     Frontend: http://localhost:3000
echo     API Docs: http://localhost:5000/api/v1
echo.
echo Tarayıcınızda http://localhost:3000 adresini açın.
echo Bu pencereyi kapatabilirsiniz.
pause
