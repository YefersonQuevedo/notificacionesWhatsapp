import express from 'express';
import { verificarToken, verificarEmpresa } from '../middleware/auth.js';
import { DatoBruto } from '../models/associations.js';
import { Op } from 'sequelize';

const router = express.Router();

router.use(verificarToken);
router.use(verificarEmpresa);

// Listar datos brutos con paginación y filtros
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      archivo = '',
      fecha_desde = '',
      fecha_hasta = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      empresa_id: req.usuario.empresa_id
    };

    if (search) {
      where[Op.or] = [
        { num_doc: { [Op.like]: `%${search}%` } },
        { tipo_cliente: { [Op.like]: `%${search}%` } },
        { placa: { [Op.like]: `%${search}%` } },
        { telefonos: { [Op.like]: `%${search}%` } }
      ];
    }

    if (archivo) {
      where.archivo_origen = archivo;
    }

    if (fecha_desde) {
      where.fecha_registro = {
        ...where.fecha_registro,
        [Op.gte]: new Date(fecha_desde)
      };
    }

    if (fecha_hasta) {
      where.fecha_registro = {
        ...where.fecha_registro,
        [Op.lte]: new Date(fecha_hasta)
      };
    }

    const { count, rows } = await DatoBruto.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['fecha_registro', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      datos: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error listando datos brutos:', error);
    res.status(500).json({ error: 'Error listando datos brutos' });
  }
});

// Obtener archivos únicos importados
router.get('/archivos', async (req, res) => {
  try {
    const archivos = await DatoBruto.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      attributes: ['archivo_origen'],
      group: ['archivo_origen'],
      order: [['archivo_origen', 'DESC']]
    });

    res.json(archivos.map(a => a.archivo_origen).filter(Boolean));
  } catch (error) {
    console.error('Error obteniendo archivos:', error);
    res.status(500).json({ error: 'Error obteniendo archivos' });
  }
});

// Obtener estadísticas de datos brutos
router.get('/estadisticas', async (req, res) => {
  try {
    const { archivo = '' } = req.query;

    const where = {
      empresa_id: req.usuario.empresa_id
    };

    if (archivo) {
      where.archivo_origen = archivo;
    }

    const total = await DatoBruto.count({ where });

    const porArchivo = await DatoBruto.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      attributes: [
        'archivo_origen',
        [DatoBruto.sequelize.fn('COUNT', '*'), 'cantidad']
      ],
      group: ['archivo_origen'],
      order: [[DatoBruto.sequelize.fn('COUNT', '*'), 'DESC']]
    });

    res.json({
      total,
      porArchivo: porArchivo.map(a => ({
        archivo: a.archivo_origen,
        cantidad: parseInt(a.dataValues.cantidad)
      }))
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// Ver detalle de un dato bruto
router.get('/:id', async (req, res) => {
  try {
    const dato = await DatoBruto.findOne({
      where: {
        id: req.params.id,
        empresa_id: req.usuario.empresa_id
      }
    });

    if (!dato) {
      return res.status(404).json({ error: 'Dato no encontrado' });
    }

    res.json(dato);
  } catch (error) {
    console.error('Error obteniendo dato:', error);
    res.status(500).json({ error: 'Error obteniendo dato' });
  }
});

export default router;
