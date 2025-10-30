# Guía de Despliegue en Producción
## Sistema de Recordatorios - Grupo Cardeñoza

---

## Opción 1: Inicio Manual (Recomendado para pruebas)

### Pasos:

1. **Construir el frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Iniciar el servidor:**
   ```bash
   cd backend
   set NODE_ENV=production
   set PORT=3001
   node server.js
   ```

3. **Abrir en el navegador:**
   ```
   http://localhost:3001
   ```

### O usa el script automático:
```bash
start-production.bat
```

---

## Opción 2: Servicio de Windows (Producción real)

### Requisitos previos:

1. **Descargar NSSM (Non-Sucking Service Manager):**
   - Ir a: https://nssm.cc/download
   - Descargar la versión para Windows
   - Extraer el archivo `nssm.exe` en `C:\nssm\`

2. **Verificar que MySQL esté corriendo:**
   - Abrir XAMPP
   - Iniciar MySQL

3. **Construir el frontend:**
   ```bash
   cd frontend
   npm run build
   ```

### Instalación:

1. **Ejecutar el instalador como Administrador:**
   - Clic derecho en `install-service.bat`
   - Seleccionar "Ejecutar como administrador"

2. **Seguir las instrucciones en pantalla**

### El servicio se instalará con:
- **Nombre:** GrupoCardenoza
- **Puerto:** 3001
- **Inicio automático:** Sí (se inicia con Windows)
- **Logs:** `logs/service-output.log` y `logs/service-error.log`

### Comandos útiles:

```bash
# Ver estado del servicio
sc query GrupoCardenoza

# Detener servicio
sc stop GrupoCardenoza

# Iniciar servicio
sc start GrupoCardenoza

# Desinstalar servicio
C:\nssm\nssm.exe remove GrupoCardenoza confirm
```

---

## Opción 3: Exponer a Internet (ngrok)

### Para compartir con clientes remotos:

1. **Iniciar el sistema** (manual o servicio)

2. **Instalar ngrok:**
   - Ir a: https://ngrok.com/
   - Crear cuenta gratis
   - Descargar ngrok para Windows
   - Colocar `ngrok.exe` en una carpeta accesible

3. **Autenticarse:**
   ```bash
   ngrok config add-authtoken TU_TOKEN_DE_NGROK
   ```

4. **Exponer el servidor:**
   ```bash
   ngrok http 3001 --region=sa
   ```

5. **Compartir la URL:**
   - ngrok te dará una URL como: `https://abc123.ngrok-free.app`
   - Comparte esta URL con tus clientes

### Nota importante sobre ngrok:
- La versión gratuita genera URLs aleatorias que cambian cada vez
- Para URLs permanentes necesitas ngrok Pro
- Los usuarios verán una advertencia de ngrok, deben hacer clic en "Visit Site"

---

## Configuración de Producción

### Variables de entorno importantes:

Editar `backend/.env` o crear `backend/.env.production`:

```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=soat_reminders
DB_USER=root
DB_PASSWORD=tu_password_si_tienes
JWT_SECRET=cambiar-por-algo-super-seguro-en-produccion
```

### Seguridad:

1. **Cambiar JWT_SECRET:**
   - Usar un string largo y aleatorio
   - Ejemplo: `openssl rand -base64 32`

2. **Proteger archivos .env:**
   - No compartir
   - No subir a repositorios públicos

3. **Configurar firewall de Windows:**
   - Permitir puerto 3001 solo si es necesario
   - Para acceso local no es necesario

---

## Mantenimiento

### Ver logs del sistema:

```bash
# Si usas servicio de Windows
type logs\service-output.log
type logs\service-error.log
```

### Actualizar el sistema:

1. Detener el servicio/aplicación
2. Hacer pull de los cambios o actualizar archivos
3. Reconstruir frontend: `cd frontend && npm run build`
4. Reiniciar servicio/aplicación

### Backup de la base de datos:

```bash
"C:\xampp\mysql\bin\mysqldump" -u root soat_reminders > backup.sql
```

### Restaurar backup:

```bash
"C:\xampp\mysql\bin\mysql" -u root soat_reminders < backup.sql
```

---

## Problemas comunes

### El servicio no inicia:

1. Verificar que MySQL esté corriendo
2. Ver logs en `logs/service-error.log`
3. Verificar que el puerto 3001 no esté en uso: `netstat -ano | findstr :3001`

### Error "Cannot find module":

1. Ir a `backend/`
2. Ejecutar `npm install`

### WhatsApp no conecta:

1. Ir a `http://localhost:3001` (o tu URL)
2. Ir a la sección WhatsApp
3. Generar QR y escanear con tu teléfono

---

## Acceso remoto seguro (Alternativas a ngrok)

### 1. Cloudflare Tunnel (Gratis, recomendado):
- URLs permanentes
- Más seguro que ngrok
- Sin advertencias
- https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

### 2. LocalTunnel (Gratis):
```bash
npx localtunnel --port 3001
```

### 3. Servidor VPS (Producción profesional):
- DigitalOcean
- AWS Lightsail
- Linode
- Heroku

---

## Soporte

Para problemas o dudas:
- Revisar logs
- Verificar que todos los servicios estén corriendo
- Verificar configuración de puertos y firewall
