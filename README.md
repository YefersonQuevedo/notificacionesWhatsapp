# ANÁLISIS DETALLADO - Sistema de Gestión para CDA Cardeñoza

## 1. CONTEXTO DEL NEGOCIO

### Tipo de negocio
**Centros de Diagnóstico Automotor (CDA) - Revisiones técnico-mecánicas**

- Operan múltiples sedes en diferentes ciudades (Girardot, Fusagasugá, Santa Marta)
- Diferentes tipos de servicios: motos, carros, camiones
- Manejan aproximadamente 8-15 empresas diferentes
- Tienen diferentes marcas: CertiMotos, Cedías, Escuelas de conducción

### Problema actual

- Todo se maneja en Excel con formatos diferentes por cada sede
- No hay estandarización de reportes
- Errores humanos en ingreso de datos (nombres mal escritos, inconsistencias)
- No tienen base de datos consolidada
- Pérdida de información
- Imposibilidad de ver reportes en tiempo real

---

## 2. REQUERIMIENTOS FUNCIONALES PRINCIPALES

### A. Sistema de Gestión Centralizado

#### 1. Dashboard administrativo en tiempo real
- Ver estado de todas las sedes simultáneamente
- Visualizar ventas del día (ej: "hoy ingresaron 80 personas")
- Ver utilidades en tiempo real (ej: "se ganó 20 millones de utilidad")
- Métricas por sede individual

#### 2. Gestión de múltiples sedes y empresas
- Cada empresa debe tener su propia "parte" o sección
- Diferentes tipos de CDA: motos, carros, camiones
- Diferentes ubicaciones geográficas

#### 3. Sistema de usuarios con roles y permisos
- **Administrador/Gerente**: Ver todas las sedes, reportes completos, exportar datos
- **Secretaria/Recepcionista**: Solo ver y capturar información de su sede específica
- Las secretarias NO deben ver información de otras sedes

### B. Gestión de Tarifas y Comisiones
- Tarifas fijas por tipo de vehículo y año
- Sistema de comisiones para referidos (20-50 motos semanales)
- Control de costos ocultos

### C. Sistema de Reportes

#### 1. Exportación a Excel
- Formato estandarizado para todas las sedes
- Descarga por sede
- Descarga consolidada

#### 2. Reportes automáticos
- Reporte diario al final del día
- Detalles de transacciones
- Historial por fechas

### D. Notificaciones WhatsApp Automatizadas

#### 1. Reportes periódicos cada 2 horas
- Envío automático a administradores
- Formato: "CertiMotos: 47 tecnomecánicas, $X millones"
- Resumen de todas las sedes

#### 2. Recordatorios de vencimiento
- Al registrar una tecnomecánica, programar recordatorio automático en 1 año
- Enviar WhatsApp al cliente cuando se acerque el vencimiento

### E. Chatbot de Atención
- Recibir consultas de clientes
- Preguntar ubicación del cliente
- Mostrar sedes disponibles según ciudad
- Preguntar tipo de vehículo
- Mostrar precios según el servicio
- **Capturar datos del cliente**: nombre, teléfono (lead generation)

### F. Base de Datos de Clientes
- Registro automático al hacer tecnomecánica
- Almacenar: nombre, teléfono, placa, tipo vehículo, fecha de tecnomecánica
- Evitar duplicados y errores de escritura
- Exportable
- Sistema de recordatorios automáticos

### G. Control de Reversiones
- Poder corregir/revertir errores en el sistema
- Auditoría de cambios

---

## 3. CARACTERÍSTICAS TÉCNICAS NECESARIAS

### A. Arquitectura del Sistema

**Sistema Web en la Nube (No local)**
- El cliente expresó preocupación por pérdida de datos si el computador se daña
- Necesidad de acceso desde múltiples ubicaciones
- Debe ser accesible 24/7

### B. Módulos del Sistema

