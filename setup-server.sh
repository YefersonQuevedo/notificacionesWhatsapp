#!/bin/bash

# Script de configuración inicial para el servidor Linux Mint
# Este script debe ejecutarse EN EL SERVIDOR (no en tu máquina local)
# Uso: ssh mint@192.168.1.64 'bash -s' < setup-server.sh

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Configuración inicial del servidor${NC}"
echo -e "${GREEN}  Linux Mint - Tecnomecánica${NC}"
echo -e "${GREEN}==========================================${NC}"

# Verificar que se ejecuta como usuario normal (no root)
if [ "$EUID" -eq 0 ]; then
   echo -e "${RED}No ejecutes este script como root. Usa tu usuario normal.${NC}"
   exit 1
fi

# 1. Actualizar el sistema
echo -e "\n${YELLOW}[1/10] Actualizando el sistema...${NC}"
sudo apt update
sudo apt upgrade -y
echo -e "${GREEN}✓ Sistema actualizado${NC}"

# 2. Instalar Node.js
echo -e "\n${YELLOW}[2/10] Instalando Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${BLUE}Node.js ya está instalado ($(node --version))${NC}"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✓ Node.js instalado: $(node --version)${NC}"
fi

# 3. Instalar PM2
echo -e "\n${YELLOW}[3/10] Instalando PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}PM2 ya está instalado ($(pm2 --version))${NC}"
else
    sudo npm install -g pm2
    echo -e "${GREEN}✓ PM2 instalado${NC}"
fi

# Configurar PM2 para arrancar al inicio
pm2 startup systemd -u $USER --hp $HOME | grep "sudo" | bash || true
echo -e "${GREEN}✓ PM2 configurado para inicio automático${NC}"

# 4. Instalar MySQL
echo -e "\n${YELLOW}[4/10] Instalando MySQL Server...${NC}"
if command -v mysql &> /dev/null; then
    echo -e "${BLUE}MySQL ya está instalado${NC}"
else
    sudo apt install mysql-server -y
    sudo systemctl enable mysql
    sudo systemctl start mysql
    echo -e "${GREEN}✓ MySQL instalado${NC}"
    echo -e "${YELLOW}⚠ Recuerda ejecutar: sudo mysql_secure_installation${NC}"
fi

# 5. Instalar Nginx
echo -e "\n${YELLOW}[5/10] Instalando Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${BLUE}Nginx ya está instalado${NC}"
else
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo -e "${GREEN}✓ Nginx instalado${NC}"
fi

# 6. Instalar Chromium (para WhatsApp Web)
echo -e "\n${YELLOW}[6/10] Instalando Chromium...${NC}"
if command -v chromium-browser &> /dev/null || command -v chromium &> /dev/null; then
    echo -e "${BLUE}Chromium ya está instalado${NC}"
else
    sudo apt install -y chromium-browser
    echo -e "${GREEN}✓ Chromium instalado${NC}"
fi

# 7. Instalar herramientas de compilación
echo -e "\n${YELLOW}[7/10] Instalando herramientas de compilación...${NC}"
sudo apt install -y build-essential python3 python3-pip
echo -e "${GREEN}✓ Herramientas instaladas${NC}"

# 8. Configurar firewall
echo -e "\n${YELLOW}[8/10] Configurando firewall (UFW)...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw status
    echo -e "${GREEN}✓ Firewall configurado${NC}"
else
    echo -e "${YELLOW}⚠ UFW no está disponible, saltando...${NC}"
fi

# 9. Crear directorios necesarios
echo -e "\n${YELLOW}[9/10] Creando directorios del proyecto...${NC}"
mkdir -p ~/tecnomecanica
mkdir -p ~/tecnomecanica/uploads
mkdir -p ~/tecnomecanica/whatsapp_sessions
echo -e "${GREEN}✓ Directorios creados${NC}"

# 10. Configurar Git (opcional)
echo -e "\n${YELLOW}[10/10] Instalando Git...${NC}"
if command -v git &> /dev/null; then
    echo -e "${BLUE}Git ya está instalado ($(git --version))${NC}"
else
    sudo apt install git -y
    echo -e "${GREEN}✓ Git instalado${NC}"
fi

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}  ¡Configuración completada!${NC}"
echo -e "${GREEN}==========================================${NC}"

echo -e "\n${YELLOW}Próximos pasos:${NC}"
echo -e "1. Configurar MySQL:"
echo -e "   ${BLUE}sudo mysql_secure_installation${NC}"
echo -e "\n2. Crear base de datos:"
echo -e "   ${BLUE}sudo mysql -u root -p${NC}"
echo -e "   Luego ejecuta:"
echo -e "   ${BLUE}CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;${NC}"
echo -e "   ${BLUE}CREATE USER 'tecnomecanica'@'localhost' IDENTIFIED BY 'TU_PASSWORD';${NC}"
echo -e "   ${BLUE}GRANT ALL PRIVILEGES ON soat_reminders.* TO 'tecnomecanica'@'localhost';${NC}"
echo -e "   ${BLUE}FLUSH PRIVILEGES;${NC}"
echo -e "\n3. Desde tu máquina local, ejecuta:"
echo -e "   ${BLUE}./deploy-to-mint.sh${NC}"
echo -e "\n4. Configurar Nginx en el servidor:"
echo -e "   ${BLUE}sudo cp ~/tecnomecanica/nginx-config.conf /etc/nginx/sites-available/tecnomecanica${NC}"
echo -e "   ${BLUE}sudo ln -s /etc/nginx/sites-available/tecnomecanica /etc/nginx/sites-enabled/${NC}"
echo -e "   ${BLUE}sudo nginx -t && sudo systemctl reload nginx${NC}"

echo -e "\n${GREEN}Software instalado:${NC}"
echo -e "  Node.js: $(node --version)"
echo -e "  npm: $(npm --version)"
echo -e "  PM2: $(pm2 --version)"
echo -e "  MySQL: $(mysql --version | cut -d' ' -f6)"
echo -e "  Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
