import { Vehiculo, Notificacion, Cliente, Empresa, MensajeTemplate } from '../models/associations.js';
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

// Calcular días restantes entre dos fechas
function calcularDiasRestantes(fechaVencimiento) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  const diferencia = vencimiento - hoy;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  return dias;
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
export async function generarMensajeRecordatorio(notificacion) {
  const { vehiculo, tipo_recordatorio, empresa_id } = notificacion;
  const cliente = vehiculo.cliente;

  // Calcular días REALES restantes (no usar el tipo_recordatorio estático)
  const diasRestantes = calcularDiasRestantes(vehiculo.fecha_vencimiento_soat);

  const fechaVencimiento = new Date(vehiculo.fecha_vencimiento_soat);
  const fechaFormateada = fechaVencimiento.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Generar texto descriptivo basado en días REALES restantes
  let textoTiempo = '';
  let urgencia = '';

  if (diasRestantes < 0) {
    urgencia = '🔴 ¡VENCIDA! ';
    textoTiempo = `venció hace ${Math.abs(diasRestantes)} días`;
  } else if (diasRestantes === 0) {
    urgencia = '🔴 ¡URGENTE! ';
    textoTiempo = 'vence HOY';
  } else if (diasRestantes === 1) {
    urgencia = '🔴 ¡URGENTE! ';
    textoTiempo = 'vence MAÑANA';
  } else if (diasRestantes <= 7) {
    urgencia = '⚠️ ';
    textoTiempo = `vence en ${diasRestantes} días`;
  } else {
    textoTiempo = `vence en ${diasRestantes} días`;
  }

  // Intentar obtener template personalizado de la base de datos
  let template = null;
  try {
    const templateDB = await MensajeTemplate.findOne({
      where: {
        empresa_id: empresa_id,
        tipo_recordatorio: tipo_recordatorio
      }
    });

    if (templateDB) {
      template = templateDB.template;
    }
  } catch (error) {
    console.error('Error obteniendo template personalizado:', error);
  }

  // Si no hay template personalizado, usar uno por defecto
  if (!template) {
    const mensajeDefault = `${urgencia}Hola ${cliente.nombre}!\n\n` +
      `Le recordamos que la *tecnomecánica* de su vehículo placa *${vehiculo.placa}* ` +
      `${textoTiempo}.\n\n` +
      `📅 Fecha de vencimiento: *${fechaFormateada}*\n\n` +
      `Por favor renueve su tecnomecánica a tiempo para evitar multas e inconvenientes.\n\n` +
      `¿Necesita ayuda? Responda este mensaje o contáctenos.`;
    return mensajeDefault;
  }

  // Reemplazar variables en el template personalizado
  const mensaje = template
    .replace(/\{nombre\}/g, cliente.nombre)
    .replace(/\{placa\}/g, vehiculo.placa)
    .replace(/\{dias\}/g, diasRestantes)
    .replace(/\{diasTexto\}/g, textoTiempo)
    .replace(/\{fecha\}/g, fechaFormateada)
    .replace(/\{urgencia\}/g, urgencia);

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
