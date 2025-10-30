@echo off
echo ========================================
echo  INSTALADOR DE SERVICIO WINDOWS
echo  Grupo Cardenoza - Sistema de Recordatorios
echo ========================================
echo.

REM Verificar permisos de administrador
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Este script requiere permisos de administrador
    echo Haga clic derecho y seleccione "Ejecutar como administrador"
    pause
    exit /b 1
)

echo Este script instalara el sistema como un servicio de Windows
echo que se ejecutara automaticamente al iniciar el sistema.
echo.
echo IMPORTANTE: Necesita NSSM (Non-Sucking Service Manager)
echo Si no lo tiene, descargue desde: https://nssm.cc/download
echo.
pause

set NSSM_PATH=C:\nssm\nssm.exe
set SERVICE_NAME=GrupoCardenoza
set APP_PATH=%~dp0backend\server.js
set NODE_PATH=C:\Program Files\nodejs\node.exe

echo.
echo Verificando NSSM...
if not exist "%NSSM_PATH%" (
    echo ERROR: NSSM no encontrado en %NSSM_PATH%
    echo.
    echo Descargue NSSM y extraigalo en C:\nssm\
    echo O edite este archivo y cambie NSSM_PATH a la ubicacion correcta
    pause
    exit /b 1
)

echo.
echo Verificando Node.js...
if not exist "%NODE_PATH%" (
    echo ADVERTENCIA: Node.js no encontrado en %NODE_PATH%
    echo Intentando usar node desde PATH...
    set NODE_PATH=node
)

echo.
echo Deteniendo servicio existente (si existe)...
"%NSSM_PATH%" stop %SERVICE_NAME% >nul 2>&1
"%NSSM_PATH%" remove %SERVICE_NAME% confirm >nul 2>&1

echo.
echo Instalando servicio...
"%NSSM_PATH%" install %SERVICE_NAME% "%NODE_PATH%" "%APP_PATH%"

echo.
echo Configurando variables de entorno...
"%NSSM_PATH%" set %SERVICE_NAME% AppEnvironmentExtra NODE_ENV=production PORT=3001

echo.
echo Configurando directorio de trabajo...
"%NSSM_PATH%" set %SERVICE_NAME% AppDirectory "%~dp0backend"

echo.
echo Configurando reinicio automatico...
"%NSSM_PATH%" set %SERVICE_NAME% AppExit Default Restart
"%NSSM_PATH%" set %SERVICE_NAME% AppStdout "%~dp0logs\service-output.log"
"%NSSM_PATH%" set %SERVICE_NAME% AppStderr "%~dp0logs\service-error.log"

echo.
echo Creando carpeta de logs...
if not exist "%~dp0logs" mkdir "%~dp0logs"

echo.
echo Iniciando servicio...
"%NSSM_PATH%" start %SERVICE_NAME%

echo.
echo ========================================
echo  SERVICIO INSTALADO CORRECTAMENTE
echo ========================================
echo.
echo Nombre del servicio: %SERVICE_NAME%
echo Puerto: 3001
echo URL: http://localhost:3001
echo.
echo El servicio se iniciara automaticamente con Windows.
echo.
echo Comandos utiles:
echo   Ver estado:  sc query %SERVICE_NAME%
echo   Detener:     sc stop %SERVICE_NAME%
echo   Iniciar:     sc start %SERVICE_NAME%
echo   Desinstalar: "%NSSM_PATH%" remove %SERVICE_NAME% confirm
echo.
pause

start http://localhost:3001