#### 1. Sistema de Autenticación Multi-tenant
```
- Multi-empresa (cada empresa es independiente)
- Multi-sede (cada sede pertenece a una empresa)
- Roles: Super Admin, Admin Empresa, Admin Sede, Secretaria
- Permisos granulares por sede
```

#### 2. Módulo de Registro de Servicios
```
- Captura de datos del cliente
- Selección de tipo de servicio
- Cálculo automático de precio
- Aplicación de comisiones
- Registro de placa del vehículo
- Generación de número de control
```

#### 3. Módulo de Dashboard Analytics
```
- Vistas en tiempo real
- Filtros por: fecha, sede, tipo de servicio
- Métricas: ingresos, cantidad, utilidades, comisiones
- Gráficas y estadísticas
- Comparativas entre sedes
```

#### 4. Módulo de Exportación
```
- Plantillas estandarizadas de Excel
- Exportación por rangos de fecha
- Exportación por sede
- Exportación consolidada
```

#### 5. Módulo de WhatsApp Business API
```
- Integración con WhatsApp Business API
- Chatbot conversacional
- Sistema de templates para reportes
- Programación de mensajes automáticos
- Recordatorios programados
```

#### 6. Módulo de Base de Datos de Clientes (CRM)
```
- Registro automático de clientes
- Búsqueda inteligente (evita duplicados)
- Historial de servicios por cliente
- Gestión de recordatorios
- Exportación de base de datos
```

#### 7. Módulo de Auditoría
```
- Log de todas las transacciones
- Historial de cambios
- Opción de reversión
- Trazabilidad completa
```

### C. Integración con Facturación

**Nota importante del cliente:**
- Actualmente usan un sistema llamado "PerSei" para facturación electrónica
- La facturación se hace al final del día
- Hay problemas de comunicación con el proveedor actual
- **Solución propuesta:** Permitir sincronización posterior o integración API si PerSei lo permite

---

## 4. PLAN DE IMPLEMENTACIÓN Y TECNOLOGÍAS SUGERIDAS

### A. Stack Tecnológico Recomendado

#### Frontend
```
- Next.js 14+ con TypeScript
- TailwindCSS para UI
- Shadcn/ui para componentes
- Recharts o Chart.js para gráficas
- React Query para manejo de estado
- Zustand para estado global
```

#### Backend
```
- Node.js con Express o Next.js API Routes
- Prisma ORM para base de datos
- PostgreSQL como base de datos principal
- Redis para caché y sesiones
```

#### Integraciones
```
- WhatsApp Business API (oficial de Meta)
- Alternativa: Baileys (biblioteca Node.js para WhatsApp)
- ExcelJS para generación de reportes Excel
- Cron jobs para tareas programadas
```

#### Infraestructura
```
- Vercel o AWS para hosting
- Supabase o AWS RDS para base de datos
- Cloudflare para CDN y seguridad
- Backups automáticos diarios
```

### B. Modelo de Datos Principal

```sql
Empresas
├── id
├── nombre
├── tipo (CDA_MOTOS, CDA_CARROS, ESCUELA, etc.)
└── configuracion

Sedes
├── id
├── empresa_id
├── ciudad
├── direccion
├── telefono
└── activa

Usuarios
├── id
├── nombre
├── email
├── rol (SUPER_ADMIN, ADMIN, SECRETARIA)
├── empresa_id
└── sede_id

Servicios
├── id
├── sede_id
├── tipo_vehiculo
├── cliente_id
├── placa
├── precio
├── comision
├── fecha_servicio
├── fecha_vencimiento
└── usuario_registro_id

Clientes
├── id
├── nombre
├── telefono
├── email
└── fecha_registro

Tarifas
├── id
├── empresa_id
├── tipo_vehiculo
├── año_vehiculo
├── precio
└── vigencia

Comisiones
├── id
├── referidor
├── porcentaje
└── sede_id
```

### C. Fases de Desarrollo Sugeridas

