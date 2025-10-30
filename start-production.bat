@echo off
echo ========================================
echo  INICIANDO SISTEMA GRUPO CARDENOZA
echo ========================================
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado
    echo Descargue e instale Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar si MySQL esta corriendo
netstat -ano | findstr :3306 >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL no esta corriendo
    echo Inicie XAMPP y asegurese que MySQL este activo
    pause
    exit /b 1
)

echo [1/4] Verificando dependencias del backend...
cd backend
if not exist node_modules (
    echo Instalando dependencias del backend...
    call npm install
)

echo.
echo [2/4] Verificando dependencias del frontend...
cd ..\frontend
if not exist node_modules (
    echo Instalando dependencias del frontend...
    call npm install
)

echo.
echo [3/4] Construyendo frontend para produccion...
call npm run build

echo.
echo [4/4] Iniciando servidor de produccion...
cd ..

REM Iniciar backend en segundo plano
start "Backend - Grupo Cardenoza" cmd /k "cd backend && set NODE_ENV=production && set PORT=3001 && node server.js"

REM Esperar 3 segundos para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar servidor estatico para el frontend
start "Frontend - Grupo Cardenoza" cmd /k "cd backend && set NODE_ENV=production && node server.js"

echo.
echo ========================================
echo  SISTEMA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3001
echo.
echo Presione cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:3001

echo.
echo Para detener el sistema, cierre ambas ventanas de comandos.
pause
