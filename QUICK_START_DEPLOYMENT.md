# Guía Rápida de Deployment - Tecnomecánica

## Información Rápida

- **Servidor**: mint@192.168.1.64
- **Dominio**: tecnomecanica.ilyforge.com
- **IP Pública**: 186.31.27.110
- **Directorio**: /home/mint/tecnomecanica
- **Puerto interno**: 3001

## Pasos Rápidos (Resumen)

### 1. Preparar el Servidor (Solo la primera vez)

```bash
# Desde tu máquina Windows, ejecuta:
ssh mint@192.168.1.64 'bash -s' < setup-server.sh
```

Esto instalará automáticamente:
- Node.js 20.x
- PM2
- MySQL
- Nginx
- Chromium
- Dependencias necesarias

### 2. Configurar MySQL

```bash
# Conectarse al servidor
ssh mint@192.168.1.64

# Generar secretos seguros (guárdalos en un lugar seguro)
node ~/tecnomecanica/generate-secrets.js

# Acceder a MySQL
sudo mysql -u root -p

# En MySQL, ejecuta (reemplaza PASSWORD_GENERADO con el que generaste):
CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tecnomecanica'@'localhost' IDENTIFIED BY 'PASSWORD_GENERADO';
GRANT ALL PRIVILEGES ON soat_reminders.* TO 'tecnomecanica'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Actualizar Variables de Entorno

En tu máquina local, edita `backend/.env.production` y reemplaza:
- `CAMBIAR_PASSWORD_AQUI` → con el password de MySQL que generaste
- `CAMBIAR_JWT_SECRET_AQUI` → con el JWT secret que generaste

### 4. Desplegar la Aplicación

```bash
# En tu máquina Windows (Git Bash):
chmod +x deploy-to-mint.sh
./deploy-to-mint.sh
```

### 5. Configurar Nginx

```bash
# Conectarse al servidor
ssh mint@192.168.1.64

# Copiar configuración de Nginx
sudo cp ~/tecnomecanica/nginx-config.conf /etc/nginx/sites-available/tecnomecanica
sudo ln -s /etc/nginx/sites-available/tecnomecanica /etc/nginx/sites-enabled/

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Ejecutar Migraciones de Base de Datos

```bash
# En el servidor
ssh mint@192.168.1.64
cd ~/tecnomecanica
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 7. Configurar SSL (Opcional pero Recomendado)

```bash
# En el servidor
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tecnomecanica.ilyforge.com
```

## Verificar que Todo Funciona

1. **Estado de PM2**:
   ```bash
   ssh mint@192.168.1.64 'pm2 status'
   ```

2. **Ver logs**:
   ```bash
   ssh mint@192.168.1.64 'pm2 logs tecnomecanica --lines 50'
   ```

3. **Probar en el navegador**:
   - http://tecnomecanica.ilyforge.com
   - Usuario: admin@admin.com
   - Contraseña: admin123

## Comandos Útiles

### Desde tu máquina local

```bash
# Re-deployar después de cambios
./deploy-to-mint.sh

# Ver logs remotos
ssh mint@192.168.1.64 'pm2 logs tecnomecanica'

# Ver estado
ssh mint@192.168.1.64 'pm2 status'

# Reiniciar aplicación
ssh mint@192.168.1.64 'pm2 restart tecnomecanica'
```

### En el servidor

```bash
# Ver logs
pm2 logs tecnomecanica

# Reiniciar
pm2 restart tecnomecanica

# Detener
pm2 stop tecnomecanica

# Monitorear recursos
pm2 monit

# Ver logs de Nginx
sudo tail -f /var/log/nginx/tecnomecanica_access.log
sudo tail -f /var/log/nginx/tecnomecanica_error.log
```

## Actualizar la Aplicación

Cada vez que hagas cambios en el código:

```bash
# Desde tu máquina local
./deploy-to-mint.sh
```

El script automáticamente:
1. Construye el frontend
2. Sincroniza archivos
3. Instala dependencias
4. Reinicia la aplicación

## Configuración DNS

Verifica que tu DNS esté configurado correctamente:

**En tu proveedor de dominios (donde compraste ilyforge.com):**

```
Tipo: A Record
Host: tecnomecanica
Valor: 186.31.27.110
TTL: Automatic
```

**Verificar DNS:**
```bash
nslookup tecnomecanica.ilyforge.com
# Debe mostrar: 186.31.27.110
```

## Troubleshooting Rápido

### ❌ No puedo conectarme por SSH
```bash
# Verificar que el servidor esté accesible
ping 192.168.1.64

# Copiar tu clave SSH si no lo has hecho
ssh-copy-id mint@192.168.1.64
```

### ❌ Error 502 Bad Gateway
```bash
# Verificar que la app esté corriendo
ssh mint@192.168.1.64 'pm2 status'

# Ver logs de errores
ssh mint@192.168.1.64 'pm2 logs tecnomecanica --err'
```

### ❌ No conecta a MySQL
```bash
# Verificar las credenciales
ssh mint@192.168.1.64 'cat ~/tecnomecanica/.env'

# Probar conexión MySQL
ssh mint@192.168.1.64 'mysql -u tecnomecanica -p soat_reminders -e "SHOW TABLES;"'
```

### ❌ WhatsApp no conecta
```bash
# Ver logs de WhatsApp
ssh mint@192.168.1.64 'pm2 logs tecnomecanica | grep -i whatsapp'

# Verificar que Chromium esté instalado
ssh mint@192.168.1.64 'which chromium-browser'
```

## Estructura de Archivos en el Servidor

```
/home/mint/tecnomecanica/
├── backend/           # Backend Node.js
├── frontend/          # Frontend (Vue compilado en dist/)
├── uploads/           # Archivos subidos (CSV)
├── whatsapp_sessions/ # Sesiones de WhatsApp
├── .env               # Variables de entorno
└── node_modules/      # Dependencias
```

## Backup Importante

### Hacer backup de la base de datos
```bash
ssh mint@192.168.1.64 'mysqldump -u tecnomecanica -p soat_reminders > ~/backup_$(date +%Y%m%d_%H%M%S).sql'
```

### Descargar backup a tu máquina local
```bash
scp mint@192.168.1.64:~/backup_*.sql ./backups/
```

## Seguridad

✅ **Checklist de Seguridad:**

- [ ] Cambiar JWT_SECRET en `.env`
- [ ] Usar password fuerte para MySQL
- [ ] Configurar SSL con Let's Encrypt
- [ ] Configurar firewall (UFW)
- [ ] Cambiar password de usuario admin en la aplicación
- [ ] Mantener el sistema actualizado: `sudo apt update && sudo apt upgrade`

## Próximos Pasos

1. ✅ Configurar el servidor (setup-server.sh)
2. ✅ Configurar MySQL y generar secretos
3. ✅ Actualizar variables de entorno
4. ✅ Desplegar la aplicación
5. ✅ Configurar Nginx
6. ✅ Ejecutar migraciones
7. ⚙️ Configurar SSL (certbot)
8. 🎉 ¡Listo! Acceder a https://tecnomecanica.ilyforge.com

## Soporte

Para más detalles, consulta:
- [DEPLOYMENT_MINT.md](DEPLOYMENT_MINT.md) - Guía completa
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Alternativa con Docker
- [README.md](README.md) - Documentación del proyecto
