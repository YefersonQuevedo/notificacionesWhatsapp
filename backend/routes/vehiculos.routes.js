import express from 'express';
import { Vehiculo, Cliente, Notificacion } from '../models/associations.js';
import { verificarToken, verificarEmpresa } from '../middleware/auth.js';
import { crearNotificacionesVehiculo } from '../utils/recordatorios.js';
import { Op } from 'sequelize';

const router = express.Router();

router.use(verificarToken);

// Listar vehículos
router.get('/', verificarEmpresa, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', cliente_id } = req.query;
    const offset = (page - 1) * limit;

    const where = { empresa_id: req.usuario.empresa_id };

    if (search) {
      where.placa = { [Op.like]: `%${search}%` };
    }

    if (cliente_id) {
      where.cliente_id = cliente_id;
    }

    const { count, rows } = await Vehiculo.findAndCountAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: Notificacion,
          as: 'notificaciones',
          where: { enviado: false },
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_vencimiento_soat', 'ASC']]
    });

    res.json({
      vehiculos: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    res.status(500).json({ error: 'Error obteniendo vehículos' });
  }
});

// Obtener vehículo por ID
router.get('/:id', verificarEmpresa, async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findOne({
      where: {
        id: req.params.id,
        empresa_id: req.usuario.empresa_id
      },
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: Notificacion,
          as: 'notificaciones',
          order: [['fecha_programada', 'ASC']]
        }
      ]
    });

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (error) {
    console.error('Error obteniendo vehículo:', error);
    res.status(500).json({ error: 'Error obteniendo vehículo' });
  }
});

// Crear vehículo
router.post('/', verificarEmpresa, async (req, res) => {
  try {
    const { placa, cliente_id, fecha_compra_soat, fecha_vencimiento_soat } = req.body;

    if (!placa || !fecha_compra_soat || !fecha_vencimiento_soat) {
      return res.status(400).json({
        error: 'Placa, fecha de compra y fecha de vencimiento son requeridas'
      });
    }

    const vehiculo = await Vehiculo.create({
      empresa_id: req.usuario.empresa_id,
      cliente_id,
      placa,
      fecha_compra_soat,
      fecha_vencimiento_soat,
      activo: true
    });

    // Crear notificaciones automáticamente
    await crearNotificacionesVehiculo(vehiculo.id);

    res.status(201).json(vehiculo);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un vehículo con esa placa' });
    }
    console.error('Error creando vehículo:', error);
    res.status(500).json({ error: 'Error creando vehículo' });
  }
});

// Actualizar vehículo
router.put('/:id', verificarEmpresa, async (req, res) => {
  try {
    const { cliente_id, fecha_compra_soat, fecha_vencimiento_soat, activo } = req.body;

    const vehiculo = await Vehiculo.findOne({
      where: {
        id: req.params.id,
        empresa_id: req.usuario.empresa_id
      }
    });

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const fechaVencimientoAnterior = vehiculo.fecha_vencimiento_soat;

    await vehiculo.update({
      cliente_id,
      fecha_compra_soat,
      fecha_vencimiento_soat,
      activo
    });

    // Si cambió la fecha de vencimiento, recrear notificaciones
    if (fecha_vencimiento_soat && fecha_vencimiento_soat !== fechaVencimientoAnterior) {
      // Eliminar notificaciones viejas no enviadas
      await Notificacion.destroy({
        where: {
          vehiculo_id: vehiculo.id,
          enviado: false
        }
      });

      // Crear nuevas notificaciones
      await crearNotificacionesVehiculo(vehiculo.id);
    }

    res.json(vehiculo);
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    res.status(500).json({ error: 'Error actualizando vehículo' });
  }
});

// Eliminar vehículo
router.delete('/:id', verificarEmpresa, async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findOne({
      where: {
        id: req.params.id,
        empresa_id: req.usuario.empresa_id
      }
    });

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    await vehiculo.destroy();

    res.json({ message: 'Vehículo eliminado' });
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    res.status(500).json({ error: 'Error eliminando vehículo' });
  }
});

// Obtener vehículos próximos a vencer
router.get('/dashboard/proximos-vencer', verificarEmpresa, async (req, res) => {
  try {
    // Obtener días del query param, por defecto 30
    const dias = parseInt(req.query.dias) || 30;

    // Validar que sea un número razonable (entre 1 y 365 días)
    if (dias < 1 || dias > 365) {
      return res.status(400).json({ error: 'Los días deben estar entre 1 y 365' });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const enXDias = new Date();
    enXDias.setDate(enXDias.getDate() + dias);
    enXDias.setHours(23, 59, 59, 999);

    const vehiculos = await Vehiculo.findAll({
      where: {
        empresa_id: req.usuario.empresa_id,
        activo: true,
        fecha_vencimiento_soat: {
          [Op.between]: [hoy, enXDias]
        }
      },
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: Notificacion,
          as: 'notificaciones',
          separate: true,
          order: [['fecha_envio', 'DESC']],
          limit: 1
        }
      ],
      order: [['fecha_vencimiento_soat', 'ASC']]
    });

    res.json({
      vehiculos,
      filtro: {
        dias,
        desde: hoy,
        hasta: enXDias
      }
    });
  } catch (error) {
    console.error('Error obteniendo vehículos próximos a vencer:', error);
    res.status(500).json({ error: 'Error obteniendo vehículos' });
  }
});

export default router;
