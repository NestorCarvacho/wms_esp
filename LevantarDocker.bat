@echo off
cd /d "%~dp0"
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo Error al levantar Docker. Verifica que Docker Desktop este en ejecucion.
  pause
  exit /b 1
)
echo.
echo Stack levantado:
echo   Frontend: http://localhost:4173
echo   API:      http://localhost:8000
echo   Swagger:  http://localhost:8000/docs
pause