#### FASE 1 - MVP (4-6 semanas)
- Sistema de autenticación multi-tenant
- Registro básico de servicios
- Dashboard con métricas en tiempo real
- Exportación a Excel
- Gestión de usuarios y permisos

#### FASE 2 - WhatsApp & Automatización (3-4 semanas)
- Integración WhatsApp Business API
- Chatbot de atención
- Reportes automáticos cada 2 horas
- Sistema de recordatorios

#### FASE 3 - CRM & Analytics (3-4 semanas)
- Base de datos de clientes completa
- Búsqueda inteligente y deduplicación
- Gráficas y reportes avanzados
- Auditoría y reversiones

#### FASE 4 - Integraciones (2-3 semanas)
- Integración con sistema de facturación (si es posible)
- Optimizaciones de rendimiento
- Capacitaciones
- Documentación

### D. Pantallas Principales

#### 1. Login
- Multi-tenant (selección de empresa)
- Autenticación segura

#### 2. Dashboard Principal
```
┌─────────────────────────────────────────┐
│ Logo Cardeñoza      Usuario: Admin ▼    │
├─────────────────────────────────────────┤
│ Resumen Hoy - 24 Oct 2025               │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │  Total   │ │ Ingresos │ │Utilidades││
│ │   134    │ │ $45.2M   │ │ $18.5M   ││
│ └──────────┘ └──────────┘ └──────────┘│
│                                         │
│ Por Sede:                               │
│ ┌─────────────────────────────────────┐│
│ │ CertiMotos Girardot    47  $8.2M   ││
│ │ CDA Fusagasugá         28  $6.5M   ││
│ │ Escuela Girardot       15  $2.1M   ││
│ └─────────────────────────────────────┘│
│                                         │
│ [Ver Detalles] [Exportar Excel]        │
└─────────────────────────────────────────┘
```

#### 3. Registro de Servicio
- Formulario simple y rápido
- Autocompletado de clientes existentes
- Cálculo automático de precios
- Captura de placa

#### 4. Panel de Reportes
- Filtros por fecha, sede, tipo
- Gráficas de tendencias
- Comparativas
- Exportación personalizada

#### 5. Gestión de Clientes
- Lista de clientes
- Búsqueda avanzada
- Historial de servicios
- Próximos vencimientos

#### 6. Configuración
- Gestión de sedes
- Gestión de tarifas
- Configuración de comisiones
- Usuarios y permisos
- Configuración WhatsApp

---

## 5. CONSIDERACIONES IMPORTANTES

### A. Puntos Críticos Mencionados

1. **Seguridad de Datos**: El cliente está preocupado por pérdida de información
   - Solución: sistema en la nube con backups automáticos

2. **Privacidad entre Sedes**: Las secretarias NO deben ver información de otras sedes
   - Solución: permisos estrictos por sede

3. **Estandarización**: Acabar con los diferentes formatos de Excel
   - Solución: templates únicos y exportación estandarizada

4. **Error Humano**: Evitar nombres mal escritos, duplicados
   - Solución: autocompletado y validación de datos

5. **Tiempo Real**: El papá del cliente necesita ver estado actual
   - Solución: dashboard en vivo

6. **WhatsApp Automático**: Reportes cada 2 horas y recordatorios
   - Solución: cron jobs + WhatsApp API

### B. Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Resistencia al cambio del personal | Capacitación intensiva + UI muy simple |
| Costos de WhatsApp Business API | Evaluar alternativas como Baileys o Twilio |
| Integración con PerSei | Hacer el sistema independiente, integración opcional |
| Pérdida de conectividad | Sistema offline-first con sincronización |
| Escalabilidad | Arquitectura en la nube escalable desde el inicio |

### C. Estimación de Costos Operacionales Mensuales

```
- Hosting (Vercel Pro): $20 USD
- Base de datos (Supabase): $25 USD
- WhatsApp Business API: $50-200 USD (según volumen)
- Backups y almacenamiento: $10 USD
- Total estimado: $105-255 USD/mes
```

