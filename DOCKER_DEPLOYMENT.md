# Despliegue con Docker - Grupo Cardeñoza

Sistema de Recordatorios de Tecnomecánica

## Requisitos Previos

### En el servidor Linux:

1. **Docker Engine** (versión 20.10 o superior)
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Docker Compose** (versión 2.0 o superior)
   ```bash
   # Ya viene incluido en Docker Desktop
   # Para Linux, instalar plugin:
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

3. **Git** (para clonar el repositorio)
   ```bash
   sudo apt-get install git
   ```

## Pasos de Instalación

### 1. Clonar el Repositorio

```bash
# En tu servidor Linux
git clone https://github.com/tu-usuario/cardenoza.git
cd cardenoza
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.docker .env

# Editar con tus valores de producción
nano .env
```

**IMPORTANTE**: Cambia estos valores en el archivo `.env`:

```bash
# Contraseñas seguras (genera valores aleatorios)
MYSQL_ROOT_PASSWORD=tu_password_root_MUY_seguro_cambiar
MYSQL_PASSWORD=tu_password_db_MUY_seguro_cambiar

# JWT Secret (genera un string aleatorio largo)
JWT_SECRET=tu_secreto_jwt_super_seguro_minimo_32_caracteres

# Puertos (ajustar si es necesario)
HTTP_PORT=80
HTTPS_PORT=443
APP_PORT=3001
```

**Generar passwords seguros:**
```bash
# En Linux, puedes usar:
openssl rand -base64 32
```

### 3. Desplegar la Aplicación

#### Opción A: Usando el script automatizado (Recomendado)

```bash
# Dar permisos de ejecución
chmod +x docker-deploy.sh

# Ejecutar script
./docker-deploy.sh

# Seleccionar opción 1 (Iniciar servicios primera vez)
```

#### Opción B: Manual

```bash
# 1. Construir las imágenes
docker-compose build

# 2. Iniciar los servicios
docker-compose up -d

# 3. Esperar que MySQL esté listo (30 segundos)
sleep 30

# 4. Ejecutar migraciones
docker-compose exec app npm run db:migrate

# 5. Cargar datos iniciales
docker-compose exec app npm run db:seed
```

### 4. Verificar que Todo Funcione

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver estado de los contenedores
docker-compose ps

# Verificar salud de la aplicación
curl http://localhost/api/health
```

## Estructura de Contenedores

El sistema despliega 3 contenedores:

1. **cardenoza-mysql**: Base de datos MySQL 8.0
2. **cardenoza-app**: Backend (Node.js) + Frontend (React compilado)
3. **cardenoza-nginx**: Reverse proxy y servidor web

## Acceso a la Aplicación

### Desarrollo/Pruebas (localhost):
```
http://localhost
```

### Producción (servidor con IP pública):
```
http://IP_DEL_SERVIDOR
http://dominio.com (si tienes dominio configurado)
```

### Credenciales por Defecto:
```
Email: admin@grupocardenoza.com
Password: admin123
```

**¡IMPORTANTE!** Cambia la contraseña del admin inmediatamente después del primer login.

## Comandos Útiles

### Ver Logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo app
docker-compose logs -f app

# Solo MySQL
docker-compose logs -f mysql

# Últimas 100 líneas
docker-compose logs --tail=100 app
```

### Reiniciar Servicios
```bash
# Reiniciar todos
docker-compose restart

# Reiniciar solo app
docker-compose restart app
```

### Detener y Eliminar
```bash
# Detener sin eliminar datos
docker-compose down

# Detener Y eliminar volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v
```

### Backup de Base de Datos
```bash
# Crear backup
./docker-deploy.sh
# Seleccionar opción 6

# O manualmente:
docker-compose exec mysql mysqldump -u root -p soat_reminders > backup.sql
```

### Restaurar Backup
```bash
# Copiar backup al contenedor
docker cp backup.sql cardenoza-mysql:/backup.sql

