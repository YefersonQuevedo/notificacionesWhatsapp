import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario y verificar que esté activo
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Token inválido o usuario inactivo' });
    }

    // Agregar datos del usuario al request
    req.usuario = {
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Error al verificar token' });
  }
};

export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción'
      });
    }
    next();
  };
};

export const verificarEmpresa = (req, res, next) => {
  // Middleware para asegurar que el usuario solo acceda a datos de su empresa
  const empresaIdParam = req.params.empresa_id || req.body.empresa_id;

  if (empresaIdParam && parseInt(empresaIdParam) !== req.usuario.empresa_id) {
    return res.status(403).json({
      error: 'No puedes acceder a datos de otra empresa'
    });
  }

  next();
};
