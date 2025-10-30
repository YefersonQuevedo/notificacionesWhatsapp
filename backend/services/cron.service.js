import cron from 'node-cron';
import {
  obtenerNotificacionesPendientes,
  generarMensajeRecordatorio,
  marcarNotificacionEnviada,
  verificarYCrearNotificaciones
} from '../utils/recordatorios.js';
import whatsappService from './whatsapp.service.js';

class CronService {
  constructor() {
    this.jobs = [];
  }

  iniciar() {
    console.log('Iniciando servicios cron...');

    // Cron 1: Enviar notificaciones pendientes (cada hora durante horario laboral)
    // Corre de lunes a viernes, de 8am a 6pm
    const jobNotificaciones = cron.schedule('0 8-18 * * 1-5', async () => {
      await this.enviarNotificacionesPendientes();
    });

    // Cron 2: Verificar y crear notificaciones nuevas (cada día a las 7am)
    const jobVerificacion = cron.schedule('0 7 * * *', async () => {
      console.log('Verificando nuevas notificaciones...');
      await verificarYCrearNotificaciones();
    });

    this.jobs.push(jobNotificaciones, jobVerificacion);

    console.log('✓ Servicios cron iniciados:');
    console.log('  - Envío de notificaciones: Lunes-Viernes 8am-6pm cada hora');
    console.log('  - Verificación de nuevas notificaciones: Diario a las 7am');
  }

  async enviarNotificacionesPendientes() {
    try {
      console.log('Buscando notificaciones pendientes...');

      if (!whatsappService.isConnected) {
        console.log('⚠️ WhatsApp no conectado, saltando envío de notificaciones');
        return;
      }

      const notificaciones = await obtenerNotificacionesPendientes();

      if (notificaciones.length === 0) {
        console.log('No hay notificaciones pendientes');
        return;
      }

      console.log(`Enviando ${notificaciones.length} notificaciones...`);

      for (const notificacion of notificaciones) {
        try {
          const mensaje = await generarMensajeRecordatorio(notificacion);
          const telefono = notificacion.vehiculo.cliente.telefono;

          if (!telefono) {
            console.log(`⚠️ Cliente sin teléfono: ${notificacion.vehiculo.cliente.nombre}`);
            await marcarNotificacionEnviada(
              notificacion.id,
              mensaje,
              'Cliente sin número de teléfono'
            );
            continue;
          }

          // Enviar mensaje
          await whatsappService.enviarMensaje(telefono, mensaje);

          // Marcar como enviado
          await marcarNotificacionEnviada(notificacion.id, mensaje);

          console.log(`✓ Notificación enviada a ${notificacion.vehiculo.cliente.nombre}`);

          // Esperar 2 segundos entre mensajes para no saturar
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`✗ Error enviando notificación ${notificacion.id}:`, error.message);
          await marcarNotificacionEnviada(
            notificacion.id,
            await generarMensajeRecordatorio(notificacion),
            error.message
          );
        }
      }

      console.log(`✓ Proceso completado. ${notificaciones.length} notificaciones procesadas.`);

    } catch (error) {
      console.error('Error en cron de notificaciones:', error);
    }
  }

  // Método para ejecutar manualmente (útil para testing)
  async ejecutarManual() {
    console.log('Ejecutando envío manual de notificaciones...');
    await this.enviarNotificacionesPendientes();
  }

  detener() {
    this.jobs.forEach(job => job.stop());
    console.log('✓ Servicios cron detenidos');
  }
}

const cronService = new CronService();
export default cronService;
