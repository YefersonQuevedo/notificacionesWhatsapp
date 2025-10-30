import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

// Importar modelos y configuración
import { sequelize, testConnection } from './models/index.js';
import './models/associations.js'; // Cargar asociaciones

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import importRoutes from './routes/import.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import datosBrutosRoutes from './routes/datosBrutos.routes.js';
import mensajeTemplatesRoutes from './routes/mensajeTemplates.routes.js';

// Importar servicios
import whatsappService from './services/whatsapp.service.js';
import cronService from './services/cron.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/import', importRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/datos-brutos', datosBrutosRoutes);
app.use('/api/mensaje-templates', mensajeTemplatesRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    whatsapp: whatsappService.obtenerEstado()
  });
});

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    console.log('\n=== INICIANDO SISTEMA DE RECORDATORIOS SOAT ===\n');

    // 1. Conectar a la base de datos
    console.log('1. Conectando a MySQL...');
    await testConnection();

    // 2. Sincronizar modelos (solo en desarrollo, en producción usa migraciones)
    if (process.env.NODE_ENV === 'development') {
      console.log('2. Sincronizando modelos (desarrollo)...');
      await sequelize.sync({ alter: false });
      console.log('✓ Modelos sincronizados');
    } else {
      console.log('2. En producción, ejecuta: npm run db:migrate');
    }

    // 3. Iniciar servidor HTTP
    console.log('3. Iniciando servidor HTTP...');
    app.listen(PORT, () => {
      console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
    });

    // 4. Iniciar servicios cron
    console.log('4. Iniciando servicios cron...');
    cronService.iniciar();

    // 5. Conectar WhatsApp (opcional, comentar si no quieres autoconectar)
    // console.log('5. Conectando WhatsApp...');
    // await whatsappService.iniciar();

    console.log('\n=== SISTEMA INICIADO CORRECTAMENTE ===\n');
    console.log('Endpoints disponibles:');
    console.log('  POST   /api/auth/login');
    console.log('  POST   /api/auth/registro');
    console.log('  GET    /api/clientes');
    console.log('  POST   /api/clientes');
    console.log('  GET    /api/vehiculos');
    console.log('  POST   /api/vehiculos');
    console.log('  POST   /api/import/csv');
    console.log('  GET    /api/whatsapp/estado');
    console.log('  POST   /api/whatsapp/conectar');
    console.log('  GET    /api/health');
    console.log('');

  } catch (error) {
    console.error('✗ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n\nCerrando servidor...');

  cronService.detener();
  await whatsappService.desconectar();
  await sequelize.close();

  console.log('✓ Servidor cerrado correctamente');
  process.exit(0);
});

// Iniciar
iniciarServidor();
