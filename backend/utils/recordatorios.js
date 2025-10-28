import { Vehiculo, Notificacion, Cliente, Empresa } from '../models/associations.js';
import { Op } from 'sequelize';

// Días de anticipación para recordatorios
const DIAS_RECORDATORIO = {
  '30_dias': 30,
  '15_dias': 15,
  '7_dias': 7,
  '5_dias': 5,
  '1_dia': 1
};

// Restar días a una fecha
function restarDias(fecha, dias) {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() - dias);
  return resultado;
}

// Crear notificaciones para un vehículo
export async function crearNotificacionesVehiculo(vehiculoId) {
  try {
    const vehiculo = await Vehiculo.findByPk(vehiculoId);

    if (!vehiculo || !vehiculo.fecha_vencimiento_soat) {
      throw new Error('Vehículo no encontrado o sin fecha de vencimiento');
    }

    const notificacionesCreadas = [];
    const fechaVencimiento = new Date(vehiculo.fecha_vencimiento_soat);

    for (const [tipo, dias] of Object.entries(DIAS_RECORDATORIO)) {
      const fechaProgramada = restarDias(fechaVencimiento, dias);

      // Verificar si ya existe esta notificación
      const existe = await Notificacion.findOne({
        where: {
          vehiculo_id: vehiculoId,
          tipo_recordatorio: tipo,
          empresa_id: vehiculo.empresa_id
        }
      });

      if (!existe) {
        const notificacion = await Notificacion.create({
          empresa_id: vehiculo.empresa_id,
          vehiculo_id: vehiculoId,
          tipo_recordatorio: tipo,
          fecha_programada: fechaProgramada,
          enviado: false
        });
        notificacionesCreadas.push(notificacion);
      }
    }

    return notificacionesCreadas;
  } catch (error) {
    console.error('Error creando notificaciones:', error);
    throw error;
  }
}

// Obtener notificaciones pendientes para hoy
export async function obtenerNotificacionesPendientes() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const notificaciones = await Notificacion.findAll({
    where: {
      fecha_programada: {
        [Op.lte]: hoy
      },
      enviado: false
    },
    include: [
      {
        model: Vehiculo,
        as: 'vehiculo',
        include: [
          {
            model: Cliente,
            as: 'cliente'
          }
        ]
      },
      {
        model: Empresa,
        as: 'empresa'
      }
    ]
  });

  return notificaciones;
}

// Generar mensaje de WhatsApp
export function generarMensajeRecordatorio(notificacion) {
  const { vehiculo, tipo_recordatorio } = notificacion;
  const cliente = vehiculo.cliente;
  const diasAntes = DIAS_RECORDATORIO[tipo_recordatorio];

  const fechaVencimiento = new Date(vehiculo.fecha_vencimiento_soat);
  const fechaFormateada = fechaVencimiento.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  let urgencia = '';
  if (diasAntes === 1) {
    urgencia = '🔴 ¡URGENTE! ';
  } else if (diasAntes <= 7) {
    urgencia = '⚠️ ';
  }

  const mensaje = `${urgencia}Hola ${cliente.nombre}!\n\n` +
    `Le recordamos que la *tecnomecánica* de su vehículo placa *${vehiculo.placa}* ` +
    `vence ${diasAntes === 1 ? 'MAÑANA' : `en ${diasAntes} días`}.\n\n` +
    `📅 Fecha de vencimiento: *${fechaFormateada}*\n\n` +
    `Por favor renueve su tecnomecánica a tiempo para evitar multas e inconvenientes.\n\n` +
    `¿Necesita ayuda? Responda este mensaje o contáctenos.`;

  return mensaje;
}

// Marcar notificación como enviada
export async function marcarNotificacionEnviada(notificacionId, mensaje, error = null) {
  await Notificacion.update(
    {
      enviado: !error,
      fecha_envio: new Date(),
      mensaje_enviado: mensaje,
      error: error
    },
    {
      where: { id: notificacionId }
    }
  );
}

// Verificar y crear notificaciones para todos los vehículos activos
export async function verificarYCrearNotificaciones() {
  try {
    const vehiculos = await Vehiculo.findAll({
      where: { activo: true }
    });

    let notificacionesCreadas = 0;

    for (const vehiculo of vehiculos) {
      const notificaciones = await crearNotificacionesVehiculo(vehiculo.id);
      notificacionesCreadas += notificaciones.length;
    }

    console.log(`✓ Verificación completada. ${notificacionesCreadas} notificaciones creadas.`);
    return notificacionesCreadas;
  } catch (error) {
    console.error('Error verificando notificaciones:', error);
    throw error;
  }
}
