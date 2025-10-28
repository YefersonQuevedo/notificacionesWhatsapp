# SOAT Reminders - Sistema de Recordatorios Inteligente

Sistema multiempresa para gestión automática de recordatorios de vencimiento de SOAT vía WhatsApp.

## Características

- **Multi-empresa**: Soporte para múltiples empresas en la misma instancia
- **Importación CSV**: Carga masiva de datos con detección de duplicados
- **Recordatorios automáticos**: 30, 15, 7, 5 y 1 día antes del vencimiento
- **WhatsApp no oficial**: Integración con Baileys (sin necesidad de API oficial)
- **Cálculo inteligente de fechas**: Considera años bisiestos automáticamente
- **Dashboard moderno**: Interfaz React con TailwindCSS
- **Base de datos completa**: Guarda datos raw para futuros informes
- **API REST**: Backend escalable con autenticación JWT

## Stack Tecnológico

### Backend
- Node.js 18+
- Express.js
- Sequelize ORM
- MySQL 8.0
- Baileys (WhatsApp)
- JWT Authentication
- Node-cron (tareas programadas)

### Frontend
- React 18
- Vite
- TailwindCSS
- Zustand (estado global)
- React Router
- Axios

## Instalación

### Prerrequisitos

```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL 8.0
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation

# Instalar PM2 (opcional, para producción)
sudo npm install -g pm2
```

### Paso 1: Clonar y configurar

```bash
# Ir al directorio
cd /var/www/soat-reminders

# Instalar dependencias
npm run install:all
```

### Paso 2: Configurar base de datos

```bash
# Crear base de datos MySQL
sudo mysql -u root -p

CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'soat_user'@'localhost' IDENTIFIED BY 'tu_password_segura';
GRANT ALL PRIVILEGES ON soat_reminders.* TO 'soat_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Paso 3: Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus datos
nano .env
```

Contenido del `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=soat_reminders
DB_USER=soat_user
DB_PASSWORD=tu_password_segura

# JWT
JWT_SECRET=genera-un-string-aleatorio-muy-largo-y-seguro

# Puerto
PORT=3000

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp_sessions

# Entorno
NODE_ENV=production
```

### Paso 4: Ejecutar migraciones

```bash
# Ejecutar migraciones (crea todas las tablas)
npm run db:migrate

# Ejecutar seeders (crea empresa y usuario demo)
npm run db:seed
```

Credenciales demo:
- Email: `admin@demo.com`
- Password: `admin123`

### Paso 5: Build del frontend

```bash
cd frontend
npm run build
cd ..
```

### Paso 6: Iniciar servidor

#### Desarrollo

```bash
npm run dev
```

#### Producción con PM2

```bash
pm2 start backend/server.js --name soat-reminders
pm2 save
pm2 startup
```

#### Producción con systemd

```bash
# Copiar archivo de servicio
sudo cp soat-reminders.service /etc/systemd/system/

# Editar rutas si es necesario
sudo nano /etc/systemd/system/soat-reminders.service

# Habilitar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable soat-reminders
sudo systemctl start soat-reminders

# Ver estado
sudo systemctl status soat-reminders

# Ver logs
sudo journalctl -u soat-reminders -f
```

## Uso

### 1. Primer inicio de sesión

Accede a `http://tu-servidor:3000` y usa las credenciales demo o crea una cuenta nueva.

### 2. Conectar WhatsApp

1. Ve a la sección **WhatsApp** en el menú
2. Haz clic en **Conectar**
3. Escanea el código QR con tu WhatsApp
4. Espera confirmación de conexión

### 3. Importar datos CSV

1. Ve a **Importar CSV**
2. Arrastra o selecciona tu archivo CSV
3. El sistema automáticamente:
   - Crea clientes nuevos
   - Registra vehículos
   - Calcula fechas de vencimiento
   - Crea recordatorios
   - Guarda datos raw para informes

**Formato CSV requerido:**

```csv
ITEM;FACT;TIPO DOC;NUM. DOC;TIPO DE CLIENTE;TELEFONOS;PLACA ;...
2/01/2025;;CC;11317228;FREDDY CARRASCO ARIAS;3138983872;IOB79B;...
```

Columnas importantes:
- `ITEM`: Fecha de compra (DD/MM/YYYY)
- `NUM. DOC`: Cédula del cliente
- `TIPO DE CLIENTE`: Nombre del cliente
- `PLACA`: Placa del vehículo
- `TELEFONOS`: Teléfono con código país (ej: 573001234567)

### 4. Ver dashboard

El dashboard muestra:
- Total de clientes
- Total de vehículos
- Vehículos próximos a vencer (30 días)
- Urgencia por colores

### 5. Recordatorios automáticos

El sistema envía mensajes automáticamente:
- **Lunes a Viernes, 8am-6pm cada hora**: Envía recordatorios pendientes
- **Diario a las 7am**: Verifica y crea nuevos recordatorios

Ejemplo de mensaje:

```
⚠️ Hola FREDDY CARRASCO ARIAS!

Le recordamos que el SOAT de su vehículo placa IOB79B vence en 7 días.

📅 Fecha de vencimiento: 02/01/2026

Por favor renueve su SOAT a tiempo para evitar multas e inconvenientes.

¿Necesita ayuda para renovarlo? Responda este mensaje.
```

## Comandos útiles

