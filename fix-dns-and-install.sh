#!/bin/bash

# Script alternativo para Linux Mint cuando resolv.conf no existe

set -e

echo "==================================="
echo "  Instalación en servidor Mint"
echo "  (Versión alternativa para DNS)"
echo "==================================="

DB_PASSWORD="cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4"

# 1. Configurar DNS alternativo (NetworkManager)
echo ""
echo "[1/8] Configurando DNS..."

# Opción 1: Usar systemd-resolved si está disponible
if command -v systemd-resolve &> /dev/null; then
    echo "Usando systemd-resolved..."
    sudo mkdir -p /etc/systemd/resolved.conf.d/
    echo "[Resolve]" | sudo tee /etc/systemd/resolved.conf.d/dns.conf
    echo "DNS=8.8.8.8 8.8.4.4" | sudo tee -a /etc/systemd/resolved.conf.d/dns.conf
    sudo systemctl restart systemd-resolved
fi

# Opción 2: Configurar NetworkManager
if command -v nmcli &> /dev/null; then
    echo "Configurando DNS en NetworkManager..."
    # Obtener la conexión activa
    ACTIVE_CONNECTION=$(nmcli -t -f NAME connection show --active | head -n1)
    if [ -n "$ACTIVE_CONNECTION" ]; then
        sudo nmcli connection modify "$ACTIVE_CONNECTION" ipv4.dns "8.8.8.8 8.8.4.4"
        sudo nmcli connection modify "$ACTIVE_CONNECTION" ipv4.ignore-auto-dns yes
        sudo nmcli connection down "$ACTIVE_CONNECTION" && sudo nmcli connection up "$ACTIVE_CONNECTION"
    fi
fi

# Opción 3: Crear resolv.conf si no existe
if [ ! -f /etc/resolv.conf ]; then
    echo "Creando /etc/resolv.conf..."
    sudo touch /etc/resolv.conf
    echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
    echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf
fi

echo "✓ DNS configurado"

# 2. Esperar un momento para que DNS se aplique
echo ""
echo "[2/8] Esperando a que DNS se aplique..."
sleep 3

# 3. Verificar conectividad
echo ""
echo "[3/8] Verificando conectividad..."
if ping -c 2 registry.npmjs.org &> /dev/null; then
    echo "✓ Internet funciona correctamente"
else
    echo "⚠ Advertencia: No se puede resolver registry.npmjs.org"
    echo "Intentando con IP directa de Google..."
    ping -c 2 8.8.8.8
fi

# 4. Instalar PM2
echo ""
echo "[4/8] Instalando PM2..."
if command -v pm2 &> /dev/null; then
    echo "PM2 ya está instalado"
else
    sudo npm install -g pm2
fi
pm2 --version
echo "✓ PM2 instalado"

# 5. Actualizar e instalar MySQL
echo ""
echo "[5/8] Instalando MySQL Server..."
sudo apt update
if command -v mysql &> /dev/null; then
    echo "MySQL ya está instalado"
else
    sudo apt install mysql-server -y
    sudo systemctl enable mysql
    sudo systemctl start mysql
fi
echo "✓ MySQL instalado"

# 6. Instalar Nginx
echo ""
echo "[6/8] Instalando Nginx..."
if command -v nginx &> /dev/null; then
    echo "Nginx ya está instalado"
else
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi
echo "✓ Nginx instalado"

# 7. Instalar Chromium
echo ""
echo "[7/8] Instalando Chromium..."
if command -v chromium-browser &> /dev/null || command -v chromium &> /dev/null; then
    echo "Chromium ya está instalado"
else
    sudo apt install chromium-browser -y || sudo apt install chromium -y
fi
echo "✓ Chromium instalado"

# 8. Instalar herramientas adicionales
echo ""
echo "[8/8] Instalando herramientas adicionales..."
sudo apt install build-essential python3 rsync -y
echo "✓ Herramientas instaladas"

# Crear directorio
mkdir -p ~/tecnomecanica

echo ""
echo "==================================="
echo "  ✓ Instalación completada"
echo "==================================="
echo ""
echo "Software instalado:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  PM2: $(pm2 --version)"
echo "  MySQL: $(mysql --version | cut -d' ' -f6)"
echo "  Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo "==================================="
echo "  Ahora configura MySQL"
echo "==================================="
echo ""
echo "Ejecuta: sudo mysql -u root"
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
echo "Después de configurar MySQL:"
echo "En tu máquina local ejecuta:"
echo "./deploy-to-mint.sh"
echo "==================================="
