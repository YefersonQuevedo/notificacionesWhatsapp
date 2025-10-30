import express from 'express';
import { MensajeTemplate } from '../models/associations.js';
import { verificarToken, verificarEmpresa } from '../middleware/auth.js';

const router = express.Router();

router.use(verificarToken);

// Obtener todos los templates de la empresa
router.get('/', verificarEmpresa, async (req, res) => {
  try {
    const templates = await MensajeTemplate.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      order: [
        ['tipo_recordatorio', 'DESC'] // 30_dias, 15_dias, 7_dias, 5_dias, 1_dia
      ]
    });

    // Si no existen, crear templates por defecto
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          empresa_id: req.usuario.empresa_id,
          tipo_recordatorio: '30_dias',
          template: 'Hola {nombre}! Le recordamos que la tecnomecánica de su vehículo {placa} {diasTexto} ({fecha}). ¡Renuévela a tiempo!'
        },
        {
          empresa_id: req.usuario.empresa_id,
          tipo_recordatorio: '15_dias',
          template: 'Hola {nombre}! {urgencia}La tecnomecánica de su vehículo {placa} {diasTexto} ({fecha}). ¡No olvide renovarla!'
        },
        {
          empresa_id: req.usuario.empresa_id,
          tipo_recordatorio: '7_dias',
          template: 'Hola {nombre}! {urgencia}La tecnomecánica de su vehículo {placa} {diasTexto} ({fecha}). ¡Quedan pocos días!'
        },
        {
          empresa_id: req.usuario.empresa_id,
          tipo_recordatorio: '5_dias',
          template: 'Hola {nombre}! {urgencia}La tecnomecánica de su vehículo {placa} {diasTexto} ({fecha}). ¡Es urgente renovarla!'
        },
        {
          empresa_id: req.usuario.empresa_id,
          tipo_recordatorio: '1_dia',
          template: 'Hola {nombre}! {urgencia}La tecnomecánica de su vehículo {placa} {diasTexto} ({fecha}). ¡¡ÚLTIMA OPORTUNIDAD!!'
        }
      ];

      const createdTemplates = await MensajeTemplate.bulkCreate(defaultTemplates);
      return res.json(createdTemplates);
    }

    res.json(templates);
  } catch (error) {
    console.error('Error obteniendo templates:', error);
    res.status(500).json({ error: 'Error obteniendo templates' });
  }
});

// Actualizar un template específico
router.put('/:tipo_recordatorio', verificarEmpresa, async (req, res) => {
  try {
    const { tipo_recordatorio } = req.params;
    const { template } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'El template es requerido' });
    }

    // Buscar el template
    let mensajeTemplate = await MensajeTemplate.findOne({
      where: {
        empresa_id: req.usuario.empresa_id,
        tipo_recordatorio
      }
    });

    if (!mensajeTemplate) {
      // Si no existe, crear uno nuevo
      mensajeTemplate = await MensajeTemplate.create({
        empresa_id: req.usuario.empresa_id,
        tipo_recordatorio,
        template
      });
    } else {
      // Si existe, actualizar
      await mensajeTemplate.update({ template });
    }

    res.json(mensajeTemplate);
  } catch (error) {
    console.error('Error actualizando template:', error);
    res.status(500).json({ error: 'Error actualizando template' });
  }
});

export default router;