```bash
# Desarrollo
npm run dev                    # Iniciar frontend y backend
npm run dev:backend            # Solo backend
npm run dev:frontend           # Solo frontend

# Base de datos
npm run db:migrate             # Ejecutar migraciones
npm run db:migrate:undo        # Revertir última migración
npm run db:seed                # Ejecutar seeders
npm run db:reset               # Reset completo (cuidado!)

# Producción
npm run build                  # Build del frontend
npm start                      # Iniciar en producción
```

## Arquitectura Multi-empresa

El sistema está diseñado para soportar múltiples empresas:

1. Cada empresa tiene su propio WhatsApp conectado
2. Los datos están aislados por `empresa_id`
3. Los usuarios solo ven datos de su empresa
4. Puedes vender el sistema a múltiples clientes

### Agregar nueva empresa

Opción 1: Por interfaz (ruta `/registro`)

Opción 2: Por SQL

```sql
INSERT INTO empresas (nombre, ruc, telefono_whatsapp, activo)
VALUES ('Nueva Empresa SAS', '900123456', '573001234567', 1);

-- Crear usuario admin para esa empresa
INSERT INTO usuarios (empresa_id, email, password_hash, nombre, rol, activo)
VALUES (2, 'admin@nueva-empresa.com', '$2b$10$...', 'Admin', 'admin', 1);
```

## Migraciones (sin SQL manual)

Para agregar nuevas columnas o tablas:

```bash
# Crear nueva migración
npx sequelize-cli migration:generate --name add-campo-ejemplo

# Editar archivo en backend/migrations/

# Ejecutar
npm run db:migrate
```

Ejemplo de migración:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('vehiculos', 'observaciones', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('vehiculos', 'observaciones');
  }
};
```

## Estructura del Proyecto

```
soat-reminders/
├── backend/
│   ├── config/
│   │   └── database.js           # Configuración de Sequelize
│   ├── models/
│   │   ├── index.js              # Conexión Sequelize
│   │   ├── Empresa.js            # Modelo Empresa
│   │   ├── Usuario.js            # Modelo Usuario
│   │   ├── Cliente.js            # Modelo Cliente
│   │   ├── Vehiculo.js           # Modelo Vehículo
│   │   ├── Notificacion.js       # Modelo Notificación
│   │   ├── DatoBruto.js          # Datos CSV completos
│   │   └── associations.js       # Relaciones entre modelos
│   ├── migrations/
│   │   └── 20250128000001-create-all-tables.cjs
│   ├── seeders/
│   │   └── 20250128000001-demo-data.cjs
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── routes/
│   │   ├── auth.routes.js        # Login/Registro
│   │   ├── clientes.routes.js    # CRUD Clientes
│   │   ├── vehiculos.routes.js   # CRUD Vehículos
│   │   ├── import.routes.js      # Importar CSV
│   │   └── whatsapp.routes.js    # Control WhatsApp
│   ├── services/
│   │   ├── whatsapp.service.js   # Integración Baileys
│   │   └── cron.service.js       # Tareas programadas
│   ├── utils/
│   │   ├── csvParser.js          # Parser CSV
│   │   └── recordatorios.js      # Lógica de recordatorios
│   └── server.js                 # Servidor principal
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clientes.jsx
│   │   │   ├── Vehiculos.jsx
│   │   │   ├── Importar.jsx
│   │   │   └── WhatsApp.jsx
│   │   ├── services/
│   │   │   └── api.js            # Cliente Axios
│   │   ├── store/
│   │   │   └── authStore.js      # Zustand store
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── package.json
├── .env.example
├── .sequelizerc
└── soat-reminders.service
```

## Nginx (Opcional)

Si quieres usar Nginx como proxy:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### WhatsApp no conecta

```bash
# Eliminar sesión y volver a intentar
rm -rf whatsapp_sessions/*
sudo systemctl restart soat-reminders
```

### Error de base de datos

```bash
# Ver logs
sudo journalctl -u soat-reminders -f

# Verificar conexión MySQL
mysql -u soat_user -p -e "SHOW DATABASES;"
```

### Frontend no carga

```bash
# Rebuild frontend
cd frontend
npm run build
cd ..
sudo systemctl restart soat-reminders
```

## Futuras mejoras

- [ ] Implementar CRUD completo de Clientes y Vehículos en frontend
- [ ] Panel de WhatsApp con visualización de QR en tiempo real
- [ ] Reportes e informes desde datos_brutos
- [ ] Notificaciones por email adicionales
- [ ] Soporte para múltiples tipos de seguros
- [ ] Exportación de datos a Excel
- [ ] Gráficas y estadísticas avanzadas

## Seguridad

- Cambiar `JWT_SECRET` a algo muy seguro
- Usar contraseñas fuertes para MySQL
- Configurar firewall: `sudo ufw allow 3000/tcp`
- En producción, usar HTTPS con Let's Encrypt
- Hacer backups regulares de la base de datos

## Backup

```bash
# Backup de base de datos
mysqldump -u soat_user -p soat_reminders > backup_$(date +%Y%m%d).sql

# Backup de sesiones WhatsApp
tar -czf whatsapp_backup.tar.gz whatsapp_sessions/

# Automatizar con cron
0 2 * * * mysqldump -u soat_user -p'password' soat_reminders > /backups/soat_$(date +\%Y\%m\%d).sql
```

## Licencia

Propietario. Desarrollado para uso comercial.
