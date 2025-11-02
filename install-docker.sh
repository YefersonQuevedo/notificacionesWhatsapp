#!/bin/bash

# Script para instalar Docker y Docker Compose en Linux Mint
# Ejecutar en el servidor: ./install-docker.sh

set -e

echo "=========================================="
echo "  Instalando Docker en Linux Mint"
echo "=========================================="

# 1. Actualizar paquetes
echo ""
echo "[1/5] Actualizando paquetes..."
sudo apt update

# 2. Instalar dependencias
echo ""
echo "[2/5] Instalando dependencias..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 3. Agregar clave GPG de Docker
echo ""
echo "[3/5] Agregando repositorio de Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Linux Mint 22 está basado en Ubuntu 24.04 (Noble)
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu noble stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Instalar Docker
echo ""
echo "[4/5] Instalando Docker..."
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Configurar permisos
echo ""
echo "[5/5] Configurando permisos..."
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

echo ""
echo "=========================================="
echo "  ✓ Docker instalado correctamente"
echo "=========================================="
echo ""
echo "Versiones instaladas:"
sudo docker --version
sudo docker compose version
echo ""
echo "⚠ IMPORTANTE: Cierra sesión y vuelve a entrar para que los permisos surtan efecto"
echo "O ejecuta: newgrp docker"
echo ""
echo "Luego, desde tu máquina local ejecuta:"
echo "./docker-deploy.sh"