# Restaurar
docker-compose exec mysql mysql -u root -p soat_reminders < /backup.sql
```

### Ejecutar Migraciones
```bash
docker-compose exec app npm run db:migrate
```

### Acceder a la Shell del Contenedor
```bash
# Shell de la app
docker-compose exec app sh

# Shell de MySQL
docker-compose exec mysql mysql -u root -p
```

## Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# 1. Pull de los cambios
git pull origin master

# 2. Reconstruir imágenes
docker-compose build --no-cache

# 3. Reiniciar servicios
docker-compose up -d

# 4. Si hay nuevas migraciones
docker-compose exec app npm run db:migrate
```

O usa el script:
```bash
./docker-deploy.sh
# Seleccionar opción 7 (Reconstruir imágenes)
```

## Configuración de SSL/HTTPS (Producción)

### Con Certificado Propio:

1. Coloca tus certificados en `nginx/ssl/`:
   ```bash
   mkdir -p nginx/ssl
   cp tu-certificado.crt nginx/ssl/cert.pem
   cp tu-llave-privada.key nginx/ssl/key.pem
   ```

2. Edita `nginx/nginx.conf` y descomenta la sección HTTPS

3. Reinicia nginx:
   ```bash
   docker-compose restart nginx
   ```

### Con Let's Encrypt (Gratis):

```bash
# Instalar certbot
sudo apt-get install certbot

# Obtener certificado (reemplaza tu-dominio.com)
sudo certbot certonly --standalone -d tu-dominio.com

# Los certificados estarán en:
# /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/tu-dominio.com/privkey.pem

# Copiarlos a nginx/ssl/
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/key.pem

# Dar permisos
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem
```

## Monitoreo y Mantenimiento

### Espacio en Disco
```bash
# Ver uso de Docker
docker system df

# Limpiar recursos no usados
docker system prune -a
```

### Recursos de Contenedores
```bash
# Ver uso de CPU y memoria
docker stats
```

### Logs Rotativos
Los logs de nginx se guardan en el volumen `nginx_logs`. Para evitar que crezcan mucho:

```bash
# Limpiar logs antiguos (cuidado)
docker-compose exec nginx sh -c "truncate -s 0 /var/log/nginx/*.log"
```

## Firewall (UFW)

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Si necesitas acceso directo a MySQL (no recomendado)
sudo ufw allow 3306/tcp

# Activar firewall
sudo ufw enable
```

## Troubleshooting

### La app no inicia:
```bash
# Ver logs detallados
docker-compose logs app

# Verificar que MySQL esté listo
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

### No puedo conectar WhatsApp:
El contenedor necesita acceso a la UI para escanear el QR. Asegúrate de:
1. Acceder desde un navegador
2. Ir a la página de WhatsApp
3. Hacer clic en "Conectar WhatsApp"
4. Escanear el QR con tu teléfono

### Error de permisos:
```bash
# Dar permisos al directorio de WhatsApp
docker-compose exec app chown -R node:node /app/backend/.wwebjs_auth
```

### Reinicio completo (último recurso):
```bash
# Detener todo
docker-compose down -v

# Eliminar imágenes
docker rmi $(docker images -q cardenoza*)

# Volver a desplegar
./docker-deploy.sh
```

## Rendimiento y Escalabilidad

### Para servidores de producción grandes:

Edita `docker-compose.yml` y añade límites de recursos:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Base de datos en servidor separado:

Si tienes MySQL en otro servidor, simplemente:

1. Comenta el servicio `mysql` en `docker-compose.yml`
2. Cambia `DB_HOST` en `.env` a la IP del servidor MySQL
3. Asegúrate de que el puerto 3306 esté accesible

## Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Consulta esta documentación
4. Abre un issue en GitHub

---

**Grupo Cardeñoza** - Sistema de Recordatorios de Tecnomecánica
