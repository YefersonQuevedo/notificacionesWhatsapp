#!/bin/bash

# Script de despliegue para Grupo Cardeñoza
# Sistema de Recordatorios de Tecnomecánica

set -e

echo "================================================"
echo "  Grupo Cardeñoza - Sistema de Recordatorios"
echo "  Despliegue con Docker"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker no está instalado${NC}"
    echo "Instala Docker desde: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}ERROR: Docker Compose no está instalado${NC}"
    echo "Instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker y Docker Compose están instalados${NC}"
echo ""

# Verificar archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ Archivo .env no encontrado${NC}"
    echo "Copiando .env.docker a .env..."
    cp .env.docker .env
    echo -e "${YELLOW}IMPORTANTE: Edita el archivo .env con tus valores de producción${NC}"
    echo "  - Cambia las contraseñas"
    echo "  - Cambia el JWT_SECRET"
    echo ""
    read -p "Presiona Enter cuando hayas editado .env para continuar..."
fi

echo -e "${GREEN}✓ Archivo .env encontrado${NC}"
echo ""

# Crear directorios necesarios
echo "Creando directorios necesarios..."
mkdir -p backup logs nginx/ssl

echo -e "${GREEN}✓ Directorios creados${NC}"
echo ""

# Preguntar acción
echo "¿Qué deseas hacer?"
echo "1) Iniciar servicios (primera vez)"
echo "2) Reiniciar servicios"
echo "3) Detener servicios"
echo "4) Ver logs"
echo "5) Ejecutar migraciones"
echo "6) Hacer backup de base de datos"
echo "7) Reconstruir imágenes"
echo ""
read -p "Selecciona una opción [1-7]: " option

case $option in
    1)
        echo ""
        echo "Iniciando servicios por primera vez..."
        echo "Esto puede tardar varios minutos..."
        echo ""

        # Construir imágenes
        docker-compose build --no-cache

        # Iniciar servicios
        docker-compose up -d

        echo ""
        echo -e "${GREEN}✓ Servicios iniciados${NC}"
        echo ""
        echo "Esperando que los servicios estén listos..."
        sleep 10

        # Ejecutar migraciones
        echo "Ejecutando migraciones de base de datos..."
        docker-compose exec app npm run db:migrate

        echo ""
        echo "Ejecutando seeds (datos iniciales)..."
        docker-compose exec app npm run db:seed

        echo ""
        echo -e "${GREEN}================================================${NC}"
        echo -e "${GREEN}  ✓ DESPLIEGUE COMPLETADO EXITOSAMENTE${NC}"
        echo -e "${GREEN}================================================${NC}"
        echo ""
        echo "Accede a la aplicación en:"
        echo "  http://localhost"
        echo "  o"
        echo "  http://IP_DEL_SERVIDOR"
        echo ""
        echo "Usuario por defecto:"
        echo "  Email: admin@grupocardenoza.com"
        echo "  Password: admin123"
        echo ""
        echo "Ver logs:"
        echo "  docker-compose logs -f"
        echo ""
        ;;

    2)
        echo ""
        echo "Reiniciando servicios..."
        docker-compose restart
        echo ""
        echo -e "${GREEN}✓ Servicios reiniciados${NC}"
        ;;

    3)
        echo ""
        echo "Deteniendo servicios..."
        docker-compose down
        echo ""
        echo -e "${GREEN}✓ Servicios detenidos${NC}"
        echo ""
        echo "Para eliminar también los volúmenes (datos), ejecuta:"
        echo "  docker-compose down -v"
        ;;

    4)
        echo ""
        echo "Mostrando logs (Ctrl+C para salir)..."
        echo ""
        docker-compose logs -f
        ;;

    5)
        echo ""
        echo "Ejecutando migraciones..."
        docker-compose exec app npm run db:migrate
        echo ""
        echo -e "${GREEN}✓ Migraciones ejecutadas${NC}"
        ;;

    6)
        echo ""
        BACKUP_FILE="backup/backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "Creando backup en: $BACKUP_FILE"

        # Obtener credenciales del .env
        source .env

        docker-compose exec mysql mysqldump \
            -u root \
            -p"$MYSQL_ROOT_PASSWORD" \
            soat_reminders > "$BACKUP_FILE"

        echo ""
        echo -e "${GREEN}✓ Backup creado exitosamente${NC}"
        echo "Archivo: $BACKUP_FILE"
        ;;

    7)
        echo ""
        echo "Reconstruyendo imágenes..."
        docker-compose build --no-cache
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✓ Imágenes reconstruidas y servicios reiniciados${NC}"
        ;;

    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
