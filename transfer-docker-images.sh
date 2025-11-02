#!/bin/bash

# Script para transferir imágenes Docker al servidor sin conexión a Internet

set -e

SERVER="mint@192.168.1.63"
IMAGES_DIR="/tmp/docker-images"

echo "==========================================="
echo "  Transferencia de Imágenes Docker"
echo "==========================================="

# 1. Crear directorio temporal
mkdir -p $IMAGES_DIR

# 2. Descargar imágenes en la máquina local (Windows con Docker Desktop)
echo ""
echo "[1/5] Descargando imágenes en tu máquina local..."

docker pull mysql:8.0
docker pull nginx:alpine
docker pull node:22-alpine

echo "✓ Imágenes descargadas"

# 3. Exportar imágenes a archivos tar
echo ""
echo "[2/5] Exportando imágenes a archivos..."

docker save mysql:8.0 -o $IMAGES_DIR/mysql.tar
docker save nginx:alpine -o $IMAGES_DIR/nginx.tar
docker save node:22-alpine -o $IMAGES_DIR/node.tar

echo "✓ Imágenes exportadas"

# 4. Transferir archivos al servidor
echo ""
echo "[3/5] Transfiriendo imágenes al servidor..."
echo "Esto puede tardar varios minutos..."

scp $IMAGES_DIR/mysql.tar $SERVER:/tmp/
scp $IMAGES_DIR/nginx.tar $SERVER:/tmp/
scp $IMAGES_DIR/node.tar $SERVER:/tmp/

echo "✓ Imágenes transferidas"

# 5. Importar imágenes en el servidor
echo ""
echo "[4/5] Importando imágenes en el servidor..."

ssh $SERVER 'docker load -i /tmp/mysql.tar'
ssh $SERVER 'docker load -i /tmp/node.tar'
ssh $SERVER 'docker load -i /tmp/nginx.tar'

echo "✓ Imágenes importadas"

# 6. Limpiar archivos temporales
echo ""
echo "[5/5] Limpiando archivos temporales..."

ssh $SERVER 'rm -f /tmp/mysql.tar /tmp/node.tar /tmp/nginx.tar'
rm -rf $IMAGES_DIR

echo "✓ Limpieza completada"

echo ""
echo "==========================================="
echo "  ✓ Imágenes transferidas exitosamente"
echo "==========================================="
echo ""
echo "Ahora puedes construir y levantar los contenedores:"
echo ""
echo "  ssh $SERVER"
echo "  cd ~/tecnomecanica"
echo "  docker compose up -d --build"
echo ""
