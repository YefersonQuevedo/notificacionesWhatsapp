import express from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import Empresa from '../models/Empresa.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario con su empresa
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['id', 'nombre', 'telefono_whatsapp', 'activo']
      }]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    if (!usuario.empresa.activo) {
      return res.status(401).json({ error: 'Empresa inactiva' });
    }

    // Verificar contraseña
    const passwordValido = await usuario.validarPassword(password);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        empresa_id: usuario.empresa_id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresa: {
          id: usuario.empresa.id,
          nombre: usuario.empresa.nombre
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Registro (solo para crear primera empresa)
router.post('/registro', async (req, res) => {
  try {
    const { email, password, nombre, nombreEmpresa, ruc, telefonoWhatsapp } = req.body;

    // Validaciones
    if (!email || !password || !nombre || !nombreEmpresa) {
      return res.status(400).json({
        error: 'Email, contraseña, nombre y nombre de empresa son requeridos'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear empresa
    const empresa = await Empresa.create({
      nombre: nombreEmpresa,
      ruc,
      telefono_whatsapp: telefonoWhatsapp,
      activo: true
    });

    // Crear usuario admin
    const usuario = await Usuario.create({
      empresa_id: empresa.id,
      email,
      password_hash: password, // Se hashea automáticamente en el hook
      nombre,
      rol: 'admin',
      activo: true
    });

    // Generar token
    const token = jwt.sign(
      {
        id: usuario.id,
        empresa_id: usuario.empresa_id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresa: {
          id: empresa.id,
          nombre: empresa.nombre
        }
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

export default router;
