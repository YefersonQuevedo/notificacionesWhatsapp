#!/bin/bash

# Script para verificar si el servidor está listo para deployment

SERVER="mint@192.168.1.63"

echo "Verificando servidor..."
echo ""

# Verificar PM2
if ssh $SERVER 'which pm2' &>/dev/null; then
    echo "✓ PM2 instalado"
    PM2_OK=1
else
    echo "✗ PM2 no instalado"
    PM2_OK=0
fi

# Verificar MySQL
if ssh $SERVER 'which mysql' &>/dev/null; then
    echo "✓ MySQL instalado"
    MYSQL_OK=1
else
    echo "✗ MySQL no instalado"
    MYSQL_OK=0
fi

# Verificar Nginx
if ssh $SERVER 'which nginx' &>/dev/null; then
    echo "✓ Nginx instalado"
    NGINX_OK=1
else
    echo "✗ Nginx no instalado"
    NGINX_OK=0
fi

# Verificar base de datos
if ssh $SERVER 'mysql -u tecnomecanica -pcIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4 -e "USE soat_reminders; SELECT 1;" &>/dev/null'; then
    echo "✓ Base de datos configurada"
    DB_OK=1
else
    echo "✗ Base de datos no configurada"
    DB_OK=0
fi

echo ""

if [ $PM2_OK -eq 1 ] && [ $MYSQL_OK -eq 1 ] && [ $NGINX_OK -eq 1 ] && [ $DB_OK -eq 1 ]; then
    echo "========================================="
    echo "  ✓ Servidor listo para deployment"
    echo "========================================="
    echo ""
    echo "Ejecuta: ./deploy-to-mint.sh"
    exit 0
else
    echo "========================================="
    echo "  ✗ Servidor no está listo"
    echo "========================================="
    echo ""
    echo "Completa los pasos en PASOS_INSTALACION_SERVIDOR.md"
    exit 1
fi
