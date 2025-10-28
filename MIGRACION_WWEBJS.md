# Migración a WhatsApp Web JS (WWebJS)

## ✅ Cambios Realizados

### 1. Biblioteca WhatsApp
- ❌ **Antes:** `@whiskeysockets/baileys` (inestable, muchos errores de timeout)
- ✅ **Ahora:** `whatsapp-web.js` (más estable, basada en Puppeteer)

### 2. Ventajas de WWebJS

**Más estable:**
- No más errores 408, 401, 405 constantes
- Conexión más confiable
- Menos probabilidad de bloqueo por WhatsApp

**Mejor manejo de QR:**
- QR permanece visible en web hasta que conectes
- No desaparece por errores de conexión
- Generación más rápida y confiable

**Características adicionales:**
- Mejor soporte para multimedia
- Eventos más claros y detallados
- Sesiones más estables

### 3. Archivos Modificados

1. **backend/services/whatsapp.service.js**
   - Reescrito completamente para WWebJS
   - Eventos más claros: `qr`, `ready`, `authenticated`, `disconnected`
   - Mejor manejo de errores

2. **backend/routes/whatsapp.routes.js**
   - Actualizado `isConnected` → `isReady`
   - Endpoints siguen siendo los mismos

3. **Sesiones**
   - Las sesiones antiguas de Baileys fueron eliminadas
   - WWebJS usa LocalAuth con el mismo directorio `whatsapp_sessions`

### 4. Dependencias

**Instaladas:**
- `whatsapp-web.js` - Cliente principal

**Desinstaladas:**
- `@whiskeysockets/baileys`
- `@hapi/boom`
- `pino`

**Mantenidas:**
- `qrcode-terminal` - Para mostrar QR en consola
- `qrcode` - Para generar QR para la web

## 🚀 Cómo Usar

### Iniciar el Sistema

1. **Reiniciar el backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Abrir la interfaz web:**
   - Ve a http://localhost:5173
   - Inicia sesión
   - Ve a la sección "WhatsApp"

3. **Conectar WhatsApp:**
   - Haz clic en "Conectar"
   - Espera 5-10 segundos (la primera vez tarda más porque descarga Chromium)
   - El QR aparecerá en:
     - ✅ La consola del backend (grande y visible)
     - ✅ La interfaz web (como imagen)
   - Escanea con tu WhatsApp
   - Espera a que diga "WhatsApp Web está listo!"

### Endpoints Disponibles

Todos los endpoints anteriores siguen funcionando:

- `GET /api/whatsapp/estado` - Ver estado y QR
- `POST /api/whatsapp/conectar` - Iniciar conexión
- `POST /api/whatsapp/desconectar` - Desconectar
- `POST /api/whatsapp/limpiar-sesion` - Limpiar sesión
- `POST /api/whatsapp/test` - Enviar mensaje de prueba
- `POST /api/whatsapp/enviar-notificaciones` - Envío manual

## 🔧 Solución de Problemas

### Si el QR no aparece:
1. Espera 10-15 segundos (primera vez tarda más)
2. Revisa la consola del backend para ver logs
3. Si dice "downloading Chromium", espera a que termine

### Si hay error de Chromium:
- WWebJS descarga automáticamente Chromium
- En Windows puede tardar 1-2 minutos la primera vez
- Requiere conexión a internet

### Si la conexión falla:
1. Limpia la sesión: POST `/api/whatsapp/limpiar-sesion`
2. Intenta conectar nuevamente
3. Verifica que tu teléfono tenga internet

## 📊 Comparación

| Característica | Baileys | WWebJS |
|---------------|---------|--------|
| Estabilidad | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| QR visible | ❌ Se oculta | ✅ Permanece |
| Errores timeout | ✅ Frecuentes | ❌ Raros |
| Sesiones | ⭐⭐ | ⭐⭐⭐⭐ |
| Uso de recursos | Bajo | Medio (usa Chromium) |
| Velocidad inicial | Rápida | Lenta (1ra vez) |

## ⚠️ Notas Importantes

1. **Primera ejecución:** Tarda más porque descarga Chromium (~100MB)
2. **Recursos:** Usa más RAM que Baileys (por Chromium en modo headless)
3. **Compatibilidad:** 100% compatible con la API actual
4. **Sesiones:** No son compatibles con Baileys - debes reconectar
