# Pasos de Instalación en el Servidor

## 🔧 Ejecuta esto EN EL SERVIDOR (mint@192.168.1.63)

### Paso 1: Conectarse al servidor

```bash
ssh mint@192.168.1.63
```

### Paso 2: Ejecutar el script de instalación

Ya transferí el script al servidor. Ahora ejecútalo:

```bash
./install-on-server.sh
```

El script te pedirá la contraseña de sudo y automáticamente:
- ✅ Configurará el DNS
- ✅ Instalará PM2
- ✅ Instalará MySQL
- ✅ Instalará Nginx
- ✅ Instalará Chromium
- ✅ Instalará herramientas necesarias

### Paso 3: Configurar MySQL

Después de que termine el script anterior, ejecuta:

```bash
sudo mysql -u root
```

Dentro de MySQL, copia y pega estos comandos:

```sql
CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tecnomecanica'@'localhost' IDENTIFIED BY 'cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4';
GRANT ALL PRIVILEGES ON soat_reminders.* TO 'tecnomecanica'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Paso 4: Verificar que MySQL funcione

```bash
mysql -u tecnomecanica -p -e "SHOW DATABASES;"
```

Cuando pida la contraseña, usa:
```
cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4
```

### Paso 5: Verificar servicios

```bash
# Verificar PM2
pm2 --version

# Verificar MySQL
sudo systemctl status mysql

# Verificar Nginx
sudo systemctl status nginx
```

---

## 💻 Luego ejecuta esto EN TU MÁQUINA WINDOWS

Una vez completados todos los pasos anteriores en el servidor, desde tu máquina Windows ejecuta:

```bash
./deploy-to-mint.sh
```

Esto va a:
1. Construir el frontend
2. Sincronizar archivos al servidor
3. Instalar dependencias de Node.js
4. Configurar y arrancar PM2
5. Iniciar la aplicación

---

## 🌐 Configurar Nginx (EN EL SERVIDOR)

Después del deployment, vuelve al servidor:

```bash
ssh mint@192.168.1.63

# Copiar configuración de Nginx
sudo cp ~/tecnomecanica/nginx-config.conf /etc/nginx/sites-available/tecnomecanica

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/tecnomecanica /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Si todo está bien, recargar Nginx
sudo systemctl reload nginx
```

---

## 🗄️ Ejecutar Migraciones (EN EL SERVIDOR)

```bash
cd ~/tecnomecanica
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---

## ✅ Verificar que Todo Funcione

### En el servidor:

```bash
# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs tecnomecanica

# Verificar puerto
netstat -tlnp | grep 3001

# Verificar Nginx
curl http://localhost
```

### En tu navegador:

Abre: http://tecnomecanica.ilyforge.com

Usuario: `admin@admin.com`
Contraseña: `admin123`

---

## 🔍 Troubleshooting

### Si PM2 no arranca:

```bash
cd ~/tecnomecanica
pm2 logs tecnomecanica --err
```

### Si MySQL no conecta:

```bash
# Verificar que el servicio esté corriendo
sudo systemctl status mysql

# Probar conexión
mysql -u tecnomecanica -p soat_reminders -e "SELECT 1;"
```

### Si Nginx da error 502:

```bash
# Ver logs de error de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar que la app esté corriendo en puerto 3001
curl http://localhost:3001/api/health
```

---

## 📊 Comandos Útiles

```bash
# Ver logs de PM2
pm2 logs tecnomecanica

# Reiniciar aplicación
pm2 restart tecnomecanica

# Ver estado
pm2 status

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔐 Información de Seguridad

**Password MySQL:** `cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4`
**JWT Secret:** Ya configurado en `.env.production`
**Usuario Admin:** `admin@admin.com` / `admin123` (cámbialo después del primer login)

---

## 🎯 Resumen Rápido

1. **EN EL SERVIDOR**: `./install-on-server.sh`
2. **EN EL SERVIDOR**: Configurar MySQL (comandos arriba)
3. **EN TU MÁQUINA**: `./deploy-to-mint.sh`
4. **EN EL SERVIDOR**: Configurar Nginx
5. **EN EL SERVIDOR**: `npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all`
6. **EN EL NAVEGADOR**: Abrir http://tecnomecanica.ilyforge.com
