#!/bin/bash

# Script de deployment para servidor Linux Mint
# Servidor: mint@192.168.1.64
# Dominio: tecnomecanica.ilyforge.com (186.31.27.110)

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables de configuración
SERVER_USER="mint"
SERVER_HOST="192.168.1.63"
SERVER_DIR="/home/mint/tecnomecanica"
APP_NAME="tecnomecanica"
DOMAIN="tecnomecanica.ilyforge.com"
SERVER_IP="186.31.27.110"

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Deployment a servidor Linux Mint${NC}"
echo -e "${GREEN}==========================================${NC}"

# Función para ejecutar comandos en el servidor
run_remote() {
    ssh ${SERVER_USER}@${SERVER_HOST} "$1"
}

# 1. Verificar conexión al servidor
echo -e "\n${YELLOW}[1/9] Verificando conexión al servidor...${NC}"
if ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'Conexión exitosa'" 2>/dev/null; then
    echo -e "${GREEN}✓ Conexión establecida${NC}"
else
    echo -e "${RED}✗ No se pudo conectar al servidor${NC}"
    echo -e "${YELLOW}Verifica que puedas conectarte con: ssh ${SERVER_USER}@${SERVER_HOST}${NC}"
    exit 1
fi

# 2. Crear directorio en el servidor si no existe
echo -e "\n${YELLOW}[2/9] Preparando directorio en el servidor...${NC}"
run_remote "mkdir -p ${SERVER_DIR}"
echo -e "${GREEN}✓ Directorio creado: ${SERVER_DIR}${NC}"

# 3. Construir frontend localmente
echo -e "\n${YELLOW}[3/9] Construyendo frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✓ Frontend construido${NC}"

# 4. Sincronizar archivos al servidor (excluyendo node_modules)
echo -e "\n${YELLOW}[4/9] Sincronizando archivos al servidor...${NC}"
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'whatsapp_sessions' \
  --exclude '.env' \
  --exclude 'uploads/*' \
  --exclude '.claude' \
  --exclude '*.csv' \
  --exclude '*.srt' \
  --exclude '*.txt' \
  --exclude 'nul' \
  ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_DIR}/

echo -e "${GREEN}✓ Archivos sincronizados${NC}"

# 5. Copiar archivo de configuración de producción
echo -e "\n${YELLOW}[5/9] Configurando variables de entorno...${NC}"
scp backend/.env.production ${SERVER_USER}@${SERVER_HOST}:${SERVER_DIR}/.env
echo -e "${GREEN}✓ Variables de entorno configuradas${NC}"

# 6. Instalar dependencias en el servidor
echo -e "\n${YELLOW}[6/9] Instalando dependencias en el servidor...${NC}"
run_remote "cd ${SERVER_DIR} && npm install --production"
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# 7. Configurar PM2
echo -e "\n${YELLOW}[7/9] Configurando PM2...${NC}"
run_remote "cd ${SERVER_DIR} && pm2 delete ${APP_NAME} 2>/dev/null || true"
run_remote "cd ${SERVER_DIR} && pm2 start backend/server.js --name ${APP_NAME} --time"
run_remote "pm2 save"
run_remote "pm2 startup systemd -u ${SERVER_USER} --hp /home/${SERVER_USER}" || echo -e "${YELLOW}⚠ Puede que necesites ejecutar el comando de startup manualmente${NC}"
echo -e "${GREEN}✓ PM2 configurado${NC}"

# 8. Verificar estado de la aplicación
echo -e "\n${YELLOW}[8/9] Verificando estado de la aplicación...${NC}"
run_remote "pm2 status"
echo -e "${GREEN}✓ Aplicación corriendo${NC}"

# 9. Mostrar logs
echo -e "\n${YELLOW}[9/9] Mostrando logs...${NC}"
run_remote "pm2 logs ${APP_NAME} --lines 20 --nostream"

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}  ¡Deployment completado!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo -e "\nPróximos pasos:"
echo -e "1. Configurar Nginx para el dominio ${DOMAIN}"
echo -e "2. Configurar MySQL en el servidor (ver instrucciones abajo)"
echo -e "3. Ejecutar migraciones de base de datos"
echo -e "\nComandos útiles:"
echo -e "  Ver logs: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${APP_NAME}'"
echo -e "  Reiniciar: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 restart ${APP_NAME}'"
echo -e "  Estado: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 status'"
