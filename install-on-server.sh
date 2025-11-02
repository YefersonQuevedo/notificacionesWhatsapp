#!/bin/bash

# Script para ejecutar EN EL SERVIDOR Linux Mint
# Copia este script completo y pégalo en la terminal del servidor

set -e

echo "==================================="
echo "  Instalación en servidor Mint"
echo "==================================="

# Contraseñas generadas:
DB_PASSWORD="cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4"

# 1. Configurar DNS (temporal)
echo ""
echo "[1/7] Configurando DNS..."
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf
echo "✓ DNS configurado"

# 2. Verificar conectividad
echo ""
echo "[2/7] Verificando conectividad..."
ping -c 2 registry.npmjs.org
echo "✓ Internet funciona"

# 3. Instalar PM2
echo ""
echo "[3/7] Instalando PM2..."
sudo npm install -g pm2
pm2 --version
echo "✓ PM2 instalado"

# 4. Actualizar e instalar MySQL
echo ""
echo "[4/7] Instalando MySQL Server..."
sudo apt update
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo systemctl start mysql
echo "✓ MySQL instalado"

# 5. Instalar Nginx
echo ""
echo "[5/7] Instalando Nginx..."
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
echo "✓ Nginx instalado"

# 6. Instalar Chromium
echo ""
echo "[6/7] Instalando Chromium..."
sudo apt install chromium-browser -y || sudo apt install chromium -y
echo "✓ Chromium instalado"

# 7. Instalar herramientas adicionales
echo ""
echo "[7/7] Instalando herramientas adicionales..."
sudo apt install build-essential python3 rsync -y
echo "✓ Herramientas instaladas"

# Crear directorio
mkdir -p ~/tecnomecanica

# Configurar MySQL
echo ""
echo "==================================="
echo "  Ahora configura MySQL"
echo "==================================="
echo ""
echo "Ejecuta estos comandos en MySQL:"
echo ""
echo "sudo mysql -u root"
echo ""
echo "Luego copia y pega esto:"
echo ""
cat <<'MYSQLEOF'
CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tecnomecanica'@'localhost' IDENTIFIED BY 'cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4';
GRANT ALL PRIVILEGES ON soat_reminders.* TO 'tecnomecanica'@'localhost';
FLUSH PRIVILEGES;
EXIT;
MYSQLEOF

echo ""
echo "==================================="
echo "  Software instalado:"
echo "==================================="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "MySQL: $(mysql --version | cut -d' ' -f6)"
echo "Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo "Después de configurar MySQL, ejecuta en tu máquina local:"
echo "./deploy-to-mint.sh"