### D. Valor Agregado del Sistema

1. **Ahorro de tiempo**: Elimina captura manual en Excel (estimado 2-3 horas diarias por sede)
2. **Reducción de errores**: Validación automática de datos
3. **Visibilidad**: Decisiones basadas en datos en tiempo real
4. **Marketing**: Base de datos para recordatorios aumenta retención de clientes
5. **Escalabilidad**: Fácil agregar nuevas sedes sin complejidad adicional
6. **Profesionalización**: Imagen más seria ante clientes con QR y chatbot

---

## RESUMEN EJECUTIVO

### Lo que el cliente quiere
Un sistema web centralizado en la nube que reemplace Excel, permita ver en tiempo real el estado de todas sus sedes de CDA, envíe reportes automáticos por WhatsApp, tenga un chatbot para atención al cliente, maneje base de datos de clientes con recordatorios automáticos, y estandarice todos los procesos entre sus múltiples empresas y sedes.

### Cómo llevarlo a cabo

1. Desarrollar una aplicación web multi-tenant con Next.js
2. Base de datos PostgreSQL con modelo relacional multi-empresa
3. Sistema de roles y permisos estrictos por sede
4. Dashboard en tiempo real con métricas consolidadas
5. Integración WhatsApp Business API para chatbot y notificaciones
6. Sistema de exportación estandarizada a Excel
7. CRM integrado con recordatorios automáticos
8. Despliegue en la nube con backups automáticos

### Tiempos y Costos

- **Tiempo estimado:** 12-16 semanas para versión completa
- **Inversión inicial desarrollo:** Variable según equipo
- **Costos operacionales:** ~$150 USD/mes

### Próximos pasos recomendados

1. Validar requerimientos con el cliente
2. Crear mockups/prototipos de las pantallas principales
3. Definir prioridades (empezar con MVP)
4. Establecer cronograma y presupuesto
5. Iniciar desarrollo por fases

---

## NOTAS ADICIONALES

### Funcionalidades Clave del Chatbot WhatsApp

El chatbot debe seguir este flujo conversacional:

```
Bot: ¡Hola! Bienvenido a Cardeñoza. ¿En qué ciudad te encuentras?
Usuario: Fusagasugá
Bot: Perfecto. ¿Qué tipo de vehículo necesitas revisar?
     1. Moto
     2. Carro
     3. Camión
Usuario: 1
Bot: En Fusagasugá contamos con:
     - CertiMotos Fusagasugá
     Dirección: [dirección]
     Tecnomecánica para moto: $234,000 - $236,000

     Para agendar tu cita, por favor comparte:
     - Tu nombre completo
     - Número de teléfono
Usuario: [datos]
Bot: ¡Gracias! Hemos registrado tu información.
     Te contactaremos pronto para confirmar tu cita.
```

### Reportes WhatsApp Automáticos

**Formato de mensaje cada 2 horas:**
```
📊 Reporte Cardeñoza - 24 Oct 2025, 4:00 PM

CertiMotos Girardot: 47 tecnomecánicas - $8.2M
CDA Fusagasugá: 28 tecnomecánicas - $6.5M
Escuela Girardot: 15 servicios - $2.1M
CDA Santa Marta: 32 tecnomecánicas - $7.8M

Total del día: 122 servicios - $24.6M
```

**Formato de recordatorio a clientes:**
```
🔔 Recordatorio Cardeñoza

Hola [Nombre],

Tu tecnomecánica del vehículo [Placa] vence el [Fecha].

¡Agenda tu cita ahora!
📍 [Sede más cercana]
📱 [Teléfono]
```

---

**Fecha de análisis:** 24 de Octubre de 2025
**Analista:** Claude Code
**Versión:** 1.0



nombre, revisar bien por la fecha, la placa, 
sumar 1 año y calcular bien -30 dias -15 dias -5 

en base da deatos cierre 