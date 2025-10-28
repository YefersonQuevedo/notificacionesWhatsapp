# Inicio Rápido - SOAT Reminders

## Instalación Express (5 minutos)

### 1. Instalar dependencias

```bash
npm run install:all
```

### 2. Configurar `.env`

```bash
cp .env.example .env
nano .env
```

Edita estos valores:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=soat_reminders
JWT_SECRET=cambia-esto-por-algo-super-seguro-y-largo
```

### 3. Crear base de datos

```bash
# Entrar a MySQL
mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
npm run db:seed
```

### 5. Iniciar en desarrollo

```bash
npm run dev
```

¡Listo! Abre http://localhost:5173

**Credenciales demo:**
- Email: `admin@demo.com`
- Password: `admin123`

---

## Siguiente paso: Conectar WhatsApp

1. Ir a la sección **WhatsApp** en el menú
2. Clic en **Conectar**
3. Ver el código QR en la terminal del servidor
4. Escanear con WhatsApp

---

## Siguiente paso: Importar CSV

1. Ir a **Importar CSV**
2. Arrastrar el archivo `consolidado2025.csv`
3. Clic en **Importar Ahora**
4. Ver el dashboard actualizado

---

## Estructura de archivos importante

```
backend/
├── server.js          ← Servidor principal
├── models/            ← Modelos de BD
├── routes/            ← Endpoints API
├── services/          ← WhatsApp y Cron
└── utils/             ← CSV parser y recordatorios

frontend/
├── src/
│   ├── pages/         ← Páginas principales
│   ├── components/    ← Componentes reutilizables
│   └── services/      ← Cliente API
```

---

## Comandos útiles

```bash
# Desarrollo
npm run dev              # Backend + Frontend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Base de datos
npm run db:migrate       # Aplicar migraciones
npm run db:seed          # Cargar datos demo
npm run db:migrate:undo  # Revertir última migración

# Producción
npm run build            # Build frontend
npm start                # Iniciar producción
```

---

## Troubleshooting

### Error de conexión MySQL
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# O en Windows:
net start MySQL80
```

### Frontend no carga
```bash
cd frontend
npm install
npm run dev
```

### WhatsApp no conecta
```bash
# Eliminar sesión anterior
rm -rf whatsapp_sessions/*

# Reiniciar servidor
npm run dev:backend
```

---

## Funcionalidades completadas ✅

- ✅ Login/Registro multiempresa
- ✅ Dashboard con métricas en tiempo real
- ✅ CRUD completo de Clientes
- ✅ CRUD completo de Vehículos
- ✅ Importador CSV con validación
- ✅ Panel de control WhatsApp
- ✅ Sistema de recordatorios automático
- ✅ Cálculo de fechas con años bisiestos
- ✅ Detección de duplicados
- ✅ Tabla de datos raw para informes

---

## Próximas mejoras opcionales

- [ ] Gráficas de estadísticas
- [ ] Exportación a Excel
- [ ] Historial de mensajes enviados
- [ ] Panel de notificaciones en la UI
- [ ] Filtros avanzados en tablas
- [ ] Reportes personalizados

---

**¿Necesitas ayuda?** Revisa el archivo [README_SOAT.md](README_SOAT.md) para documentación completa.
