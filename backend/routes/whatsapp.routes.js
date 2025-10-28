import express from 'express';
import { verificarToken, verificarEmpresa, verificarRol } from '../middleware/auth.js';
import whatsappService from '../services/whatsapp.service.js';
import cronService from '../services/cron.service.js';

const router = express.Router();

router.use(verificarToken);

// Obtener estado de WhatsApp
router.get('/estado', verificarEmpresa, async (req, res) => {
  try {
    const estado = whatsappService.obtenerEstado();
    res.json(estado);
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({ error: 'Error obteniendo estado' });
  }
});

// Conectar WhatsApp (genera QR)
router.post('/conectar', verificarEmpresa, verificarRol('admin'), async (req, res) => {
  try {
    console.log(`\n🔌 Solicitud de conexión WhatsApp de usuario: ${req.usuario.email} (empresa: ${req.usuario.empresa_id})`);

    if (whatsappService.isReady) {
      console.log('⚠️  WhatsApp ya está conectado');
      return res.json({
        message: 'WhatsApp ya está conectado',
        conectado: true
      });
    }

    // Iniciar conexión (async, no esperar)
    console.log('🚀 Iniciando proceso de conexión...');
    whatsappService.iniciar(req.usuario.empresa_id).catch(err => {
      console.error('❌ Error iniciando WhatsApp:', err);
    });

    res.json({
      message: 'Conexión iniciada. El código QR se generará en unos segundos.',
      conectado: false,
      info: 'Consulta /api/whatsapp/estado cada 5 segundos para obtener el QR'
    });
  } catch (error) {
    console.error('❌ Error conectando WhatsApp:', error);
    res.status(500).json({
      error: 'Error conectando WhatsApp',
      detalles: error.message
    });
  }
});

// Desconectar WhatsApp
router.post('/desconectar', verificarEmpresa, verificarRol('admin'), async (req, res) => {
  try {
    await whatsappService.desconectar();
    res.json({ message: 'WhatsApp desconectado' });
  } catch (error) {
    console.error('Error desconectando WhatsApp:', error);
    res.status(500).json({ error: 'Error desconectando WhatsApp' });
  }
});

// Limpiar sesión (útil cuando hay problemas)
router.post('/limpiar-sesion', verificarEmpresa, verificarRol('admin'), async (req, res) => {
  try {
    console.log(`\n🗑️  Solicitud de limpieza de sesión de usuario: ${req.usuario.email}`);
    await whatsappService.limpiarSesion(req.usuario.empresa_id);
    res.json({ message: 'Sesión limpiada. Ahora puedes conectar de nuevo.' });
  } catch (error) {
    console.error('Error limpiando sesión:', error);
    res.status(500).json({ error: 'Error limpiando sesión' });
  }
});

// Enviar mensaje de prueba
router.post('/test', verificarEmpresa, verificarRol('admin', 'operador'), async (req, res) => {
  try {
    const { numero, mensaje } = req.body;

    if (!numero || !mensaje) {
      return res.status(400).json({ error: 'Número y mensaje son requeridos' });
    }

    await whatsappService.enviarMensaje(numero, mensaje);

    res.json({ message: 'Mensaje enviado exitosamente' });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensaje personalizado a cliente
router.post('/enviar-cliente', verificarEmpresa, verificarRol('admin', 'operador'), async (req, res) => {
  try {
    const { clienteId, mensaje } = req.body;

    if (!clienteId || !mensaje) {
      return res.status(400).json({ error: 'Cliente ID y mensaje son requeridos' });
    }

    // Buscar cliente
    const { Cliente } = await import('../models/associations.js');
    const cliente = await Cliente.findOne({
      where: {
        id: clienteId,
        empresa_id: req.usuario.empresa_id
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (!cliente.telefono) {
      return res.status(400).json({ error: 'El cliente no tiene número de teléfono' });
    }

    // Enviar mensaje
    await whatsappService.enviarMensaje(cliente.telefono, mensaje);

    console.log(`✓ Mensaje personalizado enviado a ${cliente.nombre} (${cliente.telefono})`);

    res.json({
      message: 'Mensaje enviado exitosamente',
      cliente: {
        nombre: cliente.nombre,
        telefono: cliente.telefono
      }
    });
  } catch (error) {
    console.error('Error enviando mensaje a cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ejecutar envío manual de notificaciones
router.post('/enviar-notificaciones', verificarEmpresa, verificarRol('admin', 'operador'), async (req, res) => {
  try {
    // Ejecutar en background
    cronService.ejecutarManual().catch(err => {
      console.error('Error en envío manual:', err);
    });

    res.json({ message: 'Proceso de envío iniciado' });
  } catch (error) {
    console.error('Error iniciando envío:', error);
    res.status(500).json({ error: 'Error iniciando envío' });
  }
});

export default router;
