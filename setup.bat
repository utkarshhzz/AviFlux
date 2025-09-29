@echo off
echo Setting up Aviation Weather Platform...
echo.
echo 1. Make sure Docker Desktop is running
echo 2. Building and starting services...
docker-compose up -d --build
echo.
echo 3. Waiting for services to start...
timeout /t 30 /nobreak
echo.
echo Setup complete!
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Default login: admin@aviation.com / admin123
echo.
pause
