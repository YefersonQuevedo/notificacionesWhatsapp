import express from 'express';
import { Op } from 'sequelize';
import { Cliente, Vehiculo } from '../models/associations.js';
import { verificarToken, verificarEmpresa } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Listar clientes de la empresa
router.get('/', verificarEmpresa, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = { empresa_id: req.usuario.empresa_id };

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { cedula: { [Op.like]: `%${search}%` } },
        { telefono: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Cliente.findAndCountAll({
      where,
      include: [{
        model: Vehiculo,
        as: 'vehiculos'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      clientes: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error obteniendo clientes' });
  }
});

// Obtener cliente por ID
router.get('/:id', verificarEmpresa, async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: {
        id: req.params.id,
        empresa_id: req.usuario.empresa_id
      },
      include: [{
        model: Vehiculo,
        as: 'vehiculos'
      }]
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error obteniendo cliente' });
  }
});

// Crear cliente
router.post('/', verificarEmpresa, async (req, res) => {
  try {
    const { cedula, nombre, telefono, tipo_documento } = req.body;

    if (!cedula || !nombre) {
      return res.status(400).json({ error: 'Cédula y nombre son requeridos' });
    }

    const cliente = await Cliente.create({
      empresa_id: req.usuario.empresa_id,
      cedula,
      nombre,
      telefono,
      tipo_documento
    });

    res.status(201).json(cliente);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un cliente con esa cédula' });
    }
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: 'Error creando cliente' });
  }
});

// Actualizar cliente
router.put('/:id', verificarEmpresa, async (req, res) => {
  try {
    const { nombre, telefono, tipo_documento } = req.body;

    const cliente = await Cliente.findOne({
      where: {
        id: req.params.id,
        empresa_id: req.usuario.empresa_id
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await cliente.update({ nombre, telefono, tipo_documento });

    res.json(cliente);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: 'Error actualizando cliente' });
  }
});

// Eliminar cliente
router.delete('/:id', verificarEmpresa, async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: {
        id: req.params.id,
        empresa_id: req.usuario.empresa_id
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await cliente.destroy();

    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: 'Error eliminando cliente' });
  }
});

export default router;
