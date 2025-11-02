# Guía de Deployment - Linux Mint Server

Esta guía te ayudará a desplegar el Sistema de Recordatorios de Tecnomecánica en tu servidor Linux Mint.

## Información del Servidor

- **Usuario SSH**: mint@192.168.1.64
- **Dominio**: tecnomecanica.ilyforge.com
- **IP Pública**: 186.31.27.110
- **Directorio de instalación**: /home/mint/tecnomecanica

## Pre-requisitos en el Servidor Linux Mint

Antes de ejecutar el deployment, asegúrate de que el servidor tenga instalado:

### 1. Node.js y npm

```bash
# Conectarse al servidor
ssh mint@192.168.1.64

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2. PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 startup systemd
```

### 3. MySQL Server

```bash
# Instalar MySQL
sudo apt update
sudo apt install mysql-server -y

# Asegurar instalación
sudo mysql_secure_installation

# Crear base de datos y usuario
sudo mysql -u root -p
```

En el prompt de MySQL, ejecuta:

```sql
CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'tecnomecanica'@'localhost' IDENTIFIED BY 'TU_PASSWORD_SEGURA';
GRANT ALL PRIVILEGES ON soat_reminders.* TO 'tecnomecanica'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Dependencias adicionales

```bash
# Chromium para WhatsApp Web
sudo apt install -y chromium-browser

# Herramientas de compilación para módulos nativos
sudo apt install -y build-essential python3
```

## Deployment desde tu máquina local

### Paso 1: Preparar SSH

Asegúrate de poder conectarte sin contraseña usando SSH keys:

```bash
# En tu máquina local (Windows)
# Si no tienes una clave SSH, créala:
ssh-keygen -t rsa -b 4096

# Copiar la clave al servidor
ssh-copy-id mint@192.168.1.64
```

### Paso 2: Configurar variables de entorno

Edita el archivo `backend/.env.production` con la configuración correcta:

```bash
# Entorno
NODE_ENV=production

# Puerto del servidor
PORT=3001

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=soat_reminders
DB_USER=tecnomecanica
DB_PASSWORD=TU_PASSWORD_SEGURA

# JWT Secret (generar uno seguro)
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion-12345

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp_sessions

# Logs
LOG_LEVEL=info
```

### Paso 3: Ejecutar el script de deployment

```bash
# Dar permisos de ejecución
chmod +x deploy-to-mint.sh

# Ejecutar deployment
./deploy-to-mint.sh
```

## Configuración en el Servidor

### 1. Configurar Nginx

```bash
# Conectarse al servidor
ssh mint@192.168.1.64

# Copiar configuración de Nginx
sudo cp /home/mint/tecnomecanica/nginx-config.conf /etc/nginx/sites-available/tecnomecanica

# Crear symlink
sudo ln -s /etc/nginx/sites-available/tecnomecanica /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 2. Configurar el firewall

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 3. Ejecutar migraciones de base de datos

```bash
cd /home/mint/tecnomecanica

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Ejecutar seeds (datos iniciales)
npx sequelize-cli db:seed:all
```

### 4. Configurar SSL con Let's Encrypt (Opcional pero recomendado)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tecnomecanica.ilyforge.com

# El certificado se renovará automáticamente
```

Después de obtener el certificado SSL, edita `/etc/nginx/sites-available/tecnomecanica` y descomenta la sección HTTPS.

## Verificación

### 1. Verificar que la aplicación esté corriendo

```bash
ssh mint@192.168.1.64 'pm2 status'
```

### 2. Ver logs

```bash
ssh mint@192.168.1.64 'pm2 logs tecnomecanica'
```

### 3. Probar la aplicación

Abre en tu navegador:
- http://tecnomecanica.ilyforge.com (o https:// si configuraste SSL)

## Comandos Útiles

### En tu máquina local

```bash
# Re-deployar cambios
./deploy-to-mint.sh

# Conectarse al servidor
ssh mint@192.168.1.64
```

### En el servidor

```bash
# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs tecnomecanica

# Reiniciar la aplicación
pm2 restart tecnomecanica

# Detener la aplicación
pm2 stop tecnomecanica

# Ver uso de recursos
pm2 monit

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/tecnomecanica_access.log
sudo tail -f /var/log/nginx/tecnomecanica_error.log
```

## Actualizar la Aplicación

Para actualizar la aplicación después de hacer cambios:

```bash
# Desde tu máquina local
./deploy-to-mint.sh
```

El script automáticamente:
1. Construye el frontend
2. Sincroniza los archivos
3. Instala dependencias
4. Reinicia PM2

## Backup de Base de Datos

```bash
# Crear backup
ssh mint@192.168.1.64 'mysqldump -u tecnomecanica -p soat_reminders > ~/backup_$(date +%Y%m%d).sql'

# Restaurar backup
ssh mint@192.168.1.64 'mysql -u tecnomecanica -p soat_reminders < ~/backup_FECHA.sql'
```

## Configuración DNS

Asegúrate de que tu proveedor de DNS tenga configurado el registro A:

```
Tipo: A Record
Host: tecnomecanica
Valor: 186.31.27.110
TTL: Automático
```

Puedes verificar la configuración DNS con:

```bash
nslookup tecnomecanica.ilyforge.com
# o
dig tecnomecanica.ilyforge.com
```

## Troubleshooting

### La aplicación no arranca

```bash
ssh mint@192.168.1.64
cd /home/mint/tecnomecanica
pm2 logs tecnomecanica --err
```

### Error de conexión a MySQL

Verifica las credenciales en `.env`:
```bash
ssh mint@192.168.1.64
cat /home/mint/tecnomecanica/.env
```

### Error 502 Bad Gateway en Nginx

```bash
# Verificar que la aplicación esté corriendo
ssh mint@192.168.1.64 'pm2 status'

# Verificar que esté escuchando en el puerto correcto
ssh mint@192.168.1.64 'netstat -tlnp | grep 3001'
```

### WhatsApp no conecta

```bash
# Ver logs de WhatsApp
ssh mint@192.168.1.64 'pm2 logs tecnomecanica | grep -i whatsapp'

# Verificar que Chromium esté instalado
ssh mint@192.168.1.64 'which chromium-browser'
```

## Seguridad

1. **Cambiar el JWT_SECRET** en el archivo `.env` a algo único y seguro
2. **Usar contraseñas fuertes** para MySQL
3. **Configurar SSL** con Let's Encrypt
4. **Configurar firewall** (UFW) correctamente
5. **Mantener el sistema actualizado**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Soporte

Si encuentras problemas durante el deployment, verifica:
1. Los logs de PM2: `pm2 logs`
2. Los logs de Nginx: `/var/log/nginx/tecnomecanica_error.log`
3. Los logs del sistema: `sudo journalctl -xe`
