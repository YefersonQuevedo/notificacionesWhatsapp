#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║   SOAT Reminders - Script de Instalación  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js no está instalado${NC}"
    echo "Instala Node.js 18+ desde: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) encontrado${NC}"

# Verificar MySQL
echo "Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}✗ MySQL no está instalado${NC}"
    echo "Instala MySQL 8.0 con: sudo apt install mysql-server"
    exit 1
fi
echo -e "${GREEN}✓ MySQL encontrado${NC}"

# Instalar dependencias
echo ""
echo "Instalando dependencias..."
npm run install:all
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error instalando dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# Configurar .env
echo ""
if [ ! -f .env ]; then
    echo "Configurando archivo .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Edita el archivo .env con tus credenciales de MySQL${NC}"
    echo "   nano .env"
    echo ""
    read -p "Presiona Enter cuando hayas editado el archivo .env..."
else
    echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
fi

# Leer credenciales
source .env

# Crear base de datos
echo ""
echo "Creando base de datos..."
read -sp "Ingresa tu contraseña de MySQL root: " MYSQL_ROOT_PASS
echo ""

mysql -u root -p${MYSQL_ROOT_PASS} <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Base de datos creada${NC}"
else
    echo -e "${RED}✗ Error creando base de datos${NC}"
    exit 1
fi

# Ejecutar migraciones
echo ""
echo "Ejecutando migraciones..."
npm run db:migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error ejecutando migraciones${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Migraciones ejecutadas${NC}"

# Ejecutar seeders
echo ""
echo "Cargando datos de prueba..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error cargando datos de prueba${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Datos de prueba cargados${NC}"

# Build frontend
echo ""
echo "Compilando frontend..."
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ Frontend compilado${NC}"

# Resumen
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║         ¡Instalación Completada! 🎉       ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Para iniciar en modo desarrollo:${NC}"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Para iniciar en producción:${NC}"
echo "  npm start"
echo ""
echo -e "${GREEN}Credenciales demo:${NC}"
echo "  Email: admin@demo.com"
echo "  Password: admin123"
echo ""
echo -e "${YELLOW}Accede a: http://localhost:5173${NC}"
echo ""
