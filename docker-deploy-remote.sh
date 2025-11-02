#!/bin/bash

# Script de deployment remoto con Docker
# Para servidor: mint@192.168.1.63

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
SERVER_USER="mint"
SERVER_HOST="192.168.1.63"
SERVER_DIR="/home/mint/tecnomecanica"
APP_NAME="tecnomecanica"

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Deployment con Docker${NC}"
echo -e "${GREEN}  Servidor: ${SERVER_HOST}${NC}"
echo -e "${GREEN}==========================================${NC}"

# 1. Verificar conexión
echo -e "\n${YELLOW}[1/8] Verificando conexión al servidor...${NC}"
if ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'OK'" 2>/dev/null; then
    echo -e "${GREEN}✓ Conectado${NC}"
else
    echo -e "${RED}✗ No se pudo conectar${NC}"
    exit 1
fi

# 2. Crear directorio
echo -e "\n${YELLOW}[2/8] Creando directorio en el servidor...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_DIR}"
echo -e "${GREEN}✓ Directorio creado${NC}"

# 3. Preparar archivo .env
echo -e "\n${YELLOW}[3/8] Preparando variables de entorno...${NC}"
cat > .env.docker.prod << 'EOF'
# MySQL
MYSQL_ROOT_PASSWORD=RootPass_Secure_2024!
MYSQL_USER=tecnomecanica
MYSQL_PASSWORD=cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4
MYSQL_PORT=3306

# JWT
JWT_SECRET=e93ac237a40b96ef8e40fe13a50fe5c1dab781fd9d6f80b14d2bd886fb62dcd8c1adb03231728ceb570168dae09266e9b2a1820f9b3257b050365bbae280068c

# Puertos
APP_PORT=3001
HTTP_PORT=80
HTTPS_PORT=443
EOF
echo -e "${GREEN}✓ Variables configuradas${NC}"

# 4. Sincronizar archivos
echo -e "\n${YELLOW}[4/8] Sincronizando archivos...${NC}"
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'whatsapp_sessions' \
  --exclude 'uploads/*' \
  --exclude '.claude' \
  --exclude '*.csv' \
  --exclude 'nul' \
  --exclude 'frontend/node_modules' \
  --exclude 'backend/node_modules' \
  ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_DIR}/

# Copiar .env
scp .env.docker.prod ${SERVER_USER}@${SERVER_HOST}:${SERVER_DIR}/.env

echo -e "${GREEN}✓ Archivos sincronizados${NC}"

# 5. Verificar Docker en el servidor
echo -e "\n${YELLOW}[5/8] Verificando Docker en el servidor...${NC}"
if ssh ${SERVER_USER}@${SERVER_HOST} "docker --version && docker compose version" 2>/dev/null; then
    echo -e "${GREEN}✓ Docker está instalado${NC}"
else
    echo -e "${RED}✗ Docker no está instalado${NC}"
    echo -e "${YELLOW}Ejecuta en el servidor: ./install-docker.sh${NC}"
    exit 1
fi

# 6. Construir y levantar contenedores
echo -e "\n${YELLOW}[6/8] Construyendo y levantando contenedores...${NC}"
echo -e "${BLUE}Esto puede tardar varios minutos...${NC}"

ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_DIR} && docker compose down 2>/dev/null || true"
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_DIR} && docker compose build --no-cache"
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_DIR} && docker compose up -d"

echo -e "${GREEN}✓ Contenedores levantados${NC}"

# 7. Esperar a que MySQL esté listo y ejecutar migraciones
echo -e "\n${YELLOW}[7/8] Esperando a que MySQL esté listo...${NC}"
sleep 20

echo -e "${YELLOW}Ejecutando migraciones...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_DIR} && docker compose exec -T app npx sequelize-cli db:migrate"
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_DIR} && docker compose exec -T app npx sequelize-cli db:seed:all"

echo -e "${GREEN}✓ Migraciones ejecutadas${NC}"

# 8. Ver estado
echo -e "\n${YELLOW}[8/8] Verificando estado de los contenedores...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_DIR} && docker compose ps"

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}  ✓ DEPLOYMENT COMPLETADO${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "Aplicación disponible en:"
echo -e "  ${BLUE}http://192.168.1.63${NC}"
echo -e "  ${BLUE}http://tecnomecanica.ilyforge.com${NC}"
echo ""
echo -e "Usuario por defecto:"
echo -e "  Email: ${BLUE}admin@admin.com${NC}"
echo -e "  Password: ${BLUE}admin123${NC}"
echo ""
echo -e "Ver logs:"
echo -e "  ${BLUE}ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_DIR} && docker compose logs -f'${NC}"
echo ""
echo -e "Gestión:"
echo -e "  Ver estado: ${BLUE}docker compose ps${NC}"
echo -e "  Reiniciar: ${BLUE}docker compose restart${NC}"
echo -e "  Detener: ${BLUE}docker compose down${NC}"
echo ""

# Limpiar archivo temporal
rm -f .env.docker.prod
