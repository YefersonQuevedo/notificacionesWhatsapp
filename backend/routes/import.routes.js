import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sequelize from '../models/index.js';
import { verificarToken, verificarEmpresa, verificarRol } from '../middleware/auth.js';
import { importarCSV } from '../utils/csvParser.js';

const router = express.Router();

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Solo se permiten archivos CSV'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

router.use(verificarToken);

// Importar CSV
router.post(
  '/csv',
  verificarEmpresa,
  verificarRol('admin', 'operador'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo' });
      }

      console.log(`Importando archivo: ${req.file.originalname}`);

      const resultado = await importarCSV(
        req.file.path,
        req.usuario.empresa_id,
        req.file.originalname
      );

      // Eliminar archivo temporal
      fs.unlinkSync(req.file.path);

      res.json({
        message: 'Importación completada exitosamente',
        ...resultado
      });

    } catch (error) {
      // Limpiar archivo en caso de error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Error importando CSV:', error);
      res.status(500).json({
        error: 'Error importando CSV',
        details: error.message
      });
    }
  }
);

// Obtener historial de importaciones (desde datos_brutos)
router.get('/historial', verificarEmpresa, async (req, res) => {
  try {
    const { DatoBruto } = await import('../models/associations.js');

    const historial = await DatoBruto.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      attributes: [
        'archivo_origen',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_registros'],
        [sequelize.fn('MIN', sequelize.col('created_at')), 'fecha_importacion']
      ],
      group: ['archivo_origen'],
      order: [[sequelize.fn('MIN', sequelize.col('created_at')), 'DESC']]
    });

    res.json(historial);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

export default router;
